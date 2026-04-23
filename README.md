# Glow Up Fitness

واجهة React + Vite لمشروع Glow Up Fitness مع Supabase Auth.

## المطلوب قبل التشغيل
أنشئ ملف `.env` في الجذر وضع:

```bash
VITE_SUPABASE_URL=https://habbwezjkgfwxrpojalq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

> لا تستخدم service role key داخل الواجهة.

## تشغيل محلي
```bash
npm install
npm run dev
```

## البناء
```bash
npm run build
```

## إعداد Supabase
- فعّل Email provider
- فعّل Google provider
- أضف Redirect URLs الخاصة بالمشروع مثل:
  - `http://localhost:5173`
  - `https://glow-up-fitness.vercel.app`

## النشر على Vercel
- اربط الريبو بـ Vercel
- أضف متغيرات البيئة السابقة
- اعمل Redeploy بعد أي تعديل على الـ env
