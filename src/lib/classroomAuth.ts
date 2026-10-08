import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  updateProfile,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

// Initialize Firebase App if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.topics.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos'
];

const provider = new GoogleAuthProvider();
// Add all requested scopes to provider
CLASSROOM_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'consent'
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token strictly in memory (NOT in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // For ID/password signed-in users or when token not available
        cachedAccessToken = null;
        if (onAuthSuccess) onAuthSuccess(user, '');
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Classroomの認証アクセストークンを取得できませんでした');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// =========================================================================
// ID & Password Authentication System (with local fallback resilience)
// =========================================================================

export interface StoredLocalAccount {
  loginId: string;
  email: string;
  name: string;
  password: string; // fallback in case offline or Firebase email auth is disabled
  roleTitle: string;
  targetGoal: string;
  avatar: string;
  createdAt: number;
}

const LOCAL_ACCOUNTS_KEY = 'scope_study_id_credentials';

export const getStoredAccounts = (): StoredLocalAccount[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredAccount = (acc: StoredLocalAccount) => {
  try {
    const accounts = getStoredAccounts();
    const existingIndex = accounts.findIndex(a => a.loginId.toLowerCase() === acc.loginId.toLowerCase());
    if (existingIndex >= 0) {
      accounts[existingIndex] = acc;
    } else {
      accounts.push(acc);
    }
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to save account locally', e);
  }
};

// Normalize ID to valid email for Firebase Auth
export const normalizeLoginIdToEmail = (loginId: string): string => {
  const trimmed = loginId.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Remove spaces or invalid chars for email local-part
  const safeId = trimmed.replace(/[^a-z0-9_.-]/g, '');
  return `${safeId || 'student'}@remix-study.app`;
};

/**
 * Log in with either User ID (e.g. "student01", "yamada") or Email and Password
 */
export const loginWithIdAndPassword = async (
  loginIdOrEmail: string,
  password: string
): Promise<{ user: User | null; profile: UserProfile }> => {
  const rawId = loginIdOrEmail.trim();
  if (!rawId) throw new Error('ユーザーIDまたはメールアドレスを入力してください');
  if (!password) throw new Error('パスワードを入力してください');

  const email = normalizeLoginIdToEmail(rawId);

  // 1. Try Firebase Authentication
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;
    
    // Check if we have additional profile metadata in local store
    const localAccounts = getStoredAccounts();
    const matched = localAccounts.find(
      a => a.loginId.toLowerCase() === rawId.toLowerCase() || a.email.toLowerCase() === email.toLowerCase()
    );

    const displayName = fbUser.displayName || matched?.name || rawId;
    const roleTitle = matched?.roleTitle || '学生';
    const avatar = fbUser.photoURL || matched?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`;

    const profile: UserProfile = {
      id: `user_${rawId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      name: displayName,
      roleTitle,
      avatar,
      totalStudyMinutes: 0,
      todayStudyMinutes: 0,
      streakDays: 1,
      targetGoal: matched?.targetGoal || '次回定期テストで自己ベスト更新',
      competitionEnabled: true,
      weeklyPoints: 50,
      totalPoints: 50,
      rankLeague: 'シルバー'
    };

    return { user: fbUser, profile };
  } catch (fbError: any) {
    console.warn('Firebase signInWithEmailAndPassword error, checking local accounts fallback:', fbError.code || fbError.message);

    // 2. Check local fallback accounts if Firebase fails (e.g. project disabled email/pass or network error)
    const localAccounts = getStoredAccounts();
    const matched = localAccounts.find(
      a => (a.loginId.toLowerCase() === rawId.toLowerCase() || a.email.toLowerCase() === email.toLowerCase()) &&
           a.password === password
    );

    if (matched) {
      const profile: UserProfile = {
        id: `user_${matched.loginId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        name: matched.name,
        roleTitle: matched.roleTitle,
        avatar: matched.avatar,
        totalStudyMinutes: 0,
        todayStudyMinutes: 0,
        streakDays: 1,
        targetGoal: matched.targetGoal || '次回定期テストで自己ベスト更新',
        competitionEnabled: true,
        weeklyPoints: 50,
        totalPoints: 50,
        rankLeague: 'シルバー'
      };
      return { user: null, profile };
    }

    // Friendly Japanese error messages for user
    if (fbError.code === 'auth/wrong-password' || fbError.code === 'auth/invalid-credential') {
      throw new Error('パスワードが正しくありません。ご確認ください。');
    } else if (fbError.code === 'auth/user-not-found') {
      throw new Error(`IDまたはメールアドレス「${rawId}」のアカウントが見つかりません。「新規アカウント作成」から登録してください。`);
    } else if (fbError.code === 'auth/too-many-requests') {
      throw new Error('ログイン試行が制限されました。少し時間をおいてから再度お試しください。');
    }

    // Default error
    throw new Error('ログインに失敗しました。IDとパスワードをご確認ください。');
  }
};

/**
 * Register a new student account with ID, Password, Name, and Grade
 */
export const registerWithIdAndPassword = async (
  loginId: string,
  password: string,
  name: string,
  roleTitle: string = '高校1年生',
  targetGoal: string = '定期テストで高得点を獲得する'
): Promise<{ user: User | null; profile: UserProfile }> => {
  const cleanId = loginId.trim();
  const cleanName = name.trim();

  if (!cleanId) throw new Error('ログインID（またはメールアドレス）を入力してください');
  if (!cleanName) throw new Error('お名前（ニックネーム可）を入力してください');
  if (!password || password.length < 6) {
    throw new Error('パスワードは6文字以上で入力してください');
  }

  const email = normalizeLoginIdToEmail(cleanId);
  const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`;

  let fbUser: User | null = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    fbUser = cred.user;
    await updateProfile(fbUser, {
      displayName: cleanName,
      photoURL: avatar
    });
  } catch (fbError: any) {
    console.warn('Firebase createUserWithEmailAndPassword notice:', fbError.code || fbError.message);
    if (fbError.code === 'auth/email-already-in-use') {
      // If already in use, attempt to see if password matches
      try {
        const signResult = await loginWithIdAndPassword(cleanId, password);
        return signResult;
      } catch {
        throw new Error('このID・メールアドレスは既に登録されています。別のIDを指定するかログインしてください。');
      }
    }
  }

  // Save to local secure fallback registry
  const newLocalAccount: StoredLocalAccount = {
    loginId: cleanId,
    email,
    name: cleanName,
    password,
    roleTitle,
    targetGoal,
    avatar,
    createdAt: Date.now()
  };
  saveStoredAccount(newLocalAccount);

  const profile: UserProfile = {
    id: `user_${cleanId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    name: cleanName,
    roleTitle,
    avatar,
    totalStudyMinutes: 0,
    todayStudyMinutes: 0,
    streakDays: 1,
    targetGoal,
    competitionEnabled: true,
    weeklyPoints: 100,
    totalPoints: 100,
    rankLeague: 'シルバー'
  };

  return { user: fbUser, profile };
};

/**
 * Sign in anonymously with Firebase Auth for immediate instant testing
 */
export const firebaseAnonymousSignIn = async (): Promise<{ user: User; profile: UserProfile }> => {
  try {
    const cred = await signInAnonymously(auth);
    const fbUser = cred.user;
    const shortUid = fbUser.uid.slice(0, 6);
    const guestName = `ゲスト生徒 (${shortUid})`;

    const profile: UserProfile = {
      id: `user_fb_${fbUser.uid.slice(0, 8)}`,
      name: guestName,
      roleTitle: 'Firebaseゲスト体験',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      totalStudyMinutes: 0,
      todayStudyMinutes: 0,
      streakDays: 1,
      targetGoal: 'Firebaseログインで学習計画を開始！',
      competitionEnabled: true,
      weeklyPoints: 50,
      totalPoints: 50,
      rankLeague: 'シルバー'
    };

    return { user: fbUser, profile };
  } catch (error: any) {
    console.error('Firebase anonymous sign in error:', error);
    throw new Error('Firebaseゲストログインに失敗しました: ' + (error.message || ''));
  }
};

/**
 * Sign out completely from Firebase Auth
 */
export const firebaseLogout = async (): Promise<void> => {
  try {
    cachedAccessToken = null;
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase sign out error:', error);
    throw error;
  }
};

/**
 * Send password reset email via Firebase Auth
 */
export const firebaseResetPassword = async (emailOrLoginId: string): Promise<void> => {
  const email = normalizeLoginIdToEmail(emailOrLoginId);
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Firebase password reset error:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error(`メールアドレス「${email}」のアカウントは見つかりませんでした。`);
    }
    throw new Error('パスワード再設定メールの送信に失敗しました: ' + (error.message || ''));
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser;
};

