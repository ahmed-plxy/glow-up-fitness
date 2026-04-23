export const FEATURE_ROOMS = [
  {
    id: 'nutrition-lab',
    title: 'معمل التغذية',
    description: 'بحث سريع، اقتراح وجبات، وتتبع عناصر الطعام من داخل واجهة واحدة.',
    icon: 'Soup',
    highlight: 'Food intelligence',
  },
  {
    id: 'workout-studio',
    title: 'استوديو التمرين',
    description: 'خطة تمرين أسبوعية، تقسيم عضلي، وتتبّع الالتزام.',
    icon: 'Dumbbell',
    highlight: 'Training hub',
  },
  {
    id: 'sleep-control',
    title: 'مركز النوم',
    description: 'منبه نوم، روتين تهدئة، وتقرير عن جودة الراحة.',
    icon: 'MoonStar',
    highlight: 'Recovery mode',
  },
  {
    id: 'water-tracker',
    title: 'متتبع الماء',
    description: 'أهداف الشرب، سجل يومي، وتذكير تلقائي.',
    icon: 'Droplets',
    highlight: 'Hydration',
  },
  {
    id: 'steps-tracker',
    title: 'متبع الخطوات',
    description: 'عداد بسيط، هدف يومي، وتقدّم على مدار الأسبوع.',
    icon: 'Footprints',
    highlight: 'Daily motion',
  },
  {
    id: 'insights-hub',
    title: 'لوحة التحليلات',
    description: 'رسوم بيانية للسعرات والوزن والماء والالتزام.',
    icon: 'BarChart3',
    highlight: 'Progress view',
  },
  {
    id: 'weekly-report',
    title: 'تقرير أسبوعي',
    description: 'ملخص جاهز يوضح الأداء والأيام النشطة والتغيّر.',
    icon: 'Sparkles',
    highlight: 'Weekly summary',
  },
  {
    id: 'community-board',
    title: 'لوحة التحديات',
    description: 'إنجازات، streak، وتحديات يومية صغيرة.',
    icon: 'Trophy',
    highlight: 'Challenge mode',
  },
]

export const WORKOUT_SPLITS = [
  {
    day: 'اليوم 1',
    title: 'Push',
    focus: 'صدر + كتف أمامي + ترايسبس',
    items: ['Bench Press 4x8', 'Incline DB Press 3x10', 'Shoulder Press 3x10', 'Lateral Raise 3x15', 'Rope Pushdown 3x12'],
  },
  {
    day: 'اليوم 2',
    title: 'Pull',
    focus: 'ظهر + بايسبس',
    items: ['Lat Pulldown 4x10', 'Barbell Row 4x8', 'Seated Cable Row 3x12', 'Face Pull 3x15', 'EZ Curl 3x12'],
  },
  {
    day: 'اليوم 3',
    title: 'Legs',
    focus: 'أرجل + كور',
    items: ['Squat 4x8', 'Romanian Deadlift 3x10', 'Leg Press 3x12', 'Walking Lunges 3x12', 'Plank 3x45s'],
  },
  {
    day: 'اليوم 4',
    title: 'Upper Pump',
    focus: 'ضخ دم خفيف + تقنية',
    items: ['Chest Fly 3x15', 'Cable Row 3x15', 'Rear Delt 3x15', 'Hammer Curl 3x12', 'Triceps Extension 3x12'],
  },
]

export const RECIPES_LIBRARY = [
  {
    id: 'power-bowl',
    title: 'Power Bowl',
    calories: 620,
    protein: 42,
    carbs: 58,
    fat: 21,
    steps: ['أرز بني', 'صدر دجاج', 'أفوكادو', 'خضار طازة', 'رشة زيت زيتون'],
  },
  {
    id: 'lean-breakfast',
    title: 'Lean Breakfast',
    calories: 410,
    protein: 33,
    carbs: 38,
    fat: 12,
    steps: ['شوفان', 'زبادي يوناني', 'موز', 'عسل', 'بذور الشيا'],
  },
  {
    id: 'post-workout',
    title: 'Post Workout Plate',
    calories: 540,
    protein: 45,
    carbs: 52,
    fat: 13,
    steps: ['بطاطا حلوة', 'تونة', 'سلطة', 'خبز قمح كامل', 'فاكهة'],
  },
  {
    id: 'night-recovery',
    title: 'Night Recovery',
    calories: 330,
    protein: 28,
    carbs: 24,
    fat: 11,
    steps: ['جبنة قريش', 'فراولة', 'جوز', 'قرفة', 'ماء قبل النوم'],
  },
]

export const RECOVERY_PROGRAMS = [
  { id: 'wind-down', title: 'روتين تهدئة', description: 'إطفاء الشاشة قبل النوم بـ 45 دقيقة، وتمارين تنفّس.', icon: 'MoonStar' },
  { id: 'hydration', title: 'تذكير الماء', description: 'اشرب كوبًا كل 60-90 دقيقة أثناء اليوم.', icon: 'Droplets' },
  { id: 'step-burst', title: 'دفعة خطوات', description: 'مشي 10 دقائق بعد كل وجبة كبيرة.', icon: 'Footprints' },
  { id: 'stretch', title: 'تمدد سريع', description: '3 دقائق تمدد للظهر والورك والكتف.', icon: 'Activity' },
]

export const CHALLENGES_LIBRARY = [
  { id: '7-day-streak', title: 'Streak 7 أيام', description: 'سجل أكلك أو ماءك كل يوم أسبوع كامل.', reward: 'شارة ذهبية', icon: 'ShieldCheck' },
  { id: 'water-master', title: 'ماستر الماء', description: 'اكمل هدف الماء اليومي 5 مرات في الأسبوع.', reward: 'قوة الالتزام', icon: 'Droplets' },
  { id: 'step-hero', title: 'بطل الخطوات', description: 'تجاوز 8k خطوة لمدة 4 أيام.', reward: 'نقاط نشاط', icon: 'Footprints' },
  { id: 'macro-control', title: 'تحكم الماكروز', description: 'ابق ضمن 10% من هدف السعرات 3 أيام.', reward: 'دقة غذائية', icon: 'Target' },
]

export const WEEKLY_SUMMARY_TEMPLATES = [
  'متوسط سعراتك هذا الأسبوع متزن ومقترب من الهدف.',
  'معدل الماء جيد، وتوجد فرصة لرفع الالتزام في المساء.',
  'الوزن يتحرك في اتجاه واضح مع السجل المنتظم.',
  'الخطوات اليومية تحتاج دفعة صغيرة في أيام العمل.',
]

export const SETTINGS_SHORTCUTS = [
  { id: 'profile', title: 'الملف الشخصي', description: 'الاسم، العمر، الوزن، الهدف، والوحدات.' },
  { id: 'goal', title: 'الهدف', description: 'زيادة وزن، خسارة وزن، تنشيف، أو ثبات.' },
  { id: 'password', title: 'تغيير الباسورد', description: 'تحديث كلمة السر المرتبطة بالحساب.' },
  { id: 'report', title: 'تقرير أسبوعي', description: 'ملخص الإنجاز والالتزام خلال آخر 7 أيام.' },
  { id: 'sleep', title: 'منظم النوم', description: 'نوم، استيقاظ، وتنبيهات مسائية.' },
  { id: 'steps', title: 'متبع الخطوات', description: 'هدف يومي ومؤشر تقدم واضح.' },
  { id: 'theme', title: 'المظهر', description: 'الوضع الليلي أو النهاري.' },
  { id: 'logout', title: 'تسجيل الخروج', description: 'إنهاء الجلسة الحالية بأمان.' },
]
