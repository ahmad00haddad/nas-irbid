# تقرير تدقيق ناس إربد + خارطة طريق التنفيذ

## 1. ملخص تنفيذي

- **الحالة العامة:** الموقع مستقر وظيفياً، الرحلات الأساسية تعمل، لا توجد أخطاء منطقية حرجة، RLS نظيف (لا مشاكل في linter/security). يوجد عيوب متوسطة في UX/A11y/Perf و**عيب حرج واحد أمني تشغيلي** (لوحة الأدمن محمية على العميل فقط).
- **قرار الجاهزية للنشر:** **جاهز بشروط** — بعد إصلاح 3 عناصر حرجة (أدناه).
- **قرار الجاهزية للتحويل لتطبيق هاتف:** **قابل للتحويل مع إعادة هيكلة متوسطة** — الفصل بين المنطق والعرض ضعيف، طبقة بيانات مكشوفة من العميل مباشرة عبر supabase-js.

### أهم 5 مخاطر
1. لوحة الأدمن `/admin` تعتمد `useEffect` + client redirect فقط (SSR flash + مسار top-level بدون `_authenticated/`).
2. `site_settings` مقروء بالكامل من anon (تحذير سكانر أمني — يحوي بريد تواصل).
3. تخطي مستويات العناوين على `/episodes` و`/about` (SEO + a11y).
4. LCP بطيء (خطوط Amiri + IBM Plex Sans Arabic بأوزان متعددة + GIF كبير غير مضغوط في الهيرو).
5. غياب أي اختبارات / مراقبة أخطاء (Sentry-like) قبل الإطلاق.

---

## 2. النتائج مفصّلة حسب المحور

### 2.1 UX / UI (متوسط)
- **`index.tsx`:** GIF hero بارتفاع كبير + hero text منفصل → LCP يتأخر، رسالة القيمة تتشتت. حل: دمج البنّر النصي فوق الـGIF أو تصغيره لـ`h-24 md:h-32`.
- **`ask.tsx` L48:** حقل `custom_target` مذكور في الكود لكن لا يوجد `<input name="custom_target">` في النموذج → منطق ميت / مربك.
- **`ask.tsx` L140:** زر التقديم `disabled={!episodeId}` بدون رسالة توضح للمستخدم لماذا معطّل.
- **`episodes_.$slug.tsx` L103–111:** قسم "حلقات قد تعجبك" يظهر **فوق** الفيديو والقصة — يشتت رحلة المستخدم. حل: نقله بعد "القصة".
- **A11y:** أزرار icon-only في `Header` بحاجة `aria-label` (تحقق مطلوب). التباين بين `text-muted-foreground` وأنسجة `bg-card` مقبول لكن `text-muted-foreground/60` في placeholders دون AA.
- **Mobile touch targets:** أزرار داخل `ShareActions` بحجم مقبول لكن الأيقونات في الهيدر قد تكون < 44px.
- **Empty states:** موجودة في `episodes.tsx` ✓، ناقصة في `ask.tsx` عند 0 حلقات (رسالة موجودة لكن الفورم يبقى معطّلاً بدون توجيه).

### 2.2 بنية المعلومات والتدفقات (منخفض)
- الخريطة نظيفة: `/`, `/episodes`, `/episodes/$slug`, `/about`, `/ask`, `/suggest`, `/auth`, `/admin/*`.
- لا يوجد `breadcrumbs` في صفحة الحلقة (مقبول لعمق 2).
- **مسار الدعم:** `Home CTA → /about#support` — يعمل، لكن قسم الدعم داخل about لا يوجد له canonical/anchor موثّق.
- **Admin flow:** لا يوجد dashboard "recent activity" موحد بين الأقسام (اقتراحات/رسائل/أسئلة) — كل قسم مستقل.

### 2.3 الأداء / A11y / Responsive (متوسط-عالي)
- **خطوط:** تحميل عائلتَي Amiri + IBM Plex Sans Arabic بأوزان `300;400;500;600;700` من Google Fonts CDN → ~250KB إضافية على LCP. حل: تقليل الأوزان لـ`400;700` والاستفادة من `font-display: swap` (موجود ضمنياً).
- **GIF hero (`intro-logo.gif`):** GIFs ثقيلة وغير قابلة للضغط الحديث. حل: تحويل لـMP4/WebM أو صورة WebP ساكنة + `<link rel="preload">`.
- **صور YouTube thumbnails:** `hqdefault.jpg` بدون `width/height/loading="lazy"` على البطاقات → CLS محتمل.
- **`h-screen` vs `h-dvh`:** يتطلب تدقيق سريع في Header/Modal.
- **A11y:** تخطي heading levels على `/episodes` (`h1→h3`) و`/about` (`h2→h4`) — من finding SEO مؤكد.
- **`aria-live`:** رسائل toast مغطاة من sonner ✓.

### 2.4 المنطق الوظيفي والأخطاء (منخفض)
- **`ask.tsx` L48:** `target_character` fallback يعتمد `custom_target` غير موجود → دائماً `null` عند "بدون حلقة" (وهو غير ممكن أصلاً لأن `required`). كود ميت.
- **`episodes_.$slug.tsx` L69–81:** related-episodes query — منطق fallback مقبول لكن قد يحدث flash قصير حين يفشل الحي.
- **`admin.tsx` L29–31:** الاعتماد على `useEffect` للتوجيه = **SSR flash** + المستخدم يرى إطار اللوحة قبل الـredirect. الحل الصحيح: نقل المسارات تحت `src/routes/_authenticated/admin.*` واستخدام gate المُدار.
- **إدخال المستخدم:** لا يوجد Zod validation على النماذج (ask/suggest/contact) — الاعتماد على HTML5 required فقط. مقبول للمرحلة الحالية، لكن غير كافٍ لإنتاج طويل.
- **Duplicate submits:** `submitting` state يمنعها ✓.
- **Session refresh:** `AuthProvider` يستدعي fetchRoles عند كل تغيير — مقبول.

### 2.5 جاهزية النشر (متوسط)
- ✅ RLS مفعّل، linter نظيف، wrangler config صحيح، error handler في `src/server.ts` قوي.
- ✅ sitemap ديناميكي + robots + llms + JSON-LD موجودة.
- ⚠️ لا يوجد Sentry/error monitoring — أخطاء الإنتاج ستضيع.
- ⚠️ لا توجد اختبارات (وحدة/e2e).
- ⚠️ `site_settings` مكشوف كاملاً لـanon (تحذير scanner).
- ⚠️ لا يوجد rate limiting على submissions العامة (`ask`, `suggest`, `contact`) — عرضة للـspam.

### 2.6 القابلية للتحويل لتطبيق هاتف (متوسط)
- ❌ **Coupling عالي:** كل `.tsx` route يحوي queries + business logic + UI. لا توجد طبقة `services/` أو hooks معاد استخدامها.
- ❌ **Supabase client مستخدم مباشرة في المكونات** — لا يمكن استبداله بـREST/GraphQL بسهولة لتطبيق هاتف.
- ✅ **Design tokens:** موجودة في `styles.css` (gradient-gold, shadow-glow, gradient-warm) — قابلة للنقل.
- ✅ **shadcn/Radix primitives** — قابلة للترجمة لـReact Native مع إعادة بناء.
- ⚠️ لا يوجد offline caching (React Query موجود لكن بدون persister).

---

## 3. مصفوفة العيوب والأولوية

| # | المحور | المكان | الشدة | الحل |
|---|---|---|---|---|
| C1 | Production | `admin.tsx` L29 | حرج | نقل تحت `_authenticated/` |
| C2 | Security | `site_settings` policy | حرج | تقييد SELECT للأعمدة العامة عبر view |
| C3 | Logic | `ask.tsx` L48 | عالي | إزالة `custom_target` أو إضافة الحقل |
| H1 | Perf | خطوط + GIF hero | عالي | تقليل الأوزان، تحويل GIF→WebM |
| H2 | UX | ترتيب أقسام حلقة `$slug` | عالي | نقل "related" بعد "story" |
| H3 | SEO/A11y | heading levels | عالي | `h3→h2` في episodes، `h4→h3` في about |
| H4 | UX | GIF hero حجم index | عالي | تصغير أو دمج مع نص |
| M1 | Security | rate limiting submissions | متوسط | Turnstile/hCaptcha + throttle |
| M2 | Prod | error monitoring | متوسط | Sentry أو Cloudflare logs |
| M3 | A11y | aria-labels أيقونات Header | متوسط | مراجعة سريعة |
| M4 | UX | Zod validation على النماذج | متوسط | `@hookform/resolvers/zod` |
| M5 | Perf | صور بطاقات YouTube | متوسط | `width/height/loading="lazy"` |
| L1 | UX | dashboard admin موحّد | منخفض | صفحة overview بأحدث الأنشطة |
| L2 | Mobile | فصل services/ layer | منخفض | استخراج queries لـ`src/services/*.ts` |
| L3 | Perf | React Query persister | منخفض | `@tanstack/query-sync-storage-persister` |

---

## 4. خارطة الطريق المرحلية

### المرحلة 1 — Quick Wins (قبل الإطلاق، 1-3 أيام)
- [C1] نقل `admin.*.tsx` تحت `src/routes/_authenticated/admin.*.tsx` وحذف `useEffect` redirect.
- [C2] Migration: تقييد policy `site_settings` أو إنشاء view للأعمدة العامة (`hero_title`, `hero_subtitle`, `facebook_url`, `whatsapp_url`) فقط، ونقل `contact_email` لصلاحية authenticated.
- [C3] إزالة سطر `custom_target` من `ask.tsx` L48.
- [H2] إعادة ترتيب `episodes_.$slug.tsx`: story → video → related → question bank.
- [H3] تصحيح heading levels (`h2` في PublicEpisodeCard إن لزم، و`h3` في about).
- [H4] تصغير GIF hero (`h-24 md:h-32`) ودمج شارة "برنامج وثائقي" فوقه مباشرة.
- [M3] مراجعة أيقونات Header وإضافة `aria-label` للناقص.

### المرحلة 2 — تحسينات متوسطة (1-2 أسبوع)
- [H1] تحويل `intro-logo.gif` → WebM/MP4 + preload، وتقليل أوزان الخطوط.
- [M4] إضافة Zod + `react-hook-form` للنماذج الثلاثة العامة.
- [M1] حماية الـsubmissions العامة: Turnstile أو throttle على مستوى server function (نقل الـinserts من client لـcreateServerFn مع rate limit).
- [M2] ربط Cloudflare tail logs أو Sentry (edge-compatible) لالتقاط الأخطاء.
- [M5] `<img width height loading="lazy">` في `PublicEpisodeCard`.
- [L1] صفحة `/admin` overview موحّدة تعرض آخر 5 من كل نوع + إحصائيات أسبوعية.

### المرحلة 3 — تحضيرات هيكلية (بعد الإطلاق، قبل تطبيق الهاتف)
- [L2] إنشاء `src/services/` تحوي `episodes.ts`, `submissions.ts`, `settings.ts` — كل قراءات/كتابات supabase تمر منها.
- تحويل mutations العامة إلى `createServerFn` مع Zod validators (يمكّن rate limiting ويقلل سطح client).
- [L3] React Query persister للـoffline reads.
- بذور اختبارات smoke: Playwright لتغطية `/`, `/episodes`, `/episodes/$slug`, `/ask` submit.
- إعداد Google Search Console + Analytics.

### المرحلة 4 — استعداد تطبيق الهاتف
- توثيق design tokens في `tokens.json` لنقلها لـReact Native/Tamagui.
- استخراج business logic (formatters, share URLs, related-episodes strategy) لملفات pure TS تحت `src/lib/domain/`.
- إضافة REST/RPC endpoints عبر `createServerFn` بدل استدعاء supabase-js مباشرة من client — يجعل نفس الـAPI قابلاً للاستخدام من تطبيق native.

---

## 5. قرار الجاهزية النهائي

- **الويب:** جاهز للنشر بعد إنجاز C1+C2+C3+H3 (يوم عمل واحد تقريباً).
- **تطبيق الهاتف:** يتطلب المرحلة 3 قبل البدء بأي wrapper — التقدير: 2-3 أسابيع فصل طبقات قبل PWA/Native.

---

**ملاحظة:** هذا التقرير للاعتماد فقط. عند الضغط على "تنفيذ الخطة" سأبدأ بالمرحلة 1 (Quick Wins) — أخبرني إن كنت تريد ترتيباً مختلفاً أو التركيز على مرحلة بعينها.
