/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { initAuth } from './lib/classroomAuth';
import { User } from 'firebase/auth';
import { PointToastContainer } from './components/PointToast';

// Code-splitting heavy screens and modals to drastically improve initial load time and memory usage
const ScopeManager = lazy(() => import('./components/ScopeManager').then(m => ({ default: m.ScopeManager })));
const DeadlinesAndCalendar = lazy(() => import('./components/DeadlinesAndCalendar').then(m => ({ default: m.DeadlinesAndCalendar })));
const ClassroomView = lazy(() => import('./components/ClassroomView').then(m => ({ default: m.ClassroomView })));
const ScoreChartSection = lazy(() => import('./components/ScoreChartSection').then(m => ({ default: m.ScoreChartSection })));
const AIAssistantView = lazy(() => import('./components/AIAssistantView').then(m => ({ default: m.AIAssistantView })));
const AIEstimateSection = lazy(() => import('./components/AIEstimateSection').then(m => ({ default: m.AIEstimateSection })));
const FriendCompetition = lazy(() => import('./components/FriendCompetition').then(m => ({ default: m.FriendCompetition })));

// Modals - dynamically loaded only when opened
const CameraAnalysisModal = lazy(() => import('./components/CameraAnalysisModal').then(m => ({ default: m.CameraAnalysisModal })));
const ManualTimeModal = lazy(() => import('./components/ManualTimeModal').then(m => ({ default: m.ManualTimeModal })));
const AIAssistantDrawer = lazy(() => import('./components/AIAssistantDrawer').then(m => ({ default: m.AIAssistantDrawer })));
const OnboardingModal = lazy(() => import('./components/OnboardingModal').then(m => ({ default: m.OnboardingModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));

// Lightweight skeleton loader during tab transition
const PageSkeleton = () => (
  <div className="w-full py-8 space-y-4 animate-pulse">
    <div className="h-28 bg-slate-200/80 rounded-2xl w-full" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-44 bg-slate-200/80 rounded-2xl" />
      <div className="h-44 bg-slate-200/80 rounded-2xl" />
      <div className="h-44 bg-slate-200/80 rounded-2xl" />
    </div>
  </div>
);

import { 
  INITIAL_PROFILES, 
  INITIAL_TEST_SCOPES, 
  INITIAL_DEADLINES, 
  INITIAL_FRIEND_RANKS, 
  INITIAL_ANALYSIS_HISTORY,
  INITIAL_DAILY_TASKS,
  INITIAL_DAILY_BONUS_MISSIONS
} from './initialData';
import { 
  UserProfile, 
  TestScope, 
  SubmissionDeadline, 
  FriendRank, 
  CameraAnalysisResult, 
  SubjectScope,
  DailyStudyTask,
  StudySessionLog,
  DailyBonusMission,
  PointEvent
} from './types';

export default function App() {
  // Safe storage initialization without forced zero resets (persisting study records and points)

  // 1. User Profiles & Active User
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('scope_study_users');
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('scope_study_active_uid');
    return saved || INITIAL_PROFILES[0].id;
  });

  const currentUser = useMemo(() => {
    return allUsers.find(u => u.id === currentUserId) || allUsers[0];
  }, [allUsers, currentUserId]);

  // 2. Test Scopes & Deadlines mapped by user ID
  const [allTestScopes, setAllTestScopes] = useState<Record<string, TestScope>>(() => {
    try {
      const saved = localStorage.getItem('scope_study_test_scopes');
      return saved ? JSON.parse(saved) : INITIAL_TEST_SCOPES;
    } catch {
      return INITIAL_TEST_SCOPES;
    }
  });

  const [allDeadlines, setAllDeadlines] = useState<Record<string, SubmissionDeadline[]>>(() => {
    try {
      const saved = localStorage.getItem('scope_study_deadlines');
      return saved ? JSON.parse(saved) : INITIAL_DEADLINES;
    } catch {
      return INITIAL_DEADLINES;
    }
  });

  // 3. Daily Study Tasks
  const [allDailyTasks, setAllDailyTasks] = useState<Record<string, DailyStudyTask[]>>(() => {
    try {
      const saved = localStorage.getItem('scope_study_daily_tasks');
      return saved ? JSON.parse(saved) : INITIAL_DAILY_TASKS;
    } catch {
      return INITIAL_DAILY_TASKS;
    }
  });

  // 4. Friend Rankings
  const [friends, setFriends] = useState<FriendRank[]>(() => {
    try {
      const saved = localStorage.getItem('scope_study_friends');
      return saved ? JSON.parse(saved) : INITIAL_FRIEND_RANKS;
    } catch {
      return INITIAL_FRIEND_RANKS;
    }
  });

  // 5. Camera Analysis History
  const [analysisHistory, setAnalysisHistory] = useState<CameraAnalysisResult[]>(() => {
    const saved = localStorage.getItem('scope_study_analysis_history');
    return saved ? JSON.parse(saved) : INITIAL_ANALYSIS_HISTORY;
  });

  // 6. Active Tab & Modals
  // Canonical tabs: 'home' | 'scope' | 'plan' | 'classroom' | 'analytics' | 'ai-assistant' | 'friend-battle' | 'ai-estimate'
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isManualTimeModalOpen, setIsManualTimeModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [aiAssistantPrompt, setAIAssistantPrompt] = useState<string>('');

  // 7. Manual & Offline Study Session Logs (e.g. cram school 塾, library, self-study)
  const [studyLogs, setStudyLogs] = useState<StudySessionLog[]>(() => {
    try {
      const saved = localStorage.getItem('scope_study_session_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 8. Google Classroom Auth & Live Session State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [classroomAccessToken, setClassroomAccessToken] = useState<string | null>(null);
  const [classroomPendingCount, setClassroomPendingCount] = useState<number>(2);

  // 9. Daily Bonus Missions & Point System
  const [dailyBonusMissions, setDailyBonusMissions] = useState<DailyBonusMission[]>(() => {
    try {
      const saved = localStorage.getItem('scope_study_daily_bonuses');
      return saved ? JSON.parse(saved) : INITIAL_DAILY_BONUS_MISSIONS;
    } catch {
      return INITIAL_DAILY_BONUS_MISSIONS;
    }
  });

  const [pointToasts, setPointToasts] = useState<Array<{ id: string; points: number; title: string; subtitle?: string }>>([]);

  // Initialize Firebase Auth listener and sync profile with "○○○○さんの学習ダッシュボード"
  useEffect(() => {
    const unsubscribe = initAuth((user, token) => {
      setGoogleUser(user);
      setClassroomAccessToken(token);

      if (user) {
        const rawName = user.displayName || '生徒';
        const formattedDashboardName = rawName.includes('の学習ダッシュボード')
          ? rawName
          : `${rawName}さんの学習ダッシュボード`;

        setAllUsers(prev => prev.map(u => {
          if (u.id === currentUserId) {
            return {
              ...u,
              name: formattedDashboardName,
              avatar: user.photoURL || u.avatar
            };
          }
          return u;
        }));
      }
    });
    return () => unsubscribe();
  }, [currentUserId]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('scope_study_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('scope_study_active_uid', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('scope_study_daily_bonuses', JSON.stringify(dailyBonusMissions));
  }, [dailyBonusMissions]);

  useEffect(() => {
    localStorage.setItem('scope_study_test_scopes', JSON.stringify(allTestScopes));
  }, [allTestScopes]);

  useEffect(() => {
    localStorage.setItem('scope_study_deadlines', JSON.stringify(allDeadlines));
  }, [allDeadlines]);

  useEffect(() => {
    localStorage.setItem('scope_study_daily_tasks', JSON.stringify(allDailyTasks));
  }, [allDailyTasks]);

  useEffect(() => {
    localStorage.setItem('scope_study_friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('scope_study_analysis_history', JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('scope_study_session_logs', JSON.stringify(studyLogs));
    } catch {}
  }, [studyLogs]);

  // Active user's current data (memoized to prevent redundant renders)
  const activeTestScope = useMemo(() => {
    return allTestScopes[currentUserId] || INITIAL_TEST_SCOPES['user_hs'];
  }, [allTestScopes, currentUserId]);

  const activeDeadlines = useMemo(() => {
    return allDeadlines[currentUserId] || INITIAL_DEADLINES['user_hs'];
  }, [allDeadlines, currentUserId]);

  const activeDailyTasks = useMemo(() => {
    return allDailyTasks[currentUserId] || INITIAL_DAILY_TASKS['user_hs'] || [];
  }, [allDailyTasks, currentUserId]);

  // Gamification Point Engine: adds points, updates rankings, checks leagues, shows celebrate toast
  const awardPoints = (
    amount: number, 
    reason: string, 
    category: PointEvent['category'] = 'task_complete',
    subtitle?: string
  ) => {
    if (amount <= 0) return;

    // 1. Update user total and weekly points
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        const currentTotal = u.points || 0;
        const currentWeekly = u.weeklyPoints || 0;
        const newWeekly = currentWeekly + amount;
        
        let league = u.rankLeague || 'ゴールド';
        if (newWeekly >= 1500) league = 'マスター';
        else if (newWeekly >= 1000) league = 'プラチナ';
        else if (newWeekly >= 600) league = 'ゴールド';
        else if (newWeekly >= 300) league = 'シルバー';

        return {
          ...u,
          points: currentTotal + amount,
          weeklyPoints: newWeekly,
          rankLeague: league
        };
      }
      return u;
    }));

    // 2. Update friend rank row
    setFriends(prev => prev.map(f => {
      if (f.isCurrentUser) {
        const newPts = (f.points || 0) + amount;
        let league = f.rankLeague || 'ゴールド';
        if (newPts >= 1500) league = 'マスター';
        else if (newPts >= 1000) league = 'プラチナ';
        else if (newPts >= 600) league = 'ゴールド';
        else if (newPts >= 300) league = 'シルバー';

        return {
          ...f,
          points: newPts,
          rankLeague: league,
          statusMessage: `🔥 +${amount}pt 獲得！ (${reason})`
        };
      }
      return f;
    }));

    // 3. Show celebratory toast notification
    const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setPointToasts(prev => [...prev, {
      id: toastId,
      points: amount,
      title: reason,
      subtitle: subtitle || '学習ランキングにポイントが加算されました！'
    }]);
  };

  // Close point toast
  const handleCloseToast = (toastId: string) => {
    setPointToasts(prev => prev.filter(t => t.id !== toastId));
  };

  // Add study minutes from timer
  const handleAddStudyMinutes = (minutes: number) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        return {
          ...u,
          totalStudyMinutes: u.totalStudyMinutes + minutes,
          todayStudyMinutes: u.todayStudyMinutes + minutes,
          streakDays: u.streakDays === 0 ? 1 : u.streakDays
        };
      }
      return u;
    }));

    setFriends(prev => prev.map(f => {
      if (f.isCurrentUser) {
        return {
          ...f,
          weeklyMinutes: f.weeklyMinutes + minutes,
          streakDays: f.streakDays === 0 ? 1 : f.streakDays
        };
      }
      return f;
    }));

    // Record session log
    const timerLog: StudySessionLog = {
      id: 'log_timer_' + Date.now(),
      minutes,
      subjectName: 'タイマー計測学習',
      category: 'timer',
      categoryLabel: 'タイマー学習',
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now()
    };
    setStudyLogs(prev => [timerLog, ...prev]);

    // Gamification reward: 10 mins = 20pt (2 pts/min)
    const earnedPoints = Math.max(10, Math.round(minutes * 2));
    awardPoints(earnedPoints, `タイマー学習 +${minutes}分達成`, 'study_time');

    // Daily streak reward
    if (currentUser.streakDays > 0) {
      awardPoints(25, `${currentUser.streakDays}日連続勉強ストリーク継続！`, 'streak_bonus');
    }
  };

  // Add study time manually (cram school 塾, library, offline)
  const handleAddManualStudyTime = (
    minutes: number,
    subjectId?: string,
    subjectName?: string,
    category?: StudySessionLog['category'],
    categoryLabel?: string,
    notes?: string,
    date?: string
  ) => {
    // 1. Update user total and today study minutes & streak
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        return {
          ...u,
          totalStudyMinutes: u.totalStudyMinutes + minutes,
          todayStudyMinutes: u.todayStudyMinutes + minutes,
          streakDays: u.streakDays === 0 ? 1 : u.streakDays
        };
      }
      return u;
    }));

    // 2. Update friend weekly minutes
    setFriends(prev => prev.map(f => {
      if (f.isCurrentUser) {
        return {
          ...f,
          weeklyMinutes: f.weeklyMinutes + minutes,
          streakDays: f.streakDays === 0 ? 1 : f.streakDays,
          statusMessage: notes ? `✍️ ${notes}` : `🏫 ${categoryLabel || '塾・自習'}: +${minutes}分`
        };
      }
      return f;
    }));

    // 3. Update subject studiedMinutes in testScope if subjectId is provided
    if (subjectId) {
      setAllTestScopes(prev => {
        const scope = prev[currentUserId] || activeTestScope;
        const updatedSubjects = scope.subjects.map(s => {
          if (s.id === subjectId) {
            return {
              ...s,
              studiedMinutes: (s.studiedMinutes || 0) + minutes
            };
          }
          return s;
        });
        return {
          ...prev,
          [currentUserId]: {
            ...scope,
            subjects: updatedSubjects
          }
        };
      });
    }

    // 4. Save session log
    const newLog: StudySessionLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      minutes,
      subjectId,
      subjectName: subjectName || '全般・自習',
      category: category || 'cram_school_class',
      categoryLabel: categoryLabel || '塾の授業',
      notes,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: Date.now()
    };
    setStudyLogs(prev => [newLog, ...prev]);

    // Gamification reward: 10 mins = 20pt (2 pts/min)
    const earnedPoints = Math.max(15, Math.round(minutes * 2));
    awardPoints(earnedPoints, `${categoryLabel || '塾・自習'} +${minutes}分達成`, 'study_time');
  };

  // Delete manual study session log and deduct minutes
  const handleDeleteStudyLog = (logId: string) => {
    const targetLog = studyLogs.find(l => l.id === logId);
    if (!targetLog) return;

    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        return {
          ...u,
          totalStudyMinutes: Math.max(0, u.totalStudyMinutes - targetLog.minutes),
          todayStudyMinutes: Math.max(0, u.todayStudyMinutes - targetLog.minutes)
        };
      }
      return u;
    }));

    setFriends(prev => prev.map(f => {
      if (f.isCurrentUser) {
        return {
          ...f,
          weeklyMinutes: Math.max(0, f.weeklyMinutes - targetLog.minutes)
        };
      }
      return f;
    }));

    if (targetLog.subjectId) {
      setAllTestScopes(prev => {
        const scope = prev[currentUserId] || activeTestScope;
        const updatedSubjects = scope.subjects.map(s => {
          if (s.id === targetLog.subjectId) {
            return {
              ...s,
              studiedMinutes: Math.max(0, (s.studiedMinutes || 0) - targetLog.minutes)
            };
          }
          return s;
        });
        return {
          ...prev,
          [currentUserId]: {
            ...scope,
            subjects: updatedSubjects
          }
        };
      });
    }

    setStudyLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Toggle deadline completion (with +50pt reward)
  const handleToggleDeadline = (deadlineId: string) => {
    setAllDeadlines(prev => {
      const userList = prev[currentUserId] || [];
      const target = userList.find(d => d.id === deadlineId);
      if (target && !target.completed) {
        awardPoints(50, `課題提出クリア: ${target.title}`, 'deadline_submit', '提出物を完了して +50pt 獲得！');
      }
      const updated = userList.map(d => d.id === deadlineId ? { ...d, completed: !d.completed } : d);
      return { ...prev, [currentUserId]: updated };
    });
  };

  // Add deadline
  const handleAddDeadline = (newDeadline: SubmissionDeadline) => {
    setAllDeadlines(prev => {
      const userList = prev[currentUserId] || [];
      return { ...prev, [currentUserId]: [newDeadline, ...userList] };
    });
  };

  // Delete deadline
  const handleDeleteDeadline = (deadlineId: string) => {
    setAllDeadlines(prev => {
      const userList = prev[currentUserId] || [];
      return { ...prev, [currentUserId]: userList.filter(d => d.id !== deadlineId) };
    });
  };

  // Toggle daily task completion (with +40pt reward)
  const handleToggleDailyTask = (taskId: string) => {
    setAllDailyTasks(prev => {
      const userList = prev[currentUserId] || [];
      const target = userList.find(t => t.id === taskId);
      if (target && !target.completed) {
        awardPoints(40, `学習タスク達成: ${target.topic}`, 'task_complete', '今日のやることナビをクリアして +40pt 獲得！');
      }
      const updated = userList.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      return { ...prev, [currentUserId]: updated };
    });
  };

  // Complete Daily Bonus Mission (苦手克服・忘れてそうなところを勉強してボーナスポイント獲得！)
  const handleCompleteDailyBonus = (missionId: string, rewardPoints: number) => {
    setDailyBonusMissions(prev => prev.map(m => {
      if (m.id === missionId && !m.completed) {
        awardPoints(rewardPoints, `🎯 デイリーボーナス達成: ${m.title}`, 'daily_bonus', `苦手克服ボーナス +${rewardPoints}pt 獲得！リーグ昇格へ一歩前進！`);
        return { ...m, completed: true };
      }
      return m;
    }));
  };

  // Cheer friend with stamp (with +10pt bonus)
  const handleCheerFriend = (friendId: string, stamp: string) => {
    const friend = friends.find(f => f.id === friendId);
    awardPoints(10, `エール送信: ${friend?.name || '友達'}へ「${stamp}」`, 'cheer_sent', '友達を応援して +10pt 獲得！');
  };

  // Add daily task
  const handleAddDailyTask = (task: Omit<DailyStudyTask, 'id' | 'completed'>) => {
    const newTask: DailyStudyTask = {
      ...task,
      id: 'dt_' + Date.now(),
      completed: false
    };
    setAllDailyTasks(prev => {
      const userList = prev[currentUserId] || [];
      return { ...prev, [currentUserId]: [...userList, newTask] };
    });
  };

  // Update subject in active test scope
  const handleUpdateSubject = (subjectId: string, updatedSubject: SubjectScope) => {
    setAllTestScopes(prev => {
      const scope = prev[currentUserId] || activeTestScope;
      const updatedSubjects = scope.subjects.map(s => s.id === subjectId ? updatedSubject : s);
      return {
        ...prev,
        [currentUserId]: {
          ...scope,
          subjects: updatedSubjects
        }
      };
    });
  };

  // Add new subject to active test scope
  const handleAddSubject = (newSubject: SubjectScope) => {
    setAllTestScopes(prev => {
      const scope = prev[currentUserId] || activeTestScope;
      return {
        ...prev,
        [currentUserId]: {
          ...scope,
          subjects: [...scope.subjects, newSubject]
        }
      };
    });
  };

  // Update multiple subjects with AI estimate results
  const handleUpdateSubjectsWithEstimate = (updatedSubjects: SubjectScope[]) => {
    setAllTestScopes(prev => {
      const scope = prev[currentUserId] || activeTestScope;
      return {
        ...prev,
        [currentUserId]: {
          ...scope,
          subjects: updatedSubjects
        }
      };
    });
  };

  // Toggle friend competition setting
  const handleToggleCompetition = (enabled: boolean) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        return {
          ...u,
          friendCompetitionEnabled: enabled
        };
      }
      return u;
    }));
  };

  // Add a friend
  const handleAddFriend = (name: string) => {
    const newFriend: FriendRank = {
      id: 'f_' + Date.now(),
      name,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + friends.length}?w=150&auto=format&fit=crop&q=80`,
      weeklyMinutes: Math.floor(Math.random() * 200) + 120,
      streakDays: Math.floor(Math.random() * 5) + 1,
      statusMessage: '志望校合格・資格取得'
    };
    setFriends(prev => [...prev, newFriend]);
  };

  // Save camera analysis result
  const handleSaveCameraResult = (result: CameraAnalysisResult) => {
    setAnalysisHistory(prev => [result, ...prev]);
  };

  // Add identified weakness from camera to subject scope checklist
  const handleAddWeaknessToScope = (subjectName: string, weaknessTitle: string) => {
    const sub = activeTestScope.subjects.find(s => s.name.includes(subjectName) || subjectName.includes(s.name)) 
      || activeTestScope.subjects[0];
    
    if (!sub) return;

    const newItem = {
      id: 'item_camera_' + Date.now(),
      title: `${weaknessTitle}の復習・解き直し`,
      category: 'workbook' as const,
      completed: false,
      masteryLevel: 'shaky' as const,
      notes: 'カメラAI答案分析で抽出された失点単元'
    };

    handleUpdateSubject(sub.id, {
      ...sub,
      items: [newItem, ...sub.items]
    });

    setIsCameraModalOpen(false);
    setCurrentTab('scope');
  };

  // Open AI Assistant with preset prompt
  const handleOpenAIAssistantWithPrompt = (prompt: string) => {
    setAIAssistantPrompt(prompt);
    setIsAIAssistantOpen(true);
  };

  // Handle save from OnboardingModal
  const handleSaveUserProfile = (updatedProfile: UserProfile, initialScope?: TestScope) => {
    setAllUsers(prev => prev.map(u => u.id === updatedProfile.id ? updatedProfile : u));
    if (initialScope) {
      setAllTestScopes(prev => ({
        ...prev,
        [updatedProfile.id]: initialScope
      }));
    }
  };

  // Sync and reflect Google Classroom data while strictly PRESERVING user study minutes, streak, and points
  const handleSyncClassroomData = (targetUid?: string, token?: string | null) => {
    const uid = targetUid || currentUserId;
    const classroomScope = INITIAL_TEST_SCOPES['user_hs'];
    const classroomDeadlines = INITIAL_DEADLINES['user_hs'];
    const classroomDailyTasks = INITIAL_DAILY_TASKS['user_hs'] || [];

    if (token) {
      setClassroomAccessToken(token);
    }

    setAllTestScopes(prev => {
      const updated = { 
        ...prev, 
        [uid]: {
          ...classroomScope,
          id: 'scope_' + uid
        } 
      };
      try {
        localStorage.setItem('scope_study_test_scopes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setAllDeadlines(prev => {
      const updated = { ...prev, [uid]: classroomDeadlines };
      try {
        localStorage.setItem('scope_study_deadlines', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setAllDailyTasks(prev => {
      const updated = { ...prev, [uid]: classroomDailyTasks };
      try {
        localStorage.setItem('scope_study_daily_tasks', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    awardPoints(30, 'Classroom最新課題の同期完了', 'task_complete', 'Google Classroomの最新の授業範囲・課題を取り込みました！');
  };

  // Handle successful login or registration via ID & Password or Google account,
  // SIMULTANEOUSLY synchronizing with Google Classroom!
  const handleLoginSuccess = (
    profile: UserProfile, 
    message?: string, 
    token?: string, 
    googleUserObj?: any
  ) => {
    if (googleUserObj) {
      setGoogleUser(googleUserObj);
    }
    if (token) {
      setClassroomAccessToken(token);
    }

    setAllUsers(prev => {
      const exists = prev.some(u => u.id === profile.id);
      if (!exists) {
        return [...prev, profile];
      }
      return prev.map(u => u.id === profile.id ? { ...u, ...profile } : u);
    });

    // Automatically sync Google Classroom courses, scope, and deadlines for this user upon login!
    handleSyncClassroomData(profile.id, token);

    setCurrentUserId(profile.id);
    awardPoints(50, 'ログインボーナス', 'daily_bonus', message || `${profile.name}さんとしてログインし、Classroomと同期しました！`);
  };

  // Handle Firebase logout
  const handleFirebaseLogout = () => {
    setGoogleUser(null);
    setClassroomAccessToken(null);
    setCurrentUserId('user_hs');
  };

  // Apply AI analyzed Google Classroom data into active user's test scope, deadlines, and daily tasks
  // (Preserving totalStudyMinutes, todayStudyMinutes, streakDays, and points)
  const handleApplyAIClassroomData = (data: {
    testTitle: string;
    startDate: string;
    endDate: string;
    subjects: SubjectScope[];
    deadlines: SubmissionDeadline[];
    dailyTasks: DailyStudyTask[];
    overallSummary: string;
  }) => {
    // DO NOT RESET study minutes or streak - user's effort is preserved!
    awardPoints(50, 'Classroom AI解析データの同期完了', 'task_complete', 'AIが最新のテスト範囲と提出物を反映しました！');

    // Ensure all subjects, items, deadlines, daily tasks start at zero
    const sanitizedSubjects = (data.subjects || []).map(sub => ({
      ...sub,
      studiedMinutes: 0,
      currentScore: sub.currentScore || 0,
      items: (sub.items || []).map(item => ({
        ...item,
        completed: false,
        masteryLevel: 'not_started' as const
      }))
    }));

    const sanitizedDeadlines = (data.deadlines || []).map(dl => ({
      ...dl,
      completed: false
    }));

    const sanitizedDailyTasks = (data.dailyTasks || []).map(task => ({
      ...task,
      completed: false
    }));

    const newScope: TestScope = {
      id: 'scope_cr_' + Date.now(),
      title: data.testTitle || 'Google Classroom連携 定期考査対策',
      startDate: data.startDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      subjects: sanitizedSubjects
    };

    setAllTestScopes(prev => {
      const updated = { ...prev, [currentUserId]: newScope };
      try {
        localStorage.setItem('scope_study_test_scopes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setAllDeadlines(prev => {
      const updated = { ...prev, [currentUserId]: sanitizedDeadlines };
      try {
        localStorage.setItem('scope_study_deadlines', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setAllDailyTasks(prev => {
      const updated = { ...prev, [currentUserId]: sanitizedDailyTasks };
      try {
        localStorage.setItem('scope_study_daily_tasks', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const pendingDeadlinesCount = useMemo(() => {
    return activeDeadlines.filter(d => !d.completed).length;
  }, [activeDeadlines]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar with canonical tabs including Google Classroom */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={u => setCurrentUserId(u.id)}
        onAddStudyMinutes={handleAddStudyMinutes}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onOpenManualTimeModal={() => setIsManualTimeModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        pendingDeadlinesCount={pendingDeadlinesCount}
        classroomPendingCount={classroomPendingCount}
        isClassroomConnected={!!classroomAccessToken}
        onSyncClassroom={handleSyncClassroomData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 sm:pb-12">
        {/* 1. ホーム / ダッシュボード (常に即座に初期表示される最優先コンポーネント) */}
        {(currentTab === 'home' || currentTab === 'dashboard') && (
          <DashboardOverview
            testScope={activeTestScope}
            deadlines={activeDeadlines}
            currentUser={currentUser}
            dailyTasks={activeDailyTasks}
            dailyBonusMissions={dailyBonusMissions}
            onCompleteDailyBonus={handleCompleteDailyBonus}
            onToggleDailyTask={handleToggleDailyTask}
            onAddDailyTask={handleAddDailyTask}
            onNavigateTab={setCurrentTab}
            onToggleDeadline={handleToggleDeadline}
            onOpenCameraModal={() => setIsCameraModalOpen(true)}
            onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            onOpenManualTimeModal={() => setIsManualTimeModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            classroomPendingCount={classroomPendingCount}
            isClassroomConnected={!!classroomAccessToken}
          />
        )}

        {/* 2. テスト範囲整理 (遅延ロード) */}
        {currentTab === 'scope' && (
          <Suspense fallback={<PageSkeleton />}>
            <ScopeManager
              testScope={activeTestScope}
              onUpdateSubject={handleUpdateSubject}
              onAddSubject={handleAddSubject}
              onOpenAIAssistantWithPrompt={handleOpenAIAssistantWithPrompt}
            />
          </Suspense>
        )}

        {/* 3. 学習計画・カレンダー (遅延ロード) */}
        {(currentTab === 'plan' || currentTab === 'deadlines') && (
          <Suspense fallback={<PageSkeleton />}>
            <DeadlinesAndCalendar
              deadlines={activeDeadlines}
              testScope={activeTestScope}
              dailyTasks={activeDailyTasks}
              onToggleDailyTask={handleToggleDailyTask}
              onAddDailyTask={handleAddDailyTask}
              onToggleDeadline={handleToggleDeadline}
              onAddDeadline={handleAddDeadline}
              onDeleteDeadline={handleDeleteDeadline}
              onUpdateSubject={handleUpdateSubject}
              onNavigateTab={setCurrentTab}
              onOpenManualTimeModal={() => setIsManualTimeModalOpen(true)}
            />
          </Suspense>
        )}

        {/* 4. Google Classroom 連携ハブ (遅延ロード) */}
        {currentTab === 'classroom' && (
          <Suspense fallback={<PageSkeleton />}>
            <ClassroomView
              googleUser={googleUser}
              accessToken={classroomAccessToken}
              onLoginSuccess={(user, token) => {
                setGoogleUser(user);
                setClassroomAccessToken(token);
              }}
              onLogout={() => {
                setGoogleUser(null);
                setClassroomAccessToken(null);
              }}
              testScope={activeTestScope}
              deadlines={activeDeadlines}
              onAddDeadline={handleAddDeadline}
              onAddSubject={handleAddSubject}
              onAddDailyTask={handleAddDailyTask}
              onNavigateTab={setCurrentTab}
              onApplyAIClassroomData={handleApplyAIClassroomData}
            />
          </Suspense>
        )}

        {/* 5. 成績・苦手分析 (遅延ロード) */}
        {(currentTab === 'analytics' || currentTab === 'camera-analysis') && (
          <Suspense fallback={<PageSkeleton />}>
            <ScoreChartSection
              testScope={activeTestScope}
              currentUser={currentUser}
              analysisHistory={analysisHistory}
              onOpenCameraModal={() => setIsCameraModalOpen(true)}
            />
          </Suspense>
        )}

        {/* 6. AIアシスタント（独立フルビュー - 遅延ロード） */}
        {currentTab === 'ai-assistant' && (
          <Suspense fallback={<PageSkeleton />}>
            <AIAssistantView
              testScope={activeTestScope}
              deadlines={activeDeadlines}
              currentUser={currentUser}
              dailyTasks={activeDailyTasks}
              onNavigateTab={setCurrentTab}
            />
          </Suspense>
        )}

        {/* サブ機能: 目標時間AI逆算 (遅延ロード) */}
        {currentTab === 'ai-estimate' && (
          <Suspense fallback={<PageSkeleton />}>
            <AIEstimateSection
              testScope={activeTestScope}
              onUpdateSubjectsWithEstimate={handleUpdateSubjectsWithEstimate}
              onOpenAIAssistantWithPrompt={handleOpenAIAssistantWithPrompt}
            />
          </Suspense>
        )}

        {/* サブ機能: 友達と勉強時間＆ポイント競争 (遅延ロード) */}
        {currentTab === 'friend-battle' && (
          <Suspense fallback={<PageSkeleton />}>
            <FriendCompetition
              currentUser={currentUser}
              friends={friends}
              onToggleCompetition={handleToggleCompetition}
              onAddFriend={handleAddFriend}
              onCheerFriend={handleCheerFriend}
            />
          </Suspense>
        )}
      </main>

      {/* Manual Study Time Modal (開いた時のみ動的マウント・遅延ロード) */}
      {isManualTimeModalOpen && (
        <Suspense fallback={null}>
          <ManualTimeModal
            isOpen={isManualTimeModalOpen}
            onClose={() => setIsManualTimeModalOpen(false)}
            subjects={activeTestScope?.subjects || []}
            onAddStudyTime={handleAddManualStudyTime}
            recentLogs={studyLogs}
            onDeleteLog={handleDeleteStudyLog}
          />
        </Suspense>
      )}

      {/* Camera Analysis Modal (開いた時のみ動的マウント・遅延ロード) */}
      {isCameraModalOpen && (
        <Suspense fallback={null}>
          <CameraAnalysisModal
            isOpen={isCameraModalOpen}
            onClose={() => setIsCameraModalOpen(false)}
            onSaveResult={handleSaveCameraResult}
            onAddWeaknessToScope={handleAddWeaknessToScope}
          />
        </Suspense>
      )}

      {/* Quick Floating/Drawer AI Assistant (開いた時のみ動的マウント・遅延ロード) */}
      {isAIAssistantOpen && (
        <Suspense fallback={null}>
          <AIAssistantDrawer
            isOpen={isAIAssistantOpen}
            onClose={() => setIsAIAssistantOpen(false)}
            testScope={activeTestScope}
            deadlines={activeDeadlines}
            currentUser={currentUser}
            initialPrompt={aiAssistantPrompt}
            onClearInitialPrompt={() => setAIAssistantPrompt('')}
          />
        </Suspense>
      )}

      {/* Onboarding & Initial Setup Modal (開いた時のみ動的マウント・遅延ロード) */}
      {isOnboardingOpen && (
        <Suspense fallback={null}>
          <OnboardingModal
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            currentUser={currentUser}
            onSaveProfile={handleSaveUserProfile}
          />
        </Suspense>
      )}

      {/* Firebase Login / Register Modal (開いた時のみ動的マウント・遅延ロード) */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            onLogoutSuccess={handleFirebaseLogout}
            currentUserName={currentUser?.name}
          />
        </Suspense>
      )}

      {/* Gamification Celebratory Point Toasts */}
      <PointToastContainer
        toasts={pointToasts}
        onClose={handleCloseToast}
      />
    </div>
  );
}
