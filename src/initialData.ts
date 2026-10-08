import { UserProfile, TestScope, SubmissionDeadline, FriendRank, CameraAnalysisResult, DailyStudyTask, DailyBonusMission } from './types';

// Helper to format date offset from today
const getFutureDate = (daysAhead: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

export const INITIAL_DAILY_TASKS: Record<string, DailyStudyTask[]> = {
  user_hs: [
    { id: 'dt_cr_1', subjectName: '数学II・B (数ⅡB)', topic: '第3章「微分の応用」確認テスト演習プリント（大問1〜4）演習', estimatedMinutes: 35, completed: false, category: 'important' },
    { id: 'dt_cr_2', subjectName: '英語コミュニケーション (英コミュ)', topic: 'Unit 4 Summary Essay の下書き作成（Text A読解）', estimatedMinutes: 25, completed: false, category: 'routine' },
    { id: 'dt_cr_3', subjectName: '化学 (化学・化学基礎)', topic: '酸化還元滴定・半反応式の消去とモル比計算演習', estimatedMinutes: 30, completed: false, category: 'important' },
    { id: 'dt_cr_4', subjectName: '論理・表現 (論理表現)', topic: 'Opinion Essay（再生可能エネルギーの是非）120語ドラフト', estimatedMinutes: 20, completed: false, category: 'routine' },
    { id: 'dt_cr_5', subjectName: '物理 (物理・物理基礎)', topic: '力学的エネルギー保存則 実験レポートのグラフ作成とデータ整理', estimatedMinutes: 25, completed: false, category: 'important' }
  ],
  user_hs1: [
    { id: 'dt_hs1_1', subjectName: '数学Ⅰ・A (数ⅠA)', topic: '二次関数の最大・最小（軸が動く場合分け問題）4STEP演習', estimatedMinutes: 40, completed: false, category: 'important' },
    { id: 'dt_hs1_2', subjectName: '言語文化', topic: '助動詞活用表（る・らる・す・さす）の暗記＆伊勢物語品詞分解', estimatedMinutes: 25, completed: false, category: 'routine' },
    { id: 'dt_hs1_3', subjectName: '現代の国語 (現代国語)', topic: '評論「言葉と社会」指示語の指す内容整理と要約（80字）', estimatedMinutes: 20, completed: false, category: 'routine' },
    { id: 'dt_hs1_4', subjectName: '化学 (化学基礎)', topic: 'mol変換計算特訓（物質量・気体体積・アボガドロ定数）', estimatedMinutes: 30, completed: false, category: 'important' },
    { id: 'dt_hs1_5', subjectName: '情報 (情報Ⅰ)', topic: 'アルゴリズムとフローチャートのトレース演習', estimatedMinutes: 20, completed: false, category: 'routine' }
  ],
  user_hs3: [
    { id: 'dt_hs3_1', subjectName: '数学Ⅲ・C (数ⅢC)', topic: '部分積分・置換積分特訓（チャート式難関大演習10題）', estimatedMinutes: 45, completed: false, category: 'important' },
    { id: 'dt_hs3_2', subjectName: '物理 (物理)', topic: '導体棒の電磁誘導と誘導起電力・終端速度の導出', estimatedMinutes: 35, completed: false, category: 'important' },
    { id: 'dt_hs3_3', subjectName: '化学 (化学)', topic: '有機構造決定（元素分析とエステル加水分解の異性体絞り込み）', estimatedMinutes: 35, completed: false, category: 'important' },
    { id: 'dt_hs3_4', subjectName: '古典探究 (古典探求)', topic: '共通テスト過去問演習（源氏物語・主語判定と和歌解釈）', estimatedMinutes: 30, completed: false, category: 'routine' },
    { id: 'dt_hs3_5', subjectName: '英語コミュニケーション (英コミュ)', topic: '難関大自然科学系長文パラグラフリーディング＆速読', estimatedMinutes: 30, completed: false, category: 'routine' }
  ],
  user_ms: [
    { id: 'dt_ms_1', subjectName: '数学', topic: '二次方程式の解の公式と応用問題', estimatedMinutes: 30, completed: false, category: 'important' },
    { id: 'dt_ms_2', subjectName: '英語', topic: '長文読解問題集 p.24~26', estimatedMinutes: 25, completed: false, category: 'routine' },
    { id: 'dt_ms_3', subjectName: '理科', topic: '電流と磁界・右ねじの法則', estimatedMinutes: 20, completed: false, category: 'important' }
  ],
  user_qual: [
    { id: 'dt_q_1', subjectName: 'テクノロジ系', topic: '基本情報・アルゴリズム擬似言語', estimatedMinutes: 40, completed: false, category: 'important' },
    { id: 'dt_q_2', subjectName: 'マネジメント系', topic: 'プロジェクトマネジメント過去問20問', estimatedMinutes: 25, completed: true, category: 'routine' }
  ]
};

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_hs',
    name: '山田 涼太',
    roleTitle: '高校2年生 (Google Classroom連携・定期考査対策)',
    gradeType: 'high_school',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    totalStudyMinutes: 1120,
    todayStudyMinutes: 60,
    streakDays: 7,
    targetGoal: '数ⅡB 85点・英コミュ＆化学80点超え！',
    competitionEnabled: true,
    totalPoints: 1680,
    weeklyPoints: 850,
    rankLeague: 'ゴールド'
  },
  {
    id: 'user_hs1',
    name: '佐藤 陽菜',
    roleTitle: '高校1年生 (文理共通・基礎固め＆定期考査突破)',
    gradeType: 'high_school',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    totalStudyMinutes: 840,
    todayStudyMinutes: 45,
    streakDays: 5,
    targetGoal: '数ⅠA・言語文化・現代国語・化学基礎で高得点キープ！',
    competitionEnabled: true,
    totalPoints: 1240,
    weeklyPoints: 620,
    rankLeague: 'シルバー'
  },
  {
    id: 'user_hs3',
    name: '林 大樹',
    roleTitle: '高校3年生 (大学受験・共通テスト＆定期考査対策)',
    gradeType: 'high_school',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    totalStudyMinutes: 1840,
    todayStudyMinutes: 90,
    streakDays: 14,
    targetGoal: '数ⅢC・物理・化学・古典探究・論理表現で合格ライン突破！',
    competitionEnabled: true,
    totalPoints: 2450,
    weeklyPoints: 1120,
    rankLeague: 'プラチナ'
  },
  {
    id: 'user_ms',
    name: '伊藤 さくら',
    roleTitle: '中学3年生 (高校受験・定期テスト対策)',
    gradeType: 'middle_school',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    totalStudyMinutes: 720,
    todayStudyMinutes: 30,
    streakDays: 4,
    targetGoal: '内申点アップのために5教科合計430点超え！',
    competitionEnabled: true,
    totalPoints: 980,
    weeklyPoints: 490,
    rankLeague: 'シルバー'
  },
  {
    id: 'user_qual',
    name: '高橋 健一',
    roleTitle: '資格取得チャレンジャー (ITパスポート/基本情報)',
    gradeType: 'certification',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    totalStudyMinutes: 960,
    todayStudyMinutes: 40,
    streakDays: 6,
    targetGoal: 'ITパスポート合格基準700点以上で一発合格！',
    competitionEnabled: true,
    totalPoints: 1420,
    weeklyPoints: 710,
    rankLeague: 'ゴールド'
  }
];

export const INITIAL_DAILY_BONUS_MISSIONS: DailyBonusMission[] = [
  {
    id: 'db_math_1',
    title: '数学II・B: 微分係数と接線の方程式の解き直し特訓',
    subjectName: '数学II・B (数ⅡB)',
    targetMinutes: 15,
    rewardPoints: 150,
    completed: false,
    reason: '前回の小テストで失点！忘却曲線に基づき、接線の傾きf\'(t)の符号ミスを今日15分集中で再確認しよう！'
  },
  {
    id: 'db_chem_1',
    title: '化学: 酸化剤・還元剤の半反応式とe-消去トレーニング',
    subjectName: '化学 (化学・化学基礎)',
    targetMinutes: 15,
    rewardPoints: 150,
    completed: false,
    reason: '電子数の最小公倍数合わせでミスしやすい急所！15分集中でポイント大量獲得！'
  },
  {
    id: 'db_eng_1',
    title: '英語コミュニケーション: Unit 4 本文パラグラフ音読＆要約',
    subjectName: '英語コミュニケーション (英コミュ)',
    targetMinutes: 10,
    rewardPoints: 120,
    completed: false,
    reason: '提出Essayの前提となる重要パラグラフ！忘れる前に10分音読で完全定着！'
  }
];

export const INITIAL_TEST_SCOPES: Record<string, TestScope> = {
  user_hs: {
    id: 'test_hs_cr',
    title: '2学期中間考査 (高校2年 定期考査)',
    startDate: getFutureDate(6),
    endDate: getFutureDate(9),
    subjects: [
      {
        id: 'sub_cr_math',
        name: '数学II・B (数ⅡB)',
        color: '#2563eb',
        targetScore: 85,
        currentScore: 0,
        textbookRange: '教科書 p.80〜p.125 (微分法・極値と接線、等差・等比数列)',
        workbookRange: '第3章「微分の応用」確認テスト演習プリント (p.80〜84の増減表作成と極値計算)',
        handoutRange: 'Classroom配布資料フォルダ・中間考査頻出単元プリント',
        keyTopics: ['微分係数と接線の方程式', '増減表の作成と極値の計算', '等差数列・等比数列の一般項'],
        studiedMinutes: 0,
        aiEstimatedHours: 12.0,
        aiDailyHours: 1.8,
        aiPriorityLevel: '最優先',
        aiAdvice: '中間考査範囲は微分法（極値・最大最小）と等差・等比数列です。直近の確認テスト演習プリント提出を優先してください。',
        aiMilestones: [
          'Classroom配布プリントの増減表作成演習',
          '確認テスト演習プリント（大問1〜4）の提出完了',
          '等差・等比数列の基本公式と過去問対策'
        ],
        items: [
          { id: 'cr_m1', title: '教科書 p.80〜84 増減表作成と極値計算の通読', category: 'textbook', pageRange: 'p.80〜84', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_m2', title: '第3章「微分の応用」確認テスト演習プリント（大問1〜4ノート解き・提出）', category: 'workbook', pageRange: 'プリント指定範囲', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_m3', title: 'Classroom資料フォルダ：等差・等比数列の公式確認と例題', category: 'handout', pageRange: 'Classroom資料', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_cr_eng',
        name: '英語コミュニケーション (英コミュ)',
        color: '#059669',
        targetScore: 80,
        currentScore: 0,
        textbookRange: 'Unit 4「Global Climate Action」& Lesson 5 本文全訳',
        workbookRange: 'Unit 4 Summary Essay: Global Climate Action (Text A 150-word essay)',
        handoutRange: 'Classroomドライブ共有：Unit 4 リスニング音声ファイル',
        keyTopics: ['Unit 4 Text A 読解・要約', 'Academic Writing (150 words Carbon Reduction)', '通学時のシャドーイング・重要語彙'],
        studiedMinutes: 0,
        aiEstimatedHours: 8.5,
        aiDailyHours: 1.3,
        aiPriorityLevel: '高',
        aiAdvice: '課題「Unit 4 Summary Essay」の提出期限が迫っています。Text Aを精読し、150語のエッセイを作成しましょう。',
        aiMilestones: [
          'Unit 4 Text Aの精読と論点整理',
          '150語要約エッセイのドラフト作成と提出',
          'Classroom共有音声でのシャドーイング'
        ],
        items: [
          { id: 'cr_e1', title: 'Text A 精読・150-word Summary Essay 執筆・提出', category: 'workbook', pageRange: 'Classroom課題', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_e2', title: 'Classroomドライブ音声によるシャドーイング練習', category: 'handout', pageRange: 'ドライブ共有音声', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_e3', title: 'Lesson 5 予習と重要単語・表現のチェック', category: 'textbook', pageRange: 'Lesson 5', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_cr_logic',
        name: '論理・表現 (論理表現)',
        color: '#10b981',
        targetScore: 82,
        currentScore: 0,
        textbookRange: 'Unit 3「Debating Renewable Energy」p.34〜p.52',
        workbookRange: '論理表現ワークブック p.28〜p.45 (Opinion Writing提出)',
        handoutRange: '論理表現スピーチ原稿フォーマット',
        keyTopics: ['仮定法過去・過去完了の使い分け', 'Opinion Essay (主張→理由→具体例の3段構成)', 'プレゼンテーション接続詞 (Furthermore, In contrast)'],
        studiedMinutes: 0,
        aiEstimatedHours: 7.0,
        aiDailyHours: 1.0,
        aiPriorityLevel: '中',
        aiAdvice: '意見論述のフォーマット（主張・論拠・結論）に沿ったライティング添削を事前に行いましょう。',
        aiMilestones: ['Opinion Essayの下書き作成', '論理構成の見直しと提出'],
        items: [
          { id: 'cr_lg1', title: 'Unit 3 例文暗記と仮定法の定着', category: 'textbook', pageRange: 'p.34〜42', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_lg2', title: 'Opinion Essay（120語）作成・提出', category: 'workbook', pageRange: 'ワーク p.40', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_cr_chem',
        name: '化学 (化学・化学基礎)',
        color: '#d97706',
        targetScore: 82,
        currentScore: 0,
        textbookRange: '教科書 第2編「物質の変化」酸化還元反応・中和滴定 p.90〜p.145',
        workbookRange: 'セミナー化学 基本問題120〜155 (提出必須)',
        handoutRange: '半反応式一覧プリント ＆ 酸化還元滴定実験まとめ',
        keyTopics: ['酸化数の求め方・半反応式の作成', '酸化還元滴定の計算 (過マンガン酸カリウム)', '金属のイオン化傾向と電池の仕組み'],
        studiedMinutes: 0,
        aiEstimatedHours: 11.0,
        aiDailyHours: 1.6,
        aiPriorityLevel: '最優先',
        aiAdvice: '半反応式の電子e-の消去とモル比計算を確実に得点源にしましょう。',
        aiMilestones: ['主要な酸化剤・還元剤の半反応式暗記', 'セミナー化学の滴定計算大問完答'],
        items: [
          { id: 'cr_ch1', title: '半反応式の作成トレーニング（プリントNo.4）', category: 'handout', pageRange: 'プリント', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_ch2', title: 'セミナー化学 酸化還元基本問題120〜155', category: 'workbook', pageRange: 'p.60〜74', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_cr_phys',
        name: '物理 (物理・物理基礎)',
        color: '#ea580c',
        targetScore: 80,
        currentScore: 0,
        textbookRange: '教科書「力学的エネルギー保存則と衝突」p.70〜p.115',
        workbookRange: '力学的エネルギー保存則 実験レポート (振り子の運動・グラフ用紙添付)',
        handoutRange: '実験手順プリント ＆ 考察作成ガイドライン',
        keyTopics: ['振り子の運動と力学的エネルギー保存則', 'ばね振り子の力学的エネルギー保存', '非保存力（摩擦力）がする仕事'],
        studiedMinutes: 0,
        aiEstimatedHours: 10.0,
        aiDailyHours: 1.5,
        aiPriorityLevel: '高',
        aiAdvice: '実験レポートの振り子の周期とエネルギー保存のグラフ用紙を添付し、考察を完成させましょう。',
        aiMilestones: [
          '振り子の実験データ整理とグラフ作成',
          'エネルギー保存則の考察欄記入と提出',
          '運動方程式からエネルギー保存則の導出確認'
        ],
        items: [
          { id: 'cr_p1', title: '力学的エネルギー保存則 実験レポート作成（グラフ用紙添付・提出）', category: 'workbook', pageRange: '実験課題', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_p2', title: '教科書：力学的エネルギー保存則の導出確認', category: 'textbook', pageRange: '力学編', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_cr_classics',
        name: '古典探究 (古典探求)',
        color: '#be123c',
        targetScore: 78,
        currentScore: 0,
        textbookRange: '教科書 古文『源氏物語 (桐壺)』・漢文『鴻門之会』',
        workbookRange: '新編 古典探究 準拠ノート p.45〜p.78',
        handoutRange: '助動詞の接続・活用・意味識別演習シート',
        keyTopics: ['敬語の方向（尊敬・謙譲・丁寧の判別）', '助動詞「る・らる・す・さす・しむ」の識別', '鴻門之会 人物関係と重要故事成語'],
        studiedMinutes: 0,
        aiEstimatedHours: 8.0,
        aiDailyHours: 1.2,
        aiPriorityLevel: '中',
        aiAdvice: '源氏物語の人物相関図と敬語の主語特定、漢文の返り点と置き字のチェックを重点的に。',
        aiMilestones: ['古文助動詞の活用表総点検', '鴻門之会の書き下し文音読練習'],
        items: [
          { id: 'cr_cl1', title: '『源氏物語』桐壺の本文品詞分解ノート', category: 'workbook', pageRange: 'p.45〜56', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_cl2', title: '漢文『鴻門之会』重要句法と読みチェック', category: 'textbook', pageRange: 'p.80〜94', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_cr_public',
        name: '公共 (公共)',
        color: '#7c3aed',
        targetScore: 85,
        currentScore: 0,
        textbookRange: '教科書 第2章「民主政治の基本原則と日本国憲法」p.40〜p.85',
        workbookRange: '公共マスターノート p.30〜p.58 (提出指定)',
        handoutRange: '憲法重要判例集プリント (人権侵害と違憲審査)',
        keyTopics: ['国民主権・平和主義・基本的人権の尊重', '三権分立と統治機構 (国会・内閣・裁判所)', '現代の政治参加と選挙制度の課題'],
        studiedMinutes: 0,
        aiEstimatedHours: 6.5,
        aiDailyHours: 1.0,
        aiPriorityLevel: '中',
        aiAdvice: '重要判例の論点（合憲・違憲の判断理由）と国会・内閣の関係を図解で整理してください。',
        aiMilestones: ['公共ノートの穴埋め提出完了', '重要判例まとめプリントの総復習'],
        items: [
          { id: 'cr_pub1', title: '公共マスターノート p.30〜p.58 提出準備', category: 'workbook', pageRange: 'p.30〜58', completed: false, masteryLevel: 'not_started' },
          { id: 'cr_pub2', title: '憲法重要判例プリントの要点チェック', category: 'handout', pageRange: '判例プリント', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_cr_info',
        name: '情報 (情報Ⅰ)',
        color: '#0891b2',
        targetScore: 88,
        currentScore: 0,
        textbookRange: '情報Ⅰ 第3章「コンピュータとプログラミング」p.60〜p.105',
        workbookRange: '情報Ⅰ実習課題 Python基礎コード作成演習',
        handoutRange: 'アルゴリズムとフローチャート演習課題',
        keyTopics: ['Pythonの基本構文 (変数・条件分岐・ループ)', 'ソートと探索アルゴリズム', '情報セキュリティと著作権'],
        studiedMinutes: 0,
        aiEstimatedHours: 6.0,
        aiDailyHours: 0.9,
        aiPriorityLevel: '通常',
        aiAdvice: 'フローチャートとPythonコードの対応関係、2分探索アルゴリズムの手順を確認しましょう。',
        aiMilestones: ['Python実習課題コードの動作確認', 'アルゴリズム演習問題完答'],
        items: [
          { id: 'cr_inf1', title: 'Pythonプログラミング課題の提出', category: 'workbook', pageRange: '課題No.3', completed: false, masteryLevel: 'not_started' }
        ]
      }
    ]
  },
  user_hs1: {
    id: 'test_hs1',
    title: '1学期期末考査 (高校1年 文理共通)',
    startDate: getFutureDate(7),
    endDate: getFutureDate(10),
    subjects: [
      {
        id: 'sub_hs1_math',
        name: '数学Ⅰ・A (数ⅠA)',
        color: '#2563eb',
        targetScore: 85,
        currentScore: 0,
        textbookRange: '数Ⅰ: 数と式・二次関数 / 数A: 場合の数と確率',
        workbookRange: '4STEP 数学Ⅰ+A p.30〜p.75',
        handoutRange: '二次関数の最大最小 頻出プリント',
        keyTopics: ['二次関数の軸と変域による最大最小の場合分け', '二次不等式の解法', '順列と組合せの使い分け (PとC)'],
        studiedMinutes: 0,
        aiEstimatedHours: 13.0,
        aiDailyHours: 1.8,
        aiPriorityLevel: '最優先',
        aiAdvice: '二次関数の軸が動く場合分け問題は必ず出題されます。グラフを描いて視覚的に解きましょう。',
        aiMilestones: ['二次関数最大最小のパターン網羅', '4STEP提出指定範囲の完了'],
        items: [
          { id: 'hs1_m1', title: '4STEP 二次関数の最大最小演習', category: 'workbook', pageRange: 'p.40〜p.58', completed: false, masteryLevel: 'not_started' },
          { id: 'hs1_m2', title: '教科書 二次不等式の例題全解き', category: 'textbook', pageRange: 'p.85〜p.102', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_jp_culture',
        name: '言語文化',
        color: '#f43f5e',
        targetScore: 80,
        currentScore: 0,
        textbookRange: '『竹取物語』『伊勢物語』『徒然草』',
        workbookRange: '新編言語文化ノート p.20〜p.50',
        handoutRange: '古典文法 助動詞の活用表',
        keyTopics: ['用言の活用 (四段・上一・下一・変格)', '助動詞の接続と意味', '伊勢物語の和歌修辞法 (掛詞・縁語)'],
        studiedMinutes: 0,
        aiEstimatedHours: 8.0,
        aiDailyHours: 1.1,
        aiPriorityLevel: '高',
        aiAdvice: '助動詞の接続（未然形接続・連用形接続など）を声に出して暗記しましょう。',
        aiMilestones: ['助動詞活用表の完全マスター', '本文品詞分解の確認'],
        items: [
          { id: 'hs1_j1', title: '助動詞活用テスト対策プリント', category: 'handout', pageRange: 'プリント', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_jp_modern',
        name: '現代の国語 (現代国語)',
        color: '#e11d48',
        targetScore: 82,
        currentScore: 0,
        textbookRange: '評論文読解「言葉と社会」p.20〜p.55',
        workbookRange: '現代文基礎問題集 p.15〜p.40',
        handoutRange: '重要漢字・語彙シート',
        keyTopics: ['指示語・接続語の役割と段落構成', '対比構造（近代と前近代など）の把握', '要約演習（80〜100字）'],
        studiedMinutes: 0,
        aiEstimatedHours: 7.0,
        aiDailyHours: 1.0,
        aiPriorityLevel: '中',
        aiAdvice: '筆者の主張を支える具体例と主張本論を色分けして読む習慣をつけましょう。',
        aiMilestones: ['漢字テスト満点対策', '本文要約の作成'],
        items: [
          { id: 'hs1_jm1', title: '漢字・語句プリントの暗記', category: 'handout', pageRange: '漢字ドリル', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_chem',
        name: '化学 (化学基礎)',
        color: '#d97706',
        targetScore: 80,
        currentScore: 0,
        textbookRange: '物質の構成・原子の構造と周期表・物質量(mol)',
        workbookRange: 'リードα 化学基礎 p.25〜p.60',
        handoutRange: 'mol計算特訓プリント',
        keyTopics: ['同位体と放射性同位体', '電子配置と価電子・周期表の族', '物質量(mol)・アボガドロ定数・モル質量の変換計算'],
        studiedMinutes: 0,
        aiEstimatedHours: 9.0,
        aiDailyHours: 1.3,
        aiPriorityLevel: '最優先',
        aiAdvice: 'mol計算は高校化学のすべての基礎です。単位を明記しながら計算式を立てましょう。',
        aiMilestones: ['mol変換公式の暗文化', 'リードα基本問題の全問正解'],
        items: [
          { id: 'hs1_ch1', title: 'リードα mol計算特訓問題', category: 'workbook', pageRange: 'p.35〜p.48', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_bio',
        name: '生物 (生物基礎)',
        color: '#16a34a',
        targetScore: 82,
        currentScore: 0,
        textbookRange: '第1章「生物と遺伝子」細胞の構造・顕微鏡の使い方・DNAの二重らせん構造',
        workbookRange: 'セミナー生物基礎 p.18〜p.45',
        handoutRange: 'ミクロメーター計算演習シート',
        keyTopics: ['原核細胞と真核細胞の相違点', 'ミクロメーターによる細胞の大きさ測定', 'DNAのヌクレオチドとシャルガフの規則'],
        studiedMinutes: 0,
        aiEstimatedHours: 7.5,
        aiDailyHours: 1.1,
        aiPriorityLevel: '高',
        aiAdvice: 'ミクロメーターの倍率変換計算とシャルガフの塩基対比率計算を得点源に。',
        aiMilestones: ['ミクロメーター計算の完答', '細胞小器官の機能図解まとめ'],
        items: [
          { id: 'hs1_b1', title: 'セミナー生物基礎 提出課題', category: 'workbook', pageRange: 'p.18〜35', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_hist',
        name: '歴史 (歴史総合)',
        color: '#9333ea',
        targetScore: 85,
        currentScore: 0,
        textbookRange: '第1部「近代化と私たち」産業革命と市民革命・大日本帝国憲法',
        workbookRange: '歴史総合パートナーノート p.20〜p.52',
        handoutRange: '近代年表整理プリント',
        keyTopics: ['イギリス産業革命と社会変化', '明治維新と三大改革 (地租改正・徴兵令・学制)', '条約改正交渉と日清・日露戦争'],
        studiedMinutes: 0,
        aiEstimatedHours: 7.0,
        aiDailyHours: 1.0,
        aiPriorityLevel: '中',
        aiAdvice: '出来事の年代暗記だけでなく、因果関係（なぜその条約が結ばれたか）を整理しましょう。',
        aiMilestones: ['パートナーノートの穴埋め完了', '年表の重要年代チェック'],
        items: [
          { id: 'hs1_h1', title: '歴史総合ノートの提出', category: 'workbook', pageRange: 'p.20〜52', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_geo',
        name: '地理 (地理総合)',
        color: '#0d9488',
        targetScore: 82,
        currentScore: 0,
        textbookRange: '世界の気候区分 (ケッペンの気候区分) と植生・土壌',
        workbookRange: '地理総合ワークノート p.15〜p.40',
        handoutRange: '雨温図の判別トレーニングプリント',
        keyTopics: ['ケッペンの気候区分の判定フローチャート', '熱帯・乾燥帯・温帯の農業と人々の生活', '日本の地形と自然災害・ハザードマップ'],
        studiedMinutes: 0,
        aiEstimatedHours: 6.5,
        aiDailyHours: 0.9,
        aiPriorityLevel: '中',
        aiAdvice: '雨温図を見た瞬間に気候区（Af, Aw, Cs, Cfa等）を判定できるように練習しましょう。',
        aiMilestones: ['雨温図判別プリント全問正解', 'ワークノート提出完了'],
        items: [
          { id: 'hs1_g1', title: '雨温図判定特訓プリント', category: 'handout', pageRange: 'プリント', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_info',
        name: '情報 (情報Ⅰ)',
        color: '#0891b2',
        targetScore: 88,
        currentScore: 0,
        textbookRange: '情報社会のルールと情報モラル・情報セキュリティ',
        workbookRange: '情報Ⅰ実習ノート p.10〜p.30',
        handoutRange: '著作権法と知的所有権まとめ',
        keyTopics: ['個人情報の保護とプライバシー', 'サイバー犯罪とマルウェアの種類', '暗号化とデジタル署名'],
        studiedMinutes: 0,
        aiEstimatedHours: 5.5,
        aiDailyHours: 0.8,
        aiPriorityLevel: '通常',
        aiAdvice: '著作権の例外規定（私的使用のための複製や学校教育での利用）の条件を整理しましょう。',
        aiMilestones: ['情報実習課題の提出'],
        items: [
          { id: 'hs1_inf1', title: '情報Ⅰ実習課題の提出', category: 'workbook', pageRange: 'p.10〜30', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_health',
        name: '保健 (保健)',
        color: '#4f46e5',
        targetScore: 85,
        currentScore: 0,
        textbookRange: '現代の健康の考え方・生活習慣病の予防 p.10〜p.42',
        workbookRange: '高校保健ノート p.8〜p.25',
        handoutRange: '応急手当と心肺蘇生法の手順シート',
        keyTopics: ['生活習慣病（がん・心臓病・脳卒中）のリスク要因', '運動・休養・睡眠と健康の関係', '心肺蘇生法とAEDの使用手順'],
        studiedMinutes: 0,
        aiEstimatedHours: 5.0,
        aiDailyHours: 0.7,
        aiPriorityLevel: '通常',
        aiAdvice: 'AEDのパッド貼付位置と胸骨圧迫のリズム・深さを確認しましょう。',
        aiMilestones: ['保健ノート提出'],
        items: [
          { id: 'hs1_hl1', title: '保健ノートの提出', category: 'workbook', pageRange: 'p.8〜25', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_home',
        name: '家庭 (家庭)',
        color: '#ec4899',
        targetScore: 85,
        currentScore: 0,
        textbookRange: '生涯の生活設計と食生活の科学 p.15〜p.50',
        workbookRange: '家庭基礎ワークシート集',
        handoutRange: '栄養素と五大栄養素バランスシート',
        keyTopics: ['五大栄養素の役割と過不足の病気', '食品表示の見方と食品ロス削減', 'ライフステージと社会保障'],
        studiedMinutes: 0,
        aiEstimatedHours: 5.0,
        aiDailyHours: 0.7,
        aiPriorityLevel: '通常',
        aiAdvice: '食品表示のアレルゲン表示義務品目と栄養成分表示の計算方法を復習しましょう。',
        aiMilestones: ['家庭科ワーク提出'],
        items: [
          { id: 'hs1_hm1', title: '家庭基礎ワークシート提出', category: 'workbook', pageRange: 'ワークシート', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs1_music',
        name: '音楽 (音楽)',
        color: '#f59e0b',
        targetScore: 85,
        currentScore: 0,
        textbookRange: '楽典の基礎・合唱曲の分析',
        workbookRange: '高校音楽ノート',
        handoutRange: '音程・調性判定プリント',
        keyTopics: ['音程の度数計算 (長・短・完全)', '長音階と短音階の調号判別', '合唱曲のフレーズと表現意図'],
        studiedMinutes: 0,
        aiEstimatedHours: 4.5,
        aiDailyHours: 0.6,
        aiPriorityLevel: '通常',
        aiAdvice: '調号（シャープ・フラットの個数）から主音を割り出す公式を練習しましょう。',
        aiMilestones: ['楽典プリント完答'],
        items: [
          { id: 'hs1_mu1', title: '楽典基礎問題プリント', category: 'handout', pageRange: 'プリント', completed: false, masteryLevel: 'not_started' }
        ]
      }
    ]
  },
  user_hs3: {
    id: 'test_hs3',
    title: '2学期中間考査 ＆ 共通テスト模試演習 (高校3年 受験対策)',
    startDate: getFutureDate(5),
    endDate: getFutureDate(8),
    subjects: [
      {
        id: 'sub_hs3_math3c',
        name: '数学Ⅲ・C (数ⅢC)',
        color: '#1d4ed8',
        targetScore: 82,
        currentScore: 0,
        textbookRange: '極限・微分法の応用・積分法の応用 (体積・曲線の長さ)',
        workbookRange: 'チャート式 数学Ⅲ+C 難関大演習',
        handoutRange: '難関大過去問 微積融合大問セット',
        keyTopics: ['部分積分法と置換積分法の定石', '回転体の体積と立体の断面積積分', '媒介変数表示と速度・加速度'],
        studiedMinutes: 0,
        aiEstimatedHours: 15.0,
        aiDailyHours: 2.5,
        aiPriorityLevel: '最優先',
        aiAdvice: '積分の計算スピードと計算ミス防止が最重要。立体の断面図を確実に描きましょう。',
        aiMilestones: ['微積分の計算演習20題完答', '過去問演習の自己採点と解き直し'],
        items: [
          { id: 'hs3_m3_1', title: '積分計算特訓（部分積分・置換積分）', category: 'workbook', pageRange: 'p.120〜145', completed: false, masteryLevel: 'not_started' },
          { id: 'hs3_m3_2', title: '回転体の体積計算演習', category: 'handout', pageRange: '大問セット', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs3_math1a2b',
        name: '数学ⅠA・ⅡB (数ⅠA・数ⅡB 演習)',
        color: '#2563eb',
        targetScore: 88,
        currentScore: 0,
        textbookRange: '共通テスト形式 総合演習 (数列・ベクトル・確率統計)',
        workbookRange: '共通テスト実戦問題集 60分タイムアタック',
        handoutRange: '時間配分攻略シート',
        keyTopics: ['数列の群数列と確率漸化式', '空間ベクトルの内積と球面方程式', '図形と方程式の軌跡問題'],
        studiedMinutes: 0,
        aiEstimatedHours: 12.0,
        aiDailyHours: 2.0,
        aiPriorityLevel: '最優先',
        aiAdvice: '各大問の時間配分を厳守し、計算が長引いたら一旦見切る判断力を鍛えましょう。',
        aiMilestones: ['実戦模試1回分の解き直し完了'],
        items: [
          { id: 'hs3_m12_1', title: '共通テスト形式実戦模試 第1回演習', category: 'workbook', pageRange: '第1回', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs3_eng',
        name: '英語コミュニケーション (英コミュ)',
        color: '#059669',
        targetScore: 85,
        currentScore: 0,
        textbookRange: '大学入試長文読解 (自然科学・社会論説文)',
        workbookRange: '長文問題集 レベル5 提出',
        handoutRange: '最新時事英語・共通テストリーディング攻略法',
        keyTopics: ['パラグラフリーディングと段落ごとの要旨把握', '図表読み取り問題の速読スキミング', '多義語のコンテキスト判断'],
        studiedMinutes: 0,
        aiEstimatedHours: 10.0,
        aiDailyHours: 1.5,
        aiPriorityLevel: '高',
        aiAdvice: '設問のキーワードを先読みしてから本文の該当箇所をスキャンする速度を上げましょう。',
        aiMilestones: ['長文演習の精読とシャドーイング'],
        items: [
          { id: 'hs3_e1', title: '長文読解演習 No.7〜10', category: 'workbook', pageRange: 'p.50〜68', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs3_logic',
        name: '論理・表現 (論理表現)',
        color: '#10b981',
        targetScore: 80,
        currentScore: 0,
        textbookRange: '自由英作文対策 (80〜120語) 論理展開と文法正確性',
        workbookRange: '英作文ハイパートレーニング 和文英訳＆自由英作編',
        handoutRange: '頻出表現・添削フィードバックシート',
        keyTopics: ['賛否論述の構成 (Introduction, Body, Conclusion)', '無生物主語構文と関係詞による文の簡潔化', 'スペルミス・冠詞・前置詞の厳密チェック'],
        studiedMinutes: 0,
        aiEstimatedHours: 7.0,
        aiDailyHours: 1.0,
        aiPriorityLevel: '中',
        aiAdvice: '自分の書いたエッセイを声に出して読み、文法的な不自然さをセルフチェックしましょう。',
        aiMilestones: ['自由英作文2テーマの提出'],
        items: [
          { id: 'hs3_lg1', title: '自由英作文提出課題 2題', category: 'workbook', pageRange: '課題シート', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs3_chem',
        name: '化学 (化学)',
        color: '#d97706',
        targetScore: 84,
        currentScore: 0,
        textbookRange: '有機化学 (異性体・芳香族化合物・高分子化合物)',
        workbookRange: '重要問題集 有機分野 A問題全解き',
        handoutRange: '有機構造決定 演習シート',
        keyTopics: ['元素分析と組成式・分子式の決定', '芳香族化合物の分離実験フロー', '油脂のけん化価・ヨウ素価の計算', '天然高分子 (糖類・アミノ酸・タンパク質)'],
        studiedMinutes: 0,
        aiEstimatedHours: 12.0,
        aiDailyHours: 1.8,
        aiPriorityLevel: '最優先',
        aiAdvice: '構造決定問題は、反応経路図を余白に素早く描き出す手順を確立しましょう。',
        aiMilestones: ['芳香族化合物の分離実験フロー完全暗記', '構造決定大問の自力完答'],
        items: [
          { id: 'hs3_ch1', title: '重要問題集 有機構造決定問題演習', category: 'workbook', pageRange: 'p.90〜115', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs3_phys',
        name: '物理 (物理)',
        color: '#ea580c',
        targetScore: 82,
        currentScore: 0,
        textbookRange: '電磁気学 (コンデンサーの接続・電磁誘導・交流)',
        workbookRange: '名問の森 物理 (電磁気編)',
        handoutRange: '電磁誘導のレンツの法則とファラデーの法則特訓プリント',
        keyTopics: ['導体棒の運動と誘導起電力・終端速度', '自己誘導と相互誘導・コイルのエネルギー', 'RLC直列回路のインピーダンス計算'],
        studiedMinutes: 0,
        aiEstimatedHours: 12.0,
        aiDailyHours: 1.8,
        aiPriorityLevel: '最優先',
        aiAdvice: '回路方程式と力のつり合い・エネルギー保存則を連立して解くプロセスを徹底しましょう。',
        aiMilestones: ['電磁気大問の解法パターン定着'],
        items: [
          { id: 'hs3_ph1', title: '導体棒の電磁誘導 総合演習', category: 'workbook', pageRange: '名問の森 No.25〜32', completed: false, masteryLevel: 'not_started' }
        ]
      },
      {
        id: 'sub_hs3_classics',
        name: '古典探究 (古典探求)',
        color: '#be123c',
        targetScore: 80,
        currentScore: 0,
        textbookRange: '共通テスト対策 古文・漢文 総合演習',
        workbookRange: 'マーク式基礎問題集 古文・漢文',
        handoutRange: '重要古語315語 ＆ 漢文句法必携チェック',
        keyTopics: ['古文：主語特定・場面展開の把握と心情推察', '漢文：反語・使役・受身の複文句法', '共通テスト特有の複数テキスト対照問題'],
        studiedMinutes: 0,
        aiEstimatedHours: 8.0,
        aiDailyHours: 1.2,
        aiPriorityLevel: '高',
        aiAdvice: '設問の和歌の解釈と、本文のストーリー展開の因果関係を素早く照合しましょう。',
        aiMilestones: ['共通テスト過去問2回分の演習'],
        items: [
          { id: 'hs3_cl1', title: '共通テスト過去問 古文漢文演習', category: 'workbook', pageRange: '過去問', completed: false, masteryLevel: 'not_started' }
        ]
      }
    ]
  },
  user_ms: {
    id: 'test_ms_1',
    title: '中学3年 2学期期末テスト (高校入試内申直結)',
    startDate: getFutureDate(10),
    endDate: getFutureDate(12),
    subjects: [
      {
        id: 'sub_ms_math',
        name: '数学 (2次方程式・2次関数)',
        color: '#3b82f6',
        targetScore: 90,
        currentScore: 72,
        textbookRange: '教科書 p.75〜p.120 (解の公式・放物線と直線の交点)',
        workbookRange: '教科書ワーク p.60〜p.98 (全問提出必須)',
        handoutRange: '定期テスト予想問題プリント No.1〜No.4',
        keyTopics: ['2次方程式の解の公式・因数分解での解法', 'y=ax^2の変域と変化の割合', '放物線と三角形の面積二等分問題'],
        studiedMinutes: 380,
        aiEstimatedHours: 14.0,
        aiDailyHours: 2.0,
        aiPriorityLevel: '最優先',
        aiAdvice: '解の公式の計算ミスを撲滅し、放物線と三角形の面積を求める応用大問に時間を割きましょう。',
        aiMilestones: ['ワーク提出範囲の1周目完了', '変化の割合の裏技公式マスター', '面積二等分問題の解法パターン定着'],
        items: [
          { id: 'ms_m1', title: '解の公式の徹底計算特訓', category: 'textbook', pageRange: 'p.75〜p.90', completed: true, masteryLevel: 'perfect' },
          { id: 'ms_m2', title: 'ワーク 変域と変化の割合（提出範囲）', category: 'workbook', pageRange: 'p.60〜p.78', completed: true, masteryLevel: 'good' },
          { id: 'ms_m3', title: 'ワーク 放物線と図形の難問演習', category: 'workbook', pageRange: 'p.79〜p.98', completed: false, masteryLevel: 'shaky' }
        ]
      },
      {
        id: 'sub_ms_eng',
        name: '英語 (関係代名詞・分詞の修飾)',
        color: '#10b981',
        targetScore: 88,
        currentScore: 75,
        textbookRange: 'Unit 4 & Unit 5 (p.45〜p.72)',
        workbookRange: 'エイゴワーク p.40〜p.68',
        handoutRange: '入試頻出リスニング対策プリント & 単語ドリル',
        keyTopics: ['主格の関係代名詞 who, which, that', '接触節（目的格関係代名詞の省略）', '後置修飾（現在分詞・過去分詞）'],
        studiedMinutes: 240,
        aiEstimatedHours: 8.5,
        aiDailyHours: 1.2,
        aiPriorityLevel: '高',
        aiAdvice: '後ろから名詞を修飾する語順の並び替え問題を反復演習しましょう。教科書本文の和訳と暗記がカギです。',
        aiMilestones: ['Unit 4 & 5 本文の日本語訳・英作テスト', 'ワークの英作文セクション満点化'],
        items: [
          { id: 'ms_e1', title: '関係代名詞の基本文法マスター', category: 'workbook', pageRange: 'p.40〜p.52', completed: true, masteryLevel: 'good' },
          { id: 'ms_e2', title: 'Unit 5 本文暗記＆並び替え問題', category: 'textbook', pageRange: 'p.58〜p.72', completed: false, masteryLevel: 'shaky' }
        ]
      }
    ]
  },
  user_qual: {
    id: 'test_qual_1',
    title: 'ITパスポート試験 (秋期CBT受験予定)',
    startDate: getFutureDate(18),
    endDate: getFutureDate(18),
    subjects: [
      {
        id: 'sub_strat',
        name: 'ストラテジ系 (経営・法務)',
        color: '#8b5cf6',
        targetScore: 750,
        currentScore: 580,
        textbookRange: '参考書 第1章〜第4章 (企業活動・法務・経営戦略)',
        workbookRange: '過去問道場 直近4回分 (正答率80%目標)',
        handoutRange: '新シラバス6.0用語まとめノート (AI倫理・DX・SDGs)',
        keyTopics: ['著作権法・特許法・個人情報保護法', '財務諸表（損益計算書・貸借対照表・ROE）', 'サプライチェーンマネジメント(SCM)・ERP'],
        studiedMinutes: 720,
        aiEstimatedHours: 18.0,
        aiDailyHours: 1.5,
        aiPriorityLevel: '最優先',
        aiAdvice: '法務分野の引っかけ問題と、最新シラバスのDX・生成AI関連用語の頻出問題を集中的に過去問演習してください。',
        aiMilestones: ['法務の用語暗記シートの総復習', '過去問道場のストラテジ系正答率85%達成'],
        items: [
          { id: 'q1', title: '企業会計（損益分岐点・売上総利益計算）', category: 'workbook', pageRange: '第2章', completed: true, masteryLevel: 'perfect' },
          { id: 'q2', title: '法務・コンプライアンス用語暗記', category: 'textbook', pageRange: '第4章', completed: false, masteryLevel: 'shaky' }
        ]
      },
      {
        id: 'sub_tech',
        name: 'テクノロジ系 (セキュリティ・ネットワーク)',
        color: '#3b82f6',
        targetScore: 800,
        currentScore: 660,
        textbookRange: '参考書 第7章〜第10章 (アルゴリズム・暗号化・セキュリティ)',
        workbookRange: '過去問道場 セキュリティ分野特訓200問',
        handoutRange: 'サイバー攻撃手法 & 認証プロトコル対応表',
        keyTopics: ['共通鍵暗号・公開鍵暗号・ディジタル署名', 'マルウェア分類とソーシャルエンジニアリング', '2要素認証・バイオメトリクス認証'],
        studiedMinutes: 650,
        aiEstimatedHours: 14.0,
        aiDailyHours: 1.2,
        aiPriorityLevel: '高',
        aiAdvice: '公開鍵暗号とディジタル署名の暗号化・復号キーの組み合わせは必ず出題されます。図解で理解しておきましょう。',
        aiMilestones: ['暗号方式と認証のメカニズム図解整理', '過去問セキュリティ分野正答率90%'],
        items: [
          { id: 'q3', title: '暗号化とディジタル署名の仕組み整理', category: 'textbook', pageRange: '第8章', completed: true, masteryLevel: 'good' },
          { id: 'q4', title: '過去問セキュリティ特訓 100問演習', category: 'workbook', pageRange: '過去問道場', completed: false, masteryLevel: 'shaky' }
        ]
      }
    ]
  }
};

export const INITIAL_DEADLINES: Record<string, SubmissionDeadline[]> = {
  user_hs: [
    {
      id: 'dl_cr_1',
      title: '第3章「微分の応用」確認テスト演習プリント',
      subjectId: 'sub_cr_math',
      subjectName: '数学II・B (数ⅡB)',
      dueDate: getFutureDate(2),
      dueTime: '23:59',
      completed: false,
      notes: '教科書p.80〜84の増減表作成と極値計算。大問1〜4をノートに解いて提出。'
    },
    {
      id: 'dl_cr_2',
      title: 'Unit 4 Summary Essay: Global Climate Action',
      subjectId: 'sub_cr_eng',
      subjectName: '英語コミュニケーション (英コミュ)',
      dueDate: getFutureDate(4),
      dueTime: '17:00',
      completed: false,
      notes: 'Please read Text A and write a 150-word summary essay.'
    },
    {
      id: 'dl_cr_3',
      title: 'セミナー化学 酸化還元滴定 基本問題ノート提出',
      subjectId: 'sub_cr_chem',
      subjectName: '化学 (化学・化学基礎)',
      dueDate: getFutureDate(5),
      dueTime: '08:30',
      completed: false,
      notes: '半反応式の電子消去と過マンガン酸カリウム滴定の計算途中式を明記。'
    },
    {
      id: 'dl_cr_4',
      title: '力学的エネルギー保存則 実験レポート',
      subjectId: 'sub_cr_phys',
      subjectName: '物理 (物理・物理基礎)',
      dueDate: getFutureDate(6),
      dueTime: '08:30',
      completed: false,
      notes: '振り子の運動とエネルギー変換の考察。グラフ用紙を添付して提出。'
    },
    {
      id: 'dl_cr_5',
      title: '公共マスターノート 第2章 日本国憲法と統治機構',
      subjectId: 'sub_cr_public',
      subjectName: '公共 (公共)',
      dueDate: getFutureDate(7),
      dueTime: '授業開始時',
      completed: false,
      notes: '重要判例（違憲審査）のまとめ穴埋めを完了して提出。'
    }
  ],
  user_hs1: [
    {
      id: 'dl_hs1_1',
      title: '4STEP 数学Ⅰ+A 二次関数最大最小 演習ノート',
      subjectId: 'sub_hs1_math',
      subjectName: '数学Ⅰ・A (数ⅠA)',
      dueDate: getFutureDate(3),
      dueTime: '朝のSHR',
      completed: false,
      notes: '場合分けのグラフ概形を赤ペンで添削して提出。'
    },
    {
      id: 'dl_hs1_2',
      title: '言語文化 助動詞活用テスト演習プリント',
      subjectId: 'sub_hs1_jp_culture',
      subjectName: '言語文化',
      dueDate: getFutureDate(4),
      dueTime: '国語授業時',
      completed: false,
      notes: 'る・らる・す・さす・しむの接続と意味の完全暗記'
    },
    {
      id: 'dl_hs1_3',
      title: 'リードα 化学基礎 mol計算特訓ドリル',
      subjectId: 'sub_hs1_chem',
      subjectName: '化学 (化学基礎)',
      dueDate: getFutureDate(5),
      dueTime: '16:00',
      completed: false,
      notes: '気体の標準状態体積(22.4L)とモル濃度の複合計算'
    }
  ],
  user_hs3: [
    {
      id: 'dl_hs3_1',
      title: '難関大微積分 過去問演習大問セット',
      subjectId: 'sub_hs3_math3c',
      subjectName: '数学Ⅲ・C (数ⅢC)',
      dueDate: getFutureDate(2),
      dueTime: '23:59',
      completed: false,
      notes: '回転体の体積積分・置換積分の答案記述添削用'
    },
    {
      id: 'dl_hs3_2',
      title: '重要問題集 有機構造決定問題 No.15〜22',
      subjectId: 'sub_hs3_chem',
      subjectName: '化学 (化学)',
      dueDate: getFutureDate(4),
      dueTime: '化学授業時',
      completed: false,
      notes: 'エステル異性体とヨードホルム反応の構造推定'
    },
    {
      id: 'dl_hs3_3',
      title: '共通テスト形式 英語長文読解 60分テスト演習',
      subjectId: 'sub_hs3_eng',
      subjectName: '英語コミュニケーション (英コミュ)',
      dueDate: getFutureDate(6),
      dueTime: '17:00',
      completed: false,
      notes: '段落要旨メモを残しながら解き直しの跡を提出'
    }
  ],
  user_ms: [
    {
      id: 'd_ms_1',
      title: '数学ワーク (p.60〜p.98) 全ページ提出',
      subjectId: 'sub_ms_math',
      subjectName: '数学',
      dueDate: getFutureDate(3),
      dueTime: '朝のSHR',
      completed: false,
      notes: '間違えた問題は付箋を貼って解き直しの跡を残す。内申評価A必須！'
    },
    {
      id: 'd_ms_2',
      title: '英語ワーク Unit 4 & 5 本文和訳ノート提出',
      subjectId: 'sub_ms_eng',
      subjectName: '英語',
      dueDate: getFutureDate(6),
      dueTime: '英語の授業開始時',
      completed: true,
      notes: '新出単語の意味調べ完了必須'
    }
  ],
  user_qual: [
    {
      id: 'd_q_1',
      title: 'ITパスポート CBT会場受験予約・受験票印刷',
      subjectId: 'sub_strat',
      subjectName: 'ストラテジ系',
      dueDate: getFutureDate(5),
      dueTime: '23:59',
      completed: true,
      notes: '会場と本人確認書類の有効期限チェック'
    },
    {
      id: 'd_q_2',
      title: '過去問道場 直近4期分 模試モード全完',
      subjectId: 'sub_tech',
      subjectName: 'テクノロジ系',
      dueDate: getFutureDate(12),
      dueTime: '23:59',
      completed: false,
      notes: '総合得点800点以上を安定して超えること'
    }
  ]
};

export const INITIAL_FRIEND_RANKS: FriendRank[] = [
  {
    id: 'f1',
    name: '田中 蒼汰 (高校2年)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
    weeklyMinutes: 840, // 14 hours
    streakDays: 16,
    statusMessage: '🔥 数学のクリアーワーク3周目突入！負けない！',
    weeklyPoints: 980,
    totalPoints: 2150,
    rankLeague: 'プラチナ',
    pointsBreakdown: {
      tasks: 280,
      studyTime: 420,
      dailyBonus: 150,
      streakBonus: 130
    }
  },
  {
    id: 'f_me',
    name: '山田 涼太 (あなた)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    weeklyMinutes: 680,
    streakDays: 7,
    statusMessage: '🚀 Google Classroom連携＆デイリーボーナス継続中！',
    isCurrentUser: true,
    weeklyPoints: 850,
    totalPoints: 1680,
    rankLeague: 'ゴールド',
    pointsBreakdown: {
      tasks: 240,
      studyTime: 340,
      dailyBonus: 150,
      streakBonus: 120
    }
  },
  {
    id: 'f2',
    name: '伊藤 美羽 (高校2年)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    weeklyMinutes: 690, // 11.5 hours
    streakDays: 11,
    statusMessage: '☕ 英語長文のシャドーイング中。週末は図書館行きます',
    weeklyPoints: 760,
    totalPoints: 1520,
    rankLeague: 'ゴールド',
    pointsBreakdown: {
      tasks: 200,
      studyTime: 345,
      dailyBonus: 120,
      streakBonus: 95
    }
  },
  {
    id: 'f3',
    name: '小林 蓮 (高校2年)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    weeklyMinutes: 510, // 8.5 hours
    streakDays: 8,
    statusMessage: '⚡ 化学基礎のモル計算、やっと克服できた！',
    weeklyPoints: 620,
    totalPoints: 1290,
    rankLeague: 'シルバー',
    pointsBreakdown: {
      tasks: 180,
      studyTime: 255,
      dailyBonus: 100,
      streakBonus: 85
    }
  },
  {
    id: 'f4',
    name: '中村 陽菜 (高校2年)',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    weeklyMinutes: 440,
    streakDays: 6,
    statusMessage: '📖 古文助動詞の活用表暗記中〜',
    weeklyPoints: 510,
    totalPoints: 1080,
    rankLeague: 'シルバー',
    pointsBreakdown: {
      tasks: 160,
      studyTime: 220,
      dailyBonus: 70,
      streakBonus: 60
    }
  }
];

export const INITIAL_ANALYSIS_HISTORY: CameraAnalysisResult[] = [
  {
    id: 'a1',
    date: '2026-09-08',
    subject: '数学Ⅱ (前回小テスト)',
    overallScoreAssessment: '得点率 58% (基礎計算は○だが、接線の立式と増減表で大幅失点)',
    identifiedWeaknesses: [
      {
        topic: '微分係数と接線の方程式',
        severity: '要重点対策',
        explanation: '曲線上の点 (t, f(t)) での接線の傾き f\'(t) を求める際に、導関数の符号ミスで傾きが逆転していました。'
      },
      {
        topic: '増減表の矢印の向きと極値の判定',
        severity: '要対策',
        explanation: 'f\'(x) の正負の判定で、因数分解した式の軸の位置を誤認しています。'
      }
    ],
    identifiedStrengths: [
      {
        topic: '多項式の導関数公式',
        explanation: 'x^n の微分計算は完璧にミスなくできています。'
      }
    ],
    actionPlan: [
      'ワーク p.46 の例題3「接線の方程式」を3回自力で完答するまで解き直す',
      '増減表を書く前に、導関数の2次関数のグラフ概形を余白にメモする習慣をつける',
      '提出課題ワークの同型問題に赤付箋を貼り、明日朝の15分で再挑戦する'
    ]
  }
];

export const SAMPLE_TEST_PAPERS = [
  {
    id: 'sample_chem',
    title: '高校化学 酸化還元反応＆中和滴定小テスト（モル比・価数計算ミス例）',
    subject: '化学 (化学・化学基礎)',
    previewUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    description: '過マンガン酸カリウムとシュウ酸の半反応式消去で電子数を掛け間違えた減点答案'
  },
  {
    id: 'sample_math',
    title: '高校数学Ⅱ 微分小テスト（接線の立式ミス＆増減表の符号ミス例）',
    subject: '数学II・B (数ⅡB)',
    previewUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    description: '導関数f\'(x)の因数分解符号反転、接線方程式の接点代入漏れ答案'
  },
  {
    id: 'sample_eng',
    title: '英語コミュニケーション＆論理表現 Essay課題（時制・接続詞エラー例）',
    subject: '英語コミュニケーション',
    previewUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    description: '関係代名詞の主格・目的格の取り違え、論理展開のつなぎ言葉（However/Therefore）誤用答案'
  },
  {
    id: 'sample_classics',
    title: '古典探究 『源氏物語』読解テスト（助動詞識別・敬語の客体判定ミス例）',
    subject: '古典探究 (古典探求)',
    previewUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    description: '助動詞「る・らる」の受身と自発の判別ミス、主語特定の減点答案'
  },
  {
    id: 'sample_phys',
    title: '物理基礎 力学的エネルギー保存則 実験レポート（非保存力の仕事ミス例）',
    subject: '物理 (物理・物理基礎)',
    previewUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    description: '摩擦力がした負の仕事の符号ミス、振り子の最高点での力学的エネルギー立式エラー'
  }
];
