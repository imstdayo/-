import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  LogOut, 
  Layers, 
  Send,
  Search,
  Check,
  Bell,
  Trash2,
  LayoutDashboard
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { 
  ClassroomCourse, 
  ClassroomCourseWork, 
  ClassroomAnnouncement, 
  SubmissionDeadline, 
  TestScope, 
  SubjectScope,
  DailyStudyTask 
} from '../types';
import { 
  getCourses, 
  getCourseWork, 
  getCourseAnnouncements, 
  turnInCourseWork 
} from '../services/classroomService';
import { googleSignIn, logout } from '../lib/classroomAuth';

interface ClassroomViewProps {
  googleUser: User | null;
  accessToken: string | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  testScope: TestScope;
  deadlines: SubmissionDeadline[];
  onAddDeadline: (deadline: SubmissionDeadline) => void;
  onAddSubject: (subject: SubjectScope) => void;
  onAddDailyTask: (task: Omit<DailyStudyTask, 'id' | 'completed'>) => void;
  onNavigateTab?: (tab: string) => void;
  onApplyAIClassroomData?: (data: {
    testTitle: string;
    startDate: string;
    endDate: string;
    subjects: SubjectScope[];
    deadlines: SubmissionDeadline[];
    dailyTasks: DailyStudyTask[];
    overallSummary: string;
  }) => void;
}

// Sample demo data for instant preview when no live courses are found
const DEMO_CLASSROOM_COURSES: ClassroomCourse[] = [
  {
    id: 'demo_course_math',
    name: '数学II・B (高校2年 理系)',
    section: '2年3組',
    descriptionHeading: '微分積分・数列・ベクトル',
    room: '第1講義室',
    alternateLink: 'https://classroom.google.com',
    courseState: 'ACTIVE',
    courseColor: 'emerald'
  },
  {
    id: 'demo_course_eng',
    name: '英語コミュニケーションII',
    section: '共通',
    descriptionHeading: 'Reading & Academic Writing',
    room: 'LL教室',
    alternateLink: 'https://classroom.google.com',
    courseState: 'ACTIVE',
    courseColor: 'blue'
  },
  {
    id: 'demo_course_sci',
    name: '物理基礎・化学基礎',
    section: '特進コース',
    descriptionHeading: '力学・電磁気・酸化還元',
    room: '理科実験室',
    alternateLink: 'https://classroom.google.com',
    courseState: 'ACTIVE',
    courseColor: 'purple'
  }
];

const DEMO_CLASSROOM_WORKS: ClassroomCourseWork[] = [
  {
    id: 'demo_work_1',
    courseId: 'demo_course_math',
    courseName: '数学II・B (高校2年 理系)',
    title: '第3章「微分の応用」確認テスト演習プリント',
    description: '教科書p.80〜84の増減表作成と極値計算。大問1〜4をノートに解いて提出してください。中間考査の頻出単元です。',
    state: 'PUBLISHED',
    workType: 'ASSIGNMENT',
    formattedDueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dueDate: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 2
    },
    dueTime: { hours: 23, minutes: 59 },
    maxPoints: 100,
    submissionState: 'CREATED',
    alternateLink: 'https://classroom.google.com'
  },
  {
    id: 'demo_work_2',
    courseId: 'demo_course_eng',
    courseName: '英語コミュニケーションII',
    title: 'Unit 4 Summary Essay: Global Climate Action',
    description: 'Please read Text A and write a 150-word summary essay. Include your opinion on carbon reduction.',
    state: 'PUBLISHED',
    workType: 'ASSIGNMENT',
    formattedDueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    dueDate: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 4
    },
    dueTime: { hours: 17, minutes: 0 },
    maxPoints: 50,
    submissionState: 'CREATED',
    alternateLink: 'https://classroom.google.com'
  },
  {
    id: 'demo_work_3',
    courseId: 'demo_course_sci',
    courseName: '物理基礎・化学基礎',
    title: '力学的エネルギー保存則 実験レポート',
    description: '振り子の運動とエネルギー変換の考察。グラフ用紙を添付して提出してください。',
    state: 'PUBLISHED',
    workType: 'ASSIGNMENT',
    formattedDueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    dueDate: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 6
    },
    dueTime: { hours: 8, minutes: 30 },
    maxPoints: 100,
    submissionState: 'TURNED_IN',
    alternateLink: 'https://classroom.google.com'
  }
];

const DEMO_ANNOUNCEMENTS: ClassroomAnnouncement[] = [
  {
    id: 'demo_ann_1',
    courseId: 'demo_course_math',
    courseName: '数学II・B (高校2年 理系)',
    text: '【重要】来週の中間考査範囲が決定しました。微分法（極値・最大最小）と等差・等比数列です。各自Classroomの資料フォルダを確認してください。',
    updateTime: new Date(Date.now() - 86400000).toISOString(),
    alternateLink: 'https://classroom.google.com'
  },
  {
    id: 'demo_ann_2',
    courseId: 'demo_course_eng',
    courseName: '英語コミュニケーションII',
    text: 'Unit 4のリスニング音声ファイルをクラスのドライブフォルダにアップロードしました。通学時のシャドーイング練習に活用してください。',
    updateTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    alternateLink: 'https://classroom.google.com'
  }
];

export const ClassroomView: React.FC<ClassroomViewProps> = ({
  googleUser,
  accessToken,
  onLoginSuccess,
  onLogout,
  testScope,
  deadlines,
  onAddDeadline,
  onAddSubject,
  onAddDailyTask,
  onNavigateTab,
  onApplyAIClassroomData
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [courseWorks, setCourseWorks] = useState<ClassroomCourseWork[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'turned_in'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'assignments' | 'courses' | 'announcements'>('assignments');
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // AI Analysis & Zero Reset state
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState<string>('');
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const [aiAnalysisSuccess, setAiAnalysisSuccess] = useState<any | null>(null);
  const [customPostInput, setCustomPostInput] = useState('');
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);

  // Load data when access token changes
  useEffect(() => {
    if (accessToken) {
      loadLiveClassroomData(accessToken);
    } else {
      // Load demo data so UI is immediately rich and testable
      setCourses(DEMO_CLASSROOM_COURSES);
      setCourseWorks(DEMO_CLASSROOM_WORKS);
      setAnnouncements(DEMO_ANNOUNCEMENTS);
    }
  }, [accessToken]);

  const loadLiveClassroomData = async (token: string) => {
    setIsLoadingData(true);
    setLoginError(null);
    try {
      const liveCourses = await getCourses(token);
      if (liveCourses.length > 0) {
        setCourses(liveCourses);
        // Fetch coursework for all courses
        const worksPromises = liveCourses.map(c => getCourseWork(token, c.id, c.name));
        const announcementsPromises = liveCourses.map(c => getCourseAnnouncements(token, c.id, c.name));

        const allWorksArrays = await Promise.all(worksPromises);
        const allAnnouncementsArrays = await Promise.all(announcementsPromises);

        const mergedWorks = allWorksArrays.flat();
        const mergedAnnouncements = allAnnouncementsArrays.flat();

        setCourseWorks(mergedWorks.length > 0 ? mergedWorks : DEMO_CLASSROOM_WORKS);
        setAnnouncements(mergedAnnouncements.length > 0 ? mergedAnnouncements : DEMO_ANNOUNCEMENTS);
      } else {
        // Active Google account has no current courses, fallback gracefully to preview demo courses
        setCourses(DEMO_CLASSROOM_COURSES);
        setCourseWorks(DEMO_CLASSROOM_WORKS);
        setAnnouncements(DEMO_ANNOUNCEMENTS);
      }
    } catch (err: any) {
      console.warn('Classroom API fetch error, utilizing fallback courses:', err);
      setLoginError(err.message || 'Classroomのデータ取得でエラーが発生しました');
      setCourses(DEMO_CLASSROOM_COURSES);
      setCourseWorks(DEMO_CLASSROOM_WORKS);
      setAnnouncements(DEMO_ANNOUNCEMENTS);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onLoginSuccess(result.user, result.accessToken);
        setSyncSuccessMessage('Google Classroomと正常に接続しました！');
        setTimeout(() => setSyncSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Login failure:', err);
      setLoginError(err.message || 'Google認証に失敗しました');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
    setCourses(DEMO_CLASSROOM_COURSES);
    setCourseWorks(DEMO_CLASSROOM_WORKS);
    setAnnouncements(DEMO_ANNOUNCEMENTS);
  };

  // Run Gemini 3.8 Flash AI Analysis on Classroom data and apply to home / test scope
  const handleRunAIClassroomAnalysis = async (specificPostText?: string) => {
    setIsAIAnalyzing(true);
    setAiAnalysisError(null);
    setAiAnalysisSuccess(null);
    setAiAnalysisStep('Google Classroomの投稿・課題・連絡事項を収集中...');

    try {
      setAiAnalysisStep('Gemini 3.8 Flash が教科範囲・提出期限・今日のタスクをAI解析中...');

      const postBody = {
        courses: courses.map(c => ({ 
          id: c.id, 
          name: c.name, 
          section: c.section, 
          descriptionHeading: c.descriptionHeading 
        })),
        courseWorks: courseWorks.map(w => ({
          id: w.id,
          title: w.title,
          description: w.description,
          courseName: w.courseName,
          formattedDueDate: w.formattedDueDate,
          dueTime: w.dueTime,
          submissionState: w.submissionState
        })),
        announcements: announcements.map(a => ({
          id: a.id,
          text: a.text,
          courseName: a.courseName,
          creationTime: a.creationTime
        })),
        customPostText: specificPostText || (customPostInput.trim() ? customPostInput.trim() : undefined)
      };

      const res = await fetch('/api/ai/classroom-analyze-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'AI解析APIの呼び出しに失敗しました');
      }

      const result = await res.json();
      const payload = result.data || result;
      if (!payload || (!payload.subjects && !payload.testTitle)) {
        throw new Error(result.error || '有効な解析結果を取得できませんでした');
      }

      setAiAnalysisStep('ホーム・テスト範囲・今日やることナビに適用中...');

      if (onApplyAIClassroomData) {
        onApplyAIClassroomData(payload);
      }

      setAiAnalysisSuccess(payload);
      setSyncSuccessMessage('Google Classroomの投稿からテスト範囲と提出物をホームに完全適用しました！');
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('AI Classroom analysis error:', err);
      setAiAnalysisError(err.message || 'AI自動解析中にエラーが発生しました');
    } finally {
      setIsAIAnalyzing(false);
      setAiAnalysisStep('');
    }
  };

  // Sync a single Classroom assignment into NaviStudy Deadlines
  const handleSyncToDeadlines = (cw: ClassroomCourseWork) => {
    const isAlreadySynced = deadlines.some(d => d.title === cw.title);
    if (isAlreadySynced) {
      alert('この課題はすでに提出期限リストに登録されています。');
      return;
    }

    const dueDate = cw.formattedDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const dueTime = cw.dueTime?.hours !== undefined 
      ? `${cw.dueTime.hours.toString().padStart(2, '0')}:${(cw.dueTime.minutes || 0).toString().padStart(2, '0')}`
      : '23:59';

    const newDeadline: SubmissionDeadline = {
      id: 'dl_classroom_' + cw.id,
      title: cw.title,
      subjectId: 'sub_' + cw.courseId,
      subjectName: cw.courseName || 'Google Classroom課題',
      dueDate,
      dueTime,
      completed: cw.submissionState === 'TURNED_IN',
      notes: `Google Classroom連携課題 ${cw.alternateLink ? `(${cw.alternateLink})` : ''}`
    };

    onAddDeadline(newDeadline);
    setSyncSuccessMessage(`「${cw.title}」を提出期限リストに同期しました！`);
    setTimeout(() => setSyncSuccessMessage(null), 3000);
  };

  // Batch sync all pending coursework into deadlines
  const handleBatchSyncAll = () => {
    let count = 0;
    courseWorks.forEach(cw => {
      const isAlreadySynced = deadlines.some(d => d.title === cw.title);
      if (!isAlreadySynced && cw.submissionState !== 'TURNED_IN') {
        const dueDate = cw.formattedDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
        const dueTime = cw.dueTime?.hours !== undefined 
          ? `${cw.dueTime.hours.toString().padStart(2, '0')}:${(cw.dueTime.minutes || 0).toString().padStart(2, '0')}`
          : '23:59';

        onAddDeadline({
          id: 'dl_classroom_' + cw.id + '_' + Date.now(),
          title: cw.title,
          subjectId: 'sub_' + cw.courseId,
          subjectName: cw.courseName || 'Google Classroom課題',
          dueDate,
          dueTime,
          completed: false,
          notes: 'Google Classroom自動一括インポート'
        });
        count++;
      }
    });

    setSyncSuccessMessage(`${count}件の未完了課題をNaviStudy提出期限リストに一括登録しました！`);
    setTimeout(() => setSyncSuccessMessage(null), 4000);
  };

  // Add coursework to today's study tasks
  const handleAddToDailyTask = (cw: ClassroomCourseWork) => {
    onAddDailyTask({
      subjectName: cw.courseName || 'Classroom課題',
      topic: `${cw.title} (提出作成・見直し)`,
      estimatedMinutes: 45,
      dueDate: cw.formattedDueDate,
      category: 'important'
    });
    setSyncSuccessMessage(`「${cw.title}」を今日のやることナビに追加しました！`);
    setTimeout(() => setSyncSuccessMessage(null), 3000);
  };

  // Import course as Test Scope subject
  const handleImportCourseAsSubject = (course: ClassroomCourse) => {
    const isAlreadySubject = testScope.subjects.some(s => s.name === course.name);
    if (isAlreadySubject) {
      alert('このコースはすでにテスト範囲の対象教科に登録されています。');
      return;
    }

    const newSubject: SubjectScope = {
      id: 'sub_cr_' + course.id,
      name: course.name,
      color: course.courseColor || 'blue',
      targetScore: 80,
      currentScore: 65,
      textbookRange: `${course.name} Classroom指定単元`,
      workbookRange: '提出課題・配布プリント一式',
      handoutRange: course.descriptionHeading || 'Google Classroom配布PDF資料',
      keyTopics: ['Classroom配布プリントの復習', '提出課題の解き直し', '小テスト振り返り'],
      studiedMinutes: 0,
      items: [
        {
          id: 'item_cr_1_' + Date.now(),
          title: 'Classroom掲示板のテスト連絡事項・出題範囲確認',
          category: 'handout',
          completed: false,
          masteryLevel: 'not_started',
          notes: 'Google Classroom連携で自動生成'
        },
        {
          id: 'item_cr_2_' + Date.now(),
          title: '提出課題・ワークシートの全問解き直し',
          category: 'workbook',
          completed: false,
          masteryLevel: 'shaky',
          notes: 'Google Classroom連携で自動生成'
        }
      ]
    };

    onAddSubject(newSubject);
    setSyncSuccessMessage(`「${course.name}」をテスト範囲の教科に追加しました！`);
    setTimeout(() => setSyncSuccessMessage(null), 3000);
  };

  // Turn in assignment
  const handleTurnIn = async (cw: ClassroomCourseWork) => {
    if (!accessToken || !cw.submissionId) {
      alert('Classroomで直接提出するには、Googleアカウント連携が必要です。Google ClassroomのWeb版を開いて提出することもできます。');
      if (cw.alternateLink) {
        window.open(cw.alternateLink, '_blank');
      }
      return;
    }

    try {
      const success = await turnInCourseWork(
        accessToken,
        cw.courseId,
        cw.id,
        cw.submissionId,
        cw.title
      );
      if (success) {
        setCourseWorks(prev => prev.map(w => w.id === cw.id ? { ...w, submissionState: 'TURNED_IN' } : w));
        setSyncSuccessMessage(`「${cw.title}」を提出しました！`);
        setTimeout(() => setSyncSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || '提出処理でエラーが発生しました');
    }
  };

  // Filtered coursework
  const filteredWorks = courseWorks.filter(cw => {
    const matchesCourse = selectedCourseId === 'all' || cw.courseId === selectedCourseId;
    const matchesQuery = !searchQuery || 
      cw.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (cw.description && cw.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cw.courseName && cw.courseName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (filterStatus === 'pending') {
      matchesStatus = cw.submissionState !== 'TURNED_IN';
    } else if (filterStatus === 'turned_in') {
      matchesStatus = cw.submissionState === 'TURNED_IN';
    }

    return matchesCourse && matchesQuery && matchesStatus;
  });

  const pendingCount = courseWorks.filter(w => w.submissionState !== 'TURNED_IN').length;
  const turnedInCount = courseWorks.filter(w => w.submissionState === 'TURNED_IN').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Auth Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Google Classroom 連携ハブ
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {accessToken ? 'ライブ連携中' : 'プレビューモード'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
                学校・塾のGoogle Classroomから授業課題、提出物期限、先生の連絡事項を自動同期。テスト範囲や今日やることナビへ1タップで反映できます。
              </p>
            </div>
          </div>

          {/* Auth Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {googleUser ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(googleUser.displayName || 'G')[0]}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {googleUser.displayName || 'Googleアカウント'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                    {googleUser.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition"
                  title="Googleアカウント連携を解除"
                  id="btn-classroom-logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1">
                <GoogleSignInButton
                  onClick={handleSignIn}
                  isLoading={isLoggingIn}
                  label="Googleで連携する"
                />
                <span className="text-[10px] text-slate-400">
                  ※ 生徒・教員のアカウントで安全に認可
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sync Success / Error Notification */}
        {syncSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}

        {loginError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-medium">参加コース数</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{courses.length} 科目</div>
          </div>
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
            <span className="text-[11px] text-amber-700 font-medium">未提出の課題</span>
            <div className="text-xl font-black text-amber-900 mt-0.5">{pendingCount} 件</div>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
            <span className="text-[11px] text-emerald-700 font-medium">提出済み・完了</span>
            <div className="text-xl font-black text-emerald-900 mt-0.5">{turnedInCount} 件</div>
          </div>
          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/60">
            <span className="text-[11px] text-blue-700 font-medium">先生からの連絡事項</span>
            <div className="text-xl font-black text-blue-900 mt-0.5">{announcements.length} 件</div>
          </div>
        </div>
      </div>

      {/* 2. AI 自動認識 ＆ ゼロ化・同期コントロールカード (PROMINENT AI SYNC SECTION) */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 rounded-2xl p-5 md:p-6 text-white shadow-lg border border-indigo-500/30 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Google Classroom 投稿をAI認識して全データに適用
                  </h2>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Gemini 3.8 Flash 搭載
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Classroomに投稿された授業課題・連絡事項・シラバスをGeminiが自動認識。定期考査の教科範囲（教科書/ワーク）、提出期限リスト、今日やることナビをゼロから一括構築して適用します。
                </p>
              </div>
            </div>

            {/* Data Safety Info Badge */}
            <div className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-white/10 text-emerald-200 border border-white/15 text-xs font-bold transition flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              学習記録・ポイントは安全に保持
            </div>
          </div>

          {/* Settings & Optional Custom Post Text */}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-slate-200 font-medium">
                Classroomの課題やシラバスを反映し、学習状況を保持したまま最新化します
              </span>

              <button
                type="button"
                onClick={() => setIsCustomInputOpen(!isCustomInputOpen)}
                className="text-xs text-slate-300 hover:text-white underline flex items-center gap-1 self-start sm:self-auto"
              >
                {isCustomInputOpen ? '▲ 連絡文の直接入力を閉じる' : '▼ 先生の連絡文やテスト範囲プリントの文面を直接追加入力する'}
              </button>
            </div>

            {isCustomInputOpen && (
              <div className="space-y-2 bg-black/30 p-3.5 rounded-xl border border-white/10 animate-in fade-in">
                <div className="text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Classroomの連絡投稿文やシラバスの文章を貼り付け（任意）:</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {customPostInput.length} 文字
                  </span>
                </div>
                <textarea
                  value={customPostInput}
                  onChange={e => setCustomPostInput(e.target.value)}
                  placeholder="例: 【2学期中間考査 範囲連絡】&#10;数学: 教科書 p.80〜120、4STEP p.50〜75（提出は考査初日朝）&#10;英語: 論理表現 Lesson 4〜6、ワーク全範囲提出..."
                  rows={3}
                  className="w-full bg-slate-900/90 text-white placeholder-slate-500 text-xs rounded-lg p-2.5 border border-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            )}

            {/* Error or Progress Status */}
            {isAIAnalyzing && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                <span className="font-semibold">{aiAnalysisStep}</span>
              </div>
            )}

            {aiAnalysisError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{aiAnalysisError}</span>
                </div>
                <button
                  onClick={() => setAiAnalysisError(null)}
                  className="text-rose-300 hover:text-white text-xs underline"
                >
                  閉じる
                </button>
              </div>
            )}

            {aiAnalysisSuccess && (
              <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-400/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AIによる解析と適用が完了しました！</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono">
                    {aiAnalysisSuccess.subjects?.length || 0} 教科 / {aiAnalysisSuccess.deadlines?.length || 0} 提出物 / {aiAnalysisSuccess.dailyTasks?.length || 0} 今日のタスク
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {aiAnalysisSuccess.overallSummary}
                </p>
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  {onNavigateTab && (
                    <>
                      <button
                        onClick={() => onNavigateTab('home')}
                        className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                        ホーム画面で確認する →
                      </button>
                      <button
                        onClick={() => onNavigateTab('scope')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        テスト範囲で確認する →
                      </button>
                      <button
                        onClick={() => onNavigateTab('plan')}
                        className="px-3.5 py-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        学習計画・提出期限を見る →
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Run Button */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => handleRunAIClassroomAnalysis()}
                disabled={isAIAnalyzing}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs md:text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                id="btn-classroom-ai-analyze-sync"
              >
                {isAIAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                    <span>AIがClassroomを解析・適用中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Classroom投稿をAI認識してホーム＆テスト範囲に適用</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Action Bar: Search, Filters, Refresh, Batch Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveSubTab('assignments')}
            id="tab-classroom-assignments"
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'assignments'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            課題・提出物 ({courseWorks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('courses')}
            id="tab-classroom-courses"
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'courses'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            受講クラス ({courses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('announcements')}
            id="tab-classroom-announcements"
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'announcements'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            連絡板 ({announcements.length})
          </button>
        </div>

        {/* Action Buttons: Batch Sync & Refresh */}
        <div className="flex items-center gap-2">
          {accessToken && (
            <button
              onClick={() => loadLiveClassroomData(accessToken)}
              disabled={isLoadingData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              title="Classroomの最新データを再読み込み"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>更新</span>
            </button>
          )}

          <button
            onClick={handleBatchSyncAll}
            disabled={pendingCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs disabled:opacity-50"
            id="btn-classroom-batch-sync"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>未完了課題を一括で提出期限に追加 ({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* 3. Main View: Assignments List */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-4">
          {/* Filters & Search Row */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Course Filter Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのコース ({courseWorks.length}件)</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-500'
                  }`}
                >
                  未提出のみ ({pendingCount})
                </button>
                <button
                  onClick={() => setFilterStatus('turned_in')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filterStatus === 'turned_in' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-500'
                  }`}
                >
                  提出済み ({turnedInCount})
                </button>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="課題名・内容を検索..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Assignments Grid / List */}
          {filteredWorks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">該当する課題はありません</h3>
              <p className="text-xs text-slate-500 mt-1">
                フィルター条件を変更するか、Google Classroomの更新ボタンを押してください。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorks.map(cw => {
                const isSynced = deadlines.some(d => d.title === cw.title);
                const isTurnedIn = cw.submissionState === 'TURNED_IN';

                return (
                  <div
                    key={cw.id}
                    className={`bg-white rounded-2xl border transition hover:shadow-md flex flex-col justify-between p-5 ${
                      isTurnedIn
                        ? 'border-emerald-200/80 bg-emerald-50/10'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top Meta: Course & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-200/60 truncate max-w-[200px]">
                          {cw.courseName || 'Classroom課題'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isTurnedIn ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              提出済み
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              未提出
                            </span>
                          )}

                          {cw.maxPoints !== undefined && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {cw.assignedGrade !== undefined ? `${cw.assignedGrade}/` : ''}{cw.maxPoints}点
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {cw.title}
                      </h3>

                      {/* Description snippet */}
                      {cw.description && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {cw.description}
                        </p>
                      )}

                      {/* Due Date Indicator */}
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          提出期限:{' '}
                          <strong className="text-slate-800 font-semibold">
                            {cw.formattedDueDate || '期限指定なし'}
                          </strong>
                          {cw.dueTime?.hours !== undefined && (
                            <span className="ml-1 text-slate-600 font-mono">
                              {cw.dueTime.hours}:{cw.dueTime.minutes ? cw.dueTime.minutes.toString().padStart(2, '0') : '00'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Sync to Deadlines */}
                        <button
                          onClick={() => handleSyncToDeadlines(cw)}
                          disabled={isSynced}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                            isSynced
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                          }`}
                          title="NaviStudyの提出期限リストに追加"
                        >
                          {isSynced ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-slate-400" />
                              <span>同期済み</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>提出期限に追加</span>
                            </>
                          )}
                        </button>

                        {/* Add to today's tasks */}
                        <button
                          onClick={() => handleAddToDailyTask(cw)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                          title="今日やることナビに追加"
                        >
                          今日のタスクへ
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Turn in button (if not already turned in) */}
                        {!isTurnedIn && (
                          <button
                            onClick={() => handleTurnIn(cw)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1"
                            title="Google Classroomで提出済みにする"
                          >
                            <Send className="w-3 h-3" />
                            <span>提出する</span>
                          </button>
                        )}

                        {/* Open in Classroom external link */}
                        {cw.alternateLink && (
                          <a
                            href={cw.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                            title="Classroomで課題を開く"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Courses Tab View */}
      {activeSubTab === 'courses' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Google Classroomで受講中のクラス一覧です。「テスト範囲に追加」ボタンを押すと、このクラスをNaviStudyの定期考査・テスト範囲マネージャーへ直接取り込み、配分学習時間や対策チェックリストを自動生成できます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map(c => {
              const isAlreadyAdded = testScope.subjects.some(s => s.name === c.name);
              const courseAssignmentCount = courseWorks.filter(w => w.courseId === c.id).length;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {c.section || '受講中'}
                      </span>
                      {c.room && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {c.room}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {c.descriptionHeading || 'クラスシラバス・配布プリントあり'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>配布課題数:</span>
                      <strong className="font-bold text-slate-900">{courseAssignmentCount} 件</strong>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <button
                      onClick={() => handleImportCourseAsSubject(c)}
                      disabled={isAlreadyAdded}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        isAlreadyAdded
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      }`}
                      id={`btn-import-course-${c.id}`}
                    >
                      {isAlreadyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>テスト範囲追加済み</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>テスト範囲に追加</span>
                        </>
                      )}
                    </button>

                    {c.alternateLink && (
                      <a
                        href={c.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
                        title="Google Classroomでクラスを開く"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Announcements Tab View */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              各クラスの先生から投稿された連絡事項・テスト範囲告知・配布プリントのお知らせです。試験対策の重要アナウンスを見落とさず確認できます。
            </p>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-xs">
              現在新しい連絡事項はありません。
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map(ann => (
                <div
                  key={ann.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                      {ann.courseName || 'クラス連絡'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ann.updateTime).toLocaleDateString('ja-JP')}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {ann.text}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => handleRunAIClassroomAnalysis(ann.text)}
                      disabled={isAIAnalyzing}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200/80 cursor-pointer disabled:opacity-50"
                      title="この投稿からAIでテスト範囲を抽出してホームに適用"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      この投稿からAIでテスト範囲を認識・適用
                    </button>

                    {ann.alternateLink && (
                      <a
                        href={ann.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ml-auto"
                      >
                        <span>Classroomで確認</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
