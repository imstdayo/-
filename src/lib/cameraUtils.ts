/**
 * Utility to safely acquire webcam streams with progressive fallbacks
 * and graceful error handling for environments without cameras (e.g. desktop PCs, VMs),
 * plus image compression utility for high-resolution mobile camera photos.
 */

export interface CameraAcquireResult {
  stream: MediaStream | null;
  errorType?: 'not_found' | 'permission_denied' | 'unsupported' | 'unknown';
  errorMessage?: string;
}

/**
 * Resizes and compresses image files from smartphones (preventing 15MB+ payloads that break upload/network).
 */
export function readAndCompressImageFile(file: File, maxDimension = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => {
        // If image loading fails, fallback to raw data URL
        resolve(dataUrl);
      };
      img.onload = () => {
        let { width, height } = img;
        if (width <= 0 || height <= 0) {
          resolve(dataUrl);
          return;
        }
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function acquireCameraStream(): Promise<CameraAcquireResult> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return {
      stream: null,
      errorType: 'unsupported',
      errorMessage: 'お使いのブラウザはカメラ直接アクセスに対応していません。画像ファイルのアップロードをご利用ください。'
    };
  }

  // Progressive constraints fallback
  const constraintsList: MediaStreamConstraints[] = [
    // 1. Ideal back camera with HD dimensions
    {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    // 2. Ideal front camera or any preferred facing mode
    {
      video: {
        facingMode: { ideal: 'user' }
      }
    },
    // 3. Any basic video stream
    {
      video: true
    }
  ];

  let lastError: any = null;

  for (const constraints of constraintsList) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return { stream };
    } catch (err: any) {
      lastError = err;
      const errName = err?.name || '';

      // If user explicitly denied permission, no need to retry other constraints
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        return {
          stream: null,
          errorType: 'permission_denied',
          errorMessage: 'カメラへのアクセスが許可されていません。ブラウザ設定でカメラの許可をオンにするか、画像選択をご利用ください。'
        };
      }

      // If device not found or overconstrained, try next fallback
      if (errName === 'OverconstrainedError' || errName === 'NotFoundError') {
        continue;
      }
    }
  }

  // If we reach here, all fallbacks failed
  const finalName = lastError?.name || '';
  const finalMsg = (lastError?.message || '').toLowerCase();

  if (finalName === 'NotFoundError' || finalMsg.includes('device not found') || finalMsg.includes('not found')) {
    return {
      stream: null,
      errorType: 'not_found',
      errorMessage: 'カメラデバイスが見つかりませんでした。スマートフォン標準のカメラ撮影または画像選択をご利用ください。'
    };
  }

  if (finalName === 'NotAllowedError' || finalName === 'PermissionDeniedError') {
    return {
      stream: null,
      errorType: 'permission_denied',
      errorMessage: 'カメラへのアクセスが拒否されました。スマートフォン標準のカメラ撮影または画像選択をご利用ください。'
    };
  }

  return {
    stream: null,
    errorType: 'unknown',
    errorMessage: 'カメラの起動に失敗しました。スマートフォン標準のカメラ撮影または画像選択をご利用ください。'
  };
}
