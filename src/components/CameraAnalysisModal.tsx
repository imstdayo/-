import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Layers, 
  Plus,
  ArrowRight,
  ArrowLeft,
  CameraOff,
  Image as ImageIcon
} from 'lucide-react';
import { CameraAnalysisResult } from '../types';
import { SAMPLE_TEST_PAPERS } from '../initialData';
import { acquireCameraStream, readAndCompressImageFile } from '../lib/cameraUtils';

interface CameraAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveResult: (result: CameraAnalysisResult) => void;
  onAddWeaknessToScope?: (topic: string, subject: string) => void;
}

export const CameraAnalysisModal: React.FC<CameraAnalysisModalProps> = ({
  isOpen,
  onClose,
  onSaveResult,
  onAddWeaknessToScope
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraDeviceNotFound, setCameraDeviceNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [subjectHint, setSubjectHint] = useState('数学');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CameraAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start webcam with safe fallback handling
  const startCamera = async () => {
    setIsCameraLoading(true);
    setErrorMsg(null);
    setCameraDeviceNotFound(false);

    try {
      const result = await acquireCameraStream();
      if (result.stream) {
        streamRef.current = result.stream;
        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
        setErrorMsg(null);
      } else {
        setIsCameraActive(false);
        if (result.errorType === 'not_found') {
          setCameraDeviceNotFound(true);
        }
        setErrorMsg(result.errorMessage || 'カメラが検出されませんでした。');
      }
    } catch {
      setIsCameraActive(false);
      setCameraDeviceNotFound(true);
      setErrorMsg('カメラの起動に失敗しました。下の「スマホのカメラを直接起動」または画像選択をご利用ください。');
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  // Capture frame from webcam
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
    } catch (e) {
      console.error('Frame capture failed:', e);
      setErrorMsg('写真の取り込みに失敗しました。もう一度お試しください。');
    }
  };

  // Handle file upload with high-res smartphone photo compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMsg(null);

    try {
      // Compress smartphone photo (downscale 1600px max, JPEG 0.85) to avoid payload limits
      const compressedDataUrl = await readAndCompressImageFile(file, 1600, 0.85);
      setSelectedImage(compressedDataUrl);
      stopCamera();
    } catch (err: any) {
      console.error('Image compression error:', err);
      // Fallback to direct FileReader
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingFile(false);
      // Reset input value so user can re-upload same file if desired
      e.target.value = '';
    }
  };

  // Select sample image
  const handleSelectSample = (sample: typeof SAMPLE_TEST_PAPERS[0]) => {
    setSelectedImage(sample.previewUrl);
    setSubjectHint(sample.subject);
  };

  // Back navigation handler requested by user
  const handleBack = () => {
    setErrorMsg(null);
    if (analysisResult) {
      // Return from results view back to photo selection
      setAnalysisResult(null);
    } else if (selectedImage) {
      // Return from preview back to capture/selection
      setSelectedImage(null);
    } else {
      // Close modal
      stopCamera();
      onClose();
    }
  };

  // Run Gemini analysis
  const runAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          subjectHint: subjectHint
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || '答案用紙のAI分析に失敗しました');
      }

      const data = await res.json();
      const newResult: CameraAnalysisResult = {
        id: 'analysis_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        subject: data.subject || subjectHint,
        overallScoreAssessment: data.overallScoreAssessment || '分析完了',
        identifiedWeaknesses: data.identifiedWeaknesses || [],
        identifiedStrengths: data.identifiedStrengths || [],
        actionPlan: data.actionPlan || [],
        imagePreview: selectedImage
      };

      setAnalysisResult(newResult);
      onSaveResult(newResult);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '分析処理中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-4 sm:my-8">
        
        {/* Hidden inputs specifically engineered for 100% reliable mobile camera and file capture */}
        <input
          ref={cameraInputRef}
          id="mobile-camera-capture-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          style={{ position: 'fixed', top: '-1000px', left: '-1000px', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }}
        />
        <input
          ref={fileInputRef}
          id="mobile-file-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ position: 'fixed', top: '-1000px', left: '-1000px', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }}
        />

        {/* Header with Back Button */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 transition shrink-0"
              title="前の画面に戻る"
              aria-label="戻る"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>戻る</span>
            </button>

            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate flex items-center gap-1.5">
                <span>答案・ワークのAI弱点分析</span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                  AI画像診断
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                テスト答案やワークの間違えた問題を撮影するだけで、弱点単元と対策を自動抽出
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
            title="閉じる"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing overlay for smartphone photo reading */}
        {isProcessingFile && (
          <div className="my-6 p-6 rounded-xl bg-blue-50/70 border border-blue-200 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-blue-900">写真を最適化して読み込み中…</p>
            <p className="text-[11px] text-blue-700">高画質写真をAI分析用に素早く調整しています</p>
          </div>
        )}

        {/* Source Tab Selector */}
        {!analysisResult && !isProcessingFile && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => {
                  stopCamera();
                  setActiveTab('camera');
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'camera' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>カメラ撮影</span>
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setActiveTab('upload');
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>画像選択</span>
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setActiveTab('samples');
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'samples' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>サンプル</span>
              </button>
            </div>

            {/* Tab: Camera */}
            {activeTab === 'camera' && (
              <div className="space-y-3">
                {/* Mobile Direct Camera Trigger (100% reliable direct click trigger on iOS & Android) */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                  <div className="text-center sm:text-left">
                    <span className="text-xs font-bold text-blue-900 flex items-center justify-center sm:justify-start gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      スマホのカメラで答案を撮影
                    </span>
                    <span className="text-[11px] text-blue-700 block mt-0.5">
                      標準カメラアプリを直接起動してピントの合った鮮明な答案を撮影できます
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    カメラを起動して撮影
                  </button>
                </div>

                {/* Quick Album Picker Button for Convenience */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  保存済みの写真・アルバムから選ぶ場合はこちら
                </button>

                {/* Inline Webcam Stream option (for PC / browsers supporting getUserMedia) */}
                {isCameraActive ? (
                  <div className="space-y-3 pt-1">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={capturePhoto}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        この写真を撮影して分析
                      </button>
                      <button
                        onClick={startCamera}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                        title="カメラを再起動"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : isCameraLoading ? (
                  <div className="rounded-xl bg-slate-900 aspect-video flex flex-col items-center justify-center text-white gap-2 p-6">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="text-xs font-semibold">Webカメラを検出中…</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center">
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      PCブラウザのWebカメラを使用したい場合：
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-bold shadow-2xs transition inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      ブラウザ内Webカメラを起動
                    </button>
                  </div>
                )}

                {/* Back Button on Camera Tab */}
                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    戻る（画面を閉じる）
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                {/* Mobile-friendly native file/gallery pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition flex items-center gap-3 shadow-2xs text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">写真アルバムから選択</span>
                      <span className="text-[11px] text-slate-500">スマホ内の写真やスクリーンショット</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition flex items-center gap-3 shadow-2xs text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">今すぐカメラで撮影</span>
                      <span className="text-[11px] text-slate-500">答案用紙を新しく撮影する</span>
                    </div>
                  </button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 sm:p-8 text-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/20"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    タップしてファイル・写真を選択（またはドラッグ＆ドロップ）
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, HEIC, WebP 対応</p>
                </div>

                {/* Back Button on Upload Tab */}
                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    戻る（画面を閉じる）
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Samples */}
            {activeTab === 'samples' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  お手元に答案用紙がなくても、実際のテスト答案サンプルを選んで即座に診断できます：
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_TEST_PAPERS.map(sample => (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        selectedImage === sample.previewUrl
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="h-24 sm:h-28 rounded-lg overflow-hidden mb-2 bg-slate-100 border border-slate-100">
                        <img
                          src={sample.previewUrl}
                          alt={sample.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {sample.subject}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                          {sample.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                          {sample.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Image Preview & Action Controls */}
            {selectedImage && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">選択された答案画像</span>
                      <span className="text-[11px] text-slate-500">Gemini 3.8 Flash で弱点と対策を分析します</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200 transition font-medium flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    選び直す
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AIが答案を分析中…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        この答案を分析して弱点を抽出！
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    戻る
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="mt-4 space-y-4">
            {/* Top result navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>答案選択に戻る</span>
              </button>
              <span className="text-xs text-slate-500">{analysisResult.date} 分析</span>
            </div>

            {/* Header / Subject & Overall Score Assessment */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-900">
                  【{analysisResult.subject}】AI診断結果
                </span>
                <span className="text-[10px] text-amber-800 bg-white px-2 py-0.5 rounded font-bold border border-amber-200">
                  診断完了
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {analysisResult.overallScoreAssessment}
              </p>
            </div>

            {/* Identified Weaknesses */}
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                発見された弱点・失点単元 (要復習)
              </span>
              <div className="space-y-2">
                {analysisResult.identifiedWeaknesses.map((w, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/70 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-rose-900">{w.topic}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                        {w.severity}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{w.explanation}</p>
                    {onAddWeaknessToScope && (
                      <button
                        onClick={() => onAddWeaknessToScope(w.topic, analysisResult.subject)}
                        className="mt-2 text-[11px] font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> テスト範囲のチェックリストに追加する
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Strengths */}
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                定着している強み・良くできている点
              </span>
              <div className="space-y-1.5">
                {analysisResult.identifiedStrengths.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-xs text-slate-700">
                    <strong className="text-emerald-900 font-bold block">{s.topic}</strong>
                    <span className="text-slate-600">{s.explanation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plan */}
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                テストで点数を跳ね上げる具体的アクションプラン
              </span>
              <div className="space-y-2">
                {analysisResult.actionPlan.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>戻る</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              >
                完了して閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
