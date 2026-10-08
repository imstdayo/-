export type MasteryLevel = 'perfect' | 'good' | 'shaky' | 'not_started';

export interface ScopeCheckItem {
  id: string;
  title: string;
  category: 'textbook' | 'workbook' | 'handout' | 'past_exam' | 'other';
  pageRange?: string;
  completed: boolean;
  masteryLevel: MasteryLevel;
  notes?: string;
}

export interface SubjectScope {
  id: string;
  name: string;
  color: string;
  targetScore: number;
  currentScore: number;
  textbookRange: string;
  workbookRange: string;
  handoutRange: string;
  keyTopics: string[];
  items: ScopeCheckItem[];
  studiedMinutes: number;
  aiEstimatedHours?: number;
  aiDailyHours?: number;
  aiPriorityLevel?: '最優先' | '高' | '中' | '通常';
  aiAdvice?: string;
  aiMilestones?: string[];
}

export interface SubmissionDeadline {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // e.g. "08:30"
  completed: boolean;
  notes?: string;
}

export interface TestScope {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  subjects: SubjectScope[];
}

export interface FriendRank {
  id: string;
  name: string;
  avatar: string;
  weeklyMinutes: number;
  streakDays: number;
  statusMessage: string;
  isCurrentUser?: boolean;
  weeklyPoints?: number;
  totalPoints?: number;
  rankLeague?: 'ブロンズ' | 'シルバー' | 'ゴールド' | 'プラチナ' | 'ダイヤモンド' | 'マスター';
  pointsBreakdown?: {
    tasks: number;
    studyTime: number;
    dailyBonus: number;
    streakBonus: number;
  };
}

export interface DailyBonusMission {
  id: string;
  title: string;
  subjectName: string;
  targetMinutes: number;
  rewardPoints: number;
  completed: boolean;
  reason: string;
  completedAt?: string;
  subjectColor?: string;
  durationMinutes?: number;
  reasonLabel?: string;
  description?: string;
}

export interface PointEvent {
  id: string;
  type: 'task_complete' | 'deadline_complete' | 'deadline_submit' | 'study_time' | 'daily_bonus' | 'streak_bonus' | 'mastery_item' | 'cheer_sent';
  points: number;
  label: string;
  timestamp: number;
  category?: 'task_complete' | 'deadline_submit' | 'study_time' | 'daily_bonus' | 'streak_bonus' | 'cheer_sent';
}

export interface UserProfile {
  id: string;
  name: string;
  roleTitle: string; // e.g. "高校2年生 (理系特進コース)"
  gradeType?: 'high_school' | 'middle_school' | 'certification' | 'other';
  avatar: string;
  totalStudyMinutes: number;
  todayStudyMinutes: number;
  streakDays: number;
  targetGoal: string;
  targetScoreAverage?: number;
  competitionEnabled: boolean;
  totalPoints?: number;
  weeklyPoints?: number;
  rankLeague?: 'ブロンズ' | 'シルバー' | 'ゴールド' | 'プラチナ' | 'ダイヤモンド' | 'マスター';
}

export interface DailyStudyTask {
  id: string;
  subjectName: string;
  topic: string;
  estimatedMinutes: number;
  completed: boolean;
  dueDate?: string;
  category?: 'important' | 'routine' | 'urgent';
}

export interface CameraAnalysisResult {
  id: string;
  date: string;
  subject: string;
  overallScoreAssessment: string;
  identifiedWeaknesses: {
    topic: string;
    severity: string;
    explanation: string;
  }[];
  identifiedStrengths: {
    topic: string;
    explanation: string;
  }[];
  actionPlan: string[];
  imagePreview?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  alternateLink?: string;
  courseState?: string;
  teacherGroupEmail?: string;
  courseColor?: string;
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  courseName?: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  dueDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
  };
  formattedDueDate?: string;
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION' | string;
  submissionState?: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT' | string;
  submissionId?: string;
  assignedGrade?: number;
  materials?: Array<{
    driveFile?: {
      driveFile?: {
        id: string;
        title: string;
        alternateLink: string;
      };
    };
    youtubeVideo?: {
      id: string;
      title: string;
      alternateLink: string;
    };
    link?: {
      url: string;
      title: string;
    };
    form?: {
      formUrl: string;
      title: string;
    };
  }>;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  courseName?: string;
  text: string;
  updateTime: string;
  alternateLink?: string;
  materials?: any[];
}

export interface StudySessionLog {
  id: string;
  minutes: number;
  subjectId?: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  category: 'cram_school_class' | 'cram_school_self' | 'library' | 'school' | 'home_offline' | 'timer' | 'other';
  categoryLabel: string;
  notes?: string;
  createdAt: number;
}

