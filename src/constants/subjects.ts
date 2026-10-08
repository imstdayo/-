export interface HighSchoolSubjectDefinition {
  id: string;
  name: string;
  shortName: string;
  category: '数学' | '英語' | '国語' | '理科' | '地歴・公民' | '情報・実技';
  grades: (1 | 2 | 3)[];
  color: string;
  defaultTargetScore: number;
  sampleTopics: string[];
  defaultTextbook: string;
  defaultWorkbook: string;
}

export const HIGH_SCHOOL_SUBJECTS: HighSchoolSubjectDefinition[] = [
  // 数学
  {
    id: 'sub_math_1a',
    name: '数学Ⅰ・A (数ⅠA)',
    shortName: '数ⅠA',
    category: '数学',
    grades: [1, 2, 3],
    color: '#2563eb', // blue-600
    defaultTargetScore: 80,
    sampleTopics: ['数と式・二次関数', '図形と計量 (三角比)', 'データの分析', '場合の数と確率', '図形の性質'],
    defaultTextbook: '数学Ⅰ・数学A 教科書 p.40〜p.120',
    defaultWorkbook: '4STEP / チャート式 例題＋練習問題'
  },
  {
    id: 'sub_math_2b',
    name: '数学Ⅱ・B (数ⅡB)',
    shortName: '数ⅡB',
    category: '数学',
    grades: [2, 3],
    color: '#3b82f6', // blue-500
    defaultTargetScore: 80,
    sampleTopics: ['方程式・式と証明', '図形と方程式', '三角関数・指数対数関数', '微分法と積分法', '数列・統計的な推測'],
    defaultTextbook: '数学Ⅱ・数学B 教科書 p.60〜p.140',
    defaultWorkbook: 'クリアー / Focus Gold 第2章〜第4章'
  },
  {
    id: 'sub_math_3c',
    name: '数学Ⅲ・C (数ⅢC)',
    shortName: '数ⅢC',
    category: '数学',
    grades: [2, 3],
    color: '#1d4ed8', // blue-700
    defaultTargetScore: 75,
    sampleTopics: ['極限・微分法・積分法の応用', '複素数平面', '式と曲線 (二次曲線)', '平面・空間のベクトル'],
    defaultTextbook: '数学Ⅲ・数学C 教科書 p.30〜p.150',
    defaultWorkbook: 'チャート式 数学Ⅲ+C 応用演習'
  },

  // 英語
  {
    id: 'sub_eng_comm',
    name: '英語コミュニケーション (英コミュ)',
    shortName: '英コミュ',
    category: '英語',
    grades: [1, 2, 3],
    color: '#059669', // emerald-600
    defaultTargetScore: 85,
    sampleTopics: ['長文読解・要約演習 (Part 1〜4)', 'Grammar in Context (関係詞・仮定法)', 'Academic Vocabulary・語彙力強化', 'リスニング＆シャドーイング'],
    defaultTextbook: 'English Logic and Expression / Communication Text Lesson 3〜5',
    defaultWorkbook: '英語コミュニケーション ワークブック p.20〜p.60'
  },
  {
    id: 'sub_eng_logic',
    name: '論理・表現 (論理表現)',
    shortName: '論理表現',
    category: '英語',
    grades: [1, 2, 3],
    color: '#10b981', // emerald-500
    defaultTargetScore: 82,
    sampleTopics: ['エッセイライティング (100〜150語)', 'スピーチ・プレゼンテーション原稿', '時制の一致・助動詞・比較構文', 'ディベート・ディスカッション表現'],
    defaultTextbook: '論理・表現 Ⅰ/Ⅱ 教科書 Unit 2〜4',
    defaultWorkbook: '論理・表現 ワーク＆ライティングノート'
  },

  // 国語
  {
    id: 'sub_jp_modern',
    name: '現代の国語 (現代国語)',
    shortName: '現代国語',
    category: '国語',
    grades: [1, 2, 3],
    color: '#e11d48', // rose-600
    defaultTargetScore: 80,
    sampleTopics: ['論理的文章の読解 (評論・説明文)', '実用的な文章の分析・要約', '語彙・漢字・常用四字熟語', '論述・意見提示の構成法'],
    defaultTextbook: '現代の国語 教科書 評論文 p.35〜p.88',
    defaultWorkbook: '現代文アプローチ / 読解問題集'
  },
  {
    id: 'sub_jp_lang_culture',
    name: '言語文化',
    shortName: '言語文化',
    category: '国語',
    grades: [1, 2],
    color: '#f43f5e', // rose-500
    defaultTargetScore: 78,
    sampleTopics: ['古典文法の基礎 (助動詞の活用と識別)', '古文読解 (竹取物語・伊勢物語・徒然草)', '漢文の基本構造・返り点・再読文字', '近代文学・小説・短歌俳句'],
    defaultTextbook: '言語文化 教科書 古典編 p.50〜p.110',
    defaultWorkbook: '新編 言語文化 準拠ワークブック'
  },
  {
    id: 'sub_jp_classics',
    name: '古典探究 (古典探求)',
    shortName: '古典探究',
    category: '国語',
    grades: [2, 3],
    color: '#be123c', // rose-700
    defaultTargetScore: 80,
    sampleTopics: ['古文：源氏物語・大鏡・枕草子・更級日記', '敬語法・助詞の識別・和歌修辞法', '漢文：史記・唐詩・十八史略・諸子百家', '訓読と書き下し文・文脈把握'],
    defaultTextbook: '古典探究 教科書 古文・漢文編 p.40〜p.130',
    defaultWorkbook: '体系古典文法演習ノート / 漢文必携'
  },

  // 理科
  {
    id: 'sub_sci_chem',
    name: '化学 (化学・化学基礎)',
    shortName: '化学',
    category: '理科',
    grades: [1, 2, 3],
    color: '#d97706', // amber-600
    defaultTargetScore: 80,
    sampleTopics: ['物質量(mol)と濃度計算', '酸と塩基・中和滴定', '酸化還元反応・イオン化傾向', '熱化学・電池と電気分解', '無機物質・有機化学の基礎'],
    defaultTextbook: '化学 / 化学基礎 教科書 第2章〜第4章',
    defaultWorkbook: 'セミナー化学 / リードα 例題・基本問題'
  },
  {
    id: 'sub_sci_phys',
    name: '物理 (物理・物理基礎)',
    shortName: '物理',
    category: '理科',
    grades: [1, 2, 3],
    color: '#ea580c', // orange-600
    defaultTargetScore: 80,
    sampleTopics: ['等加速度直線運動と落体の運動', 'ニュートンの運動方程式・摩擦力', '力学的エネルギー保存則', '波動・音波・光波の屈折', '電磁気・コンデンサー・回路計算'],
    defaultTextbook: '物理 / 物理基礎 教科書 力学編 p.20〜p.95',
    defaultWorkbook: 'アクセス物理 / センサー物理基礎'
  },
  {
    id: 'sub_sci_bio',
    name: '生物 (生物・生物基礎)',
    shortName: '生物',
    category: '理科',
    grades: [1, 2, 3],
    color: '#16a34a', // green-600
    defaultTargetScore: 82,
    sampleTopics: ['細胞の構造とエネルギー (ATP・光合成・呼吸)', '遺伝情報とDNAの発現 (転写・翻訳)', '生殖と発生・生体防御・免疫機構', '植生と生態系・バイオーム'],
    defaultTextbook: '生物 / 生物基礎 教科書 第1編・第2編',
    defaultWorkbook: 'エクセル生物 / スクエア生物基礎'
  },
  {
    id: 'sub_sci_earth',
    name: '地学 (地学・地学基礎)',
    shortName: '地学',
    category: '理科',
    grades: [1, 2, 3],
    color: '#0284c7', // light-blue-600
    defaultTargetScore: 80,
    sampleTopics: ['地球の内部構造とプレートテクトニクス', '地震波の伝播と走時曲線', '大気の循環と気象現象', '太陽系・恒星の進化・宇宙の構造'],
    defaultTextbook: '地学 / 地学基礎 教科書 p.20〜p.85',
    defaultWorkbook: '地学基礎ワーク / 図録演習ノート'
  },

  // 地歴・公民
  {
    id: 'sub_soc_geo',
    name: '地理 (地理総合・地理探究)',
    shortName: '地理',
    category: '地歴・公民',
    grades: [1, 2, 3],
    color: '#0d9488', // teal-600
    defaultTargetScore: 82,
    sampleTopics: ['地図と地理情報システム (GIS)', '世界の気候区分・自然環境と生活', '世界の人口問題・食料資源・エネルギー', '日本の防災と地域調査・都市構造'],
    defaultTextbook: '地理総合 / 地理探究 教科書 第1編〜第3編',
    defaultWorkbook: '新詳地理資料 / 地理総合ワークノート'
  },
  {
    id: 'sub_soc_hist',
    name: '歴史 (歴史総合・日本史・世界史)',
    shortName: '歴史',
    category: '地歴・公民',
    grades: [1, 2, 3],
    color: '#9333ea', // purple-600
    defaultTargetScore: 82,
    sampleTopics: ['近代化と私たち (産業革命・国民国家の形成)', '国際秩序の変容と二大世界大戦', '冷戦構造と現代の世界・戦後日本復興', '重要史料の読解・年表整理'],
    defaultTextbook: '歴史総合 教科書 p.30〜p.120',
    defaultWorkbook: '歴史総合パートナー / 用語集ノート'
  },
  {
    id: 'sub_soc_public',
    name: '公共 (公共・政治経済)',
    shortName: '公共',
    category: '地歴・公民',
    grades: [1, 2, 3],
    color: '#7c3aed', // violet-600
    defaultTargetScore: 85,
    sampleTopics: ['青年期と自己形成・倫理的思想', '日本国憲法の基本原則と基本的人権', '現代の民主政治と選挙・統治機構', '市場経済の仕組み・金融・財政政策', 'グローバル化と国際社会の課題'],
    defaultTextbook: '公共 教科書 第1章〜第3章',
    defaultWorkbook: '新公共ノート / 演習問題集'
  },

  // 情報・実技・保健
  {
    id: 'sub_info',
    name: '情報 (情報Ⅰ・情報Ⅱ)',
    shortName: '情報',
    category: '情報・実技',
    grades: [1, 2, 3],
    color: '#0891b2', // cyan-600
    defaultTargetScore: 88,
    sampleTopics: ['情報社会の問題解決・情報セキュリティ', 'コミュニケーションと情報デザイン', 'コンピュータとプログラミング (Python・アルゴリズム)', 'データの活用・情報通信ネットワーク'],
    defaultTextbook: '情報Ⅰ 教科書 第2章〜第4章',
    defaultWorkbook: '情報Ⅰ実習ノート / プログラミング演習ドリル'
  },
  {
    id: 'sub_health',
    name: '保健 (保健体育)',
    shortName: '保健',
    category: '情報・実技',
    grades: [1, 2, 3],
    color: '#4f46e5', // indigo-600
    defaultTargetScore: 85,
    sampleTopics: ['現代の健康課題と生活習慣病予防', '精神の健康とストレスマネジメント', '交通安全と応急手当 (心肺蘇生法・AED)', '環境と健康・社会保障と保健制度'],
    defaultTextbook: '現代高等保健体育 教科書 保健編 p.10〜p.65',
    defaultWorkbook: '高校保健ノート・重要用語集'
  },
  {
    id: 'sub_home',
    name: '家庭 (家庭基礎・家庭総合)',
    shortName: '家庭',
    category: '情報・実技',
    grades: [1, 2, 3],
    color: '#ec4899', // pink-500
    defaultTargetScore: 85,
    sampleTopics: ['生涯の生活設計とライフステージ', '食生活の管理・栄養バランス・調理科学', '衣生活・住生活の計画と環境配慮', '消費生活と消費者トラブル防止'],
    defaultTextbook: '家庭基礎 教科書 第1編・第2編',
    defaultWorkbook: '家庭科基礎ワークシート集'
  },
  {
    id: 'sub_music',
    name: '音楽 (音楽Ⅰ・芸術)',
    shortName: '音楽',
    category: '情報・実技',
    grades: [1, 2, 3],
    color: '#f59e0b', // amber-500
    defaultTargetScore: 85,
    sampleTopics: ['楽典 (音程・音階・和音・拍子・調性)', '合唱・独唱の表現技法と発声法', '西洋音楽史 (バロック・古典派・ロマン派)', '世界の諸民族の音楽と日本の伝統音楽鑑賞'],
    defaultTextbook: '高校音楽Ⅰ 教科書 歌唱・鑑賞編',
    defaultWorkbook: '高校生の楽典ワーク / 鑑賞の手引き'
  }
];

// 学年別のおすすめ標準履修セット
export const GRADE_RECOMMENDED_SUBJECT_IDS: Record<number, string[]> = {
  1: [
    'sub_math_1a',
    'sub_eng_comm',
    'sub_eng_logic',
    'sub_jp_modern',
    'sub_jp_lang_culture',
    'sub_sci_chem',
    'sub_sci_bio',
    'sub_soc_hist',
    'sub_soc_geo',
    'sub_info',
    'sub_health',
    'sub_home'
  ],
  2: [
    'sub_math_2b',
    'sub_eng_comm',
    'sub_eng_logic',
    'sub_jp_modern',
    'sub_jp_classics',
    'sub_sci_phys',
    'sub_sci_chem',
    'sub_soc_public',
    'sub_soc_hist',
    'sub_health',
    'sub_info'
  ],
  3: [
    'sub_math_2b',
    'sub_math_3c',
    'sub_eng_comm',
    'sub_eng_logic',
    'sub_jp_modern',
    'sub_jp_classics',
    'sub_sci_phys',
    'sub_sci_chem',
    'sub_sci_bio',
    'sub_soc_hist',
    'sub_soc_geo',
    'sub_soc_public'
  ]
};

// 学年表示・ロール定義
export interface GradeLevelOption {
  gradeNumber: 1 | 2 | 3;
  label: string;
  subLabel: string;
  defaultRoleTitle: string;
  description: string;
}

export const HIGH_SCHOOL_GRADES: GradeLevelOption[] = [
  {
    gradeNumber: 1,
    label: '高校1年生',
    subLabel: '基礎固め・定期考査対策',
    defaultRoleTitle: '高校1年生 (文理共通・高校生活スタート)',
    description: '数ⅠA・現代の国語・言語文化・英コミュⅠ・論理表現Ⅰ・化学基礎・生物基礎・歴史総合・情報Ⅰ'
  },
  {
    gradeNumber: 2,
    label: '高校2年生',
    subLabel: '文理選択・実力養成期',
    defaultRoleTitle: '高校2年生 (Google Classroom連携・定期考査対策)',
    description: '数ⅡB・英コミュⅡ・論理表現Ⅱ・古典探究・物理/化学/生物・公共・歴史探究'
  },
  {
    gradeNumber: 3,
    label: '高校3年生',
    subLabel: '大学受験・共通テスト対策',
    defaultRoleTitle: '高校3年生 (大学受験・共通テスト・定期考査突破)',
    description: '数ⅢC/数ⅠAⅡB・古典探究・物理/化学/生物・英コミュⅢ・地歴探究・共通テスト総合'
  }
];
