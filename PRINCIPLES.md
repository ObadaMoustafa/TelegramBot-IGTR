# مبادئ بناء Telegram Bots — حجر الأساس

مبادئ عملية مستخلصة من بناء بوت iGate-TR. قابلة للتطبيق على أي بوت تليجرام جديد.

---

## 1. مؤشر الكتابة قبل تعديل الرسالة (editWithTyping)

لما تعدّل رسالة، لا تعدّلها مباشرة. حط أولاً إيموشن ⌛️ لمدة 1200ms لإعطاء إحساس أن البوت "يكتب".

```js
async function editWithTyping(ctx, text, extra = {}) {
  await ctx.editMessageText('⌛️');
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return ctx.editMessageText(text, extra);
}
```

**متى تستخدمه:** في أي انتقال بين خطوات داخل نفس الـ flow (مش للانتقال لصفحات القائمة الرئيسية).

---

## 2. القائمة الرئيسية تختفي عند الاختيار (oneTime)

استخدم `.oneTime()` على الـ ReplyKeyboard عشان تتطوى تلقائياً لما العميل يضغط عليها، وتظهر من جديد بس لما تعمل `showMainMenu` صريحاً.

```js
Markup.keyboard([...]).resize().oneTime()
```

---

## 3. الانتقال لصفحات القائمة الرئيسية = رسالة جديدة دايماً

لو ضغط على زرار ينتمي لصفحة رئيسية (تحميل، تجربة، باقات، تواصل) من داخل flow تاني — **لا تعدل الرسالة الحالية، ابعت رسالة جديدة**.

```js
// ✅ صح
bot.action('goto_download', (ctx) => {
  ctx.answerCbQuery();
  return ctx.replyWithMarkdown(t('download.message', lang), keyboard);
});

// ❌ غلط
bot.action('goto_download', (ctx) => {
  return editWithTyping(ctx, t('download.message', lang), keyboard);
});
```

**السبب:** يحافظ على تاريخ المحادثة منطقياً، والمستخدم يحس إنه انتقل لصفحة جديدة فعلاً.

---

## 4. رسائل الانتقال من صورة لنص (Photo → Text)

مش ممكن تعمل `editMessageText` على رسالة صورة. الحل:

1. الـ step اللي فيه صورة: احذف الرسالة الحالية + ابعت رسالة صورة جديدة.
2. الـ step اللي بعده: احذف الصورة + ابعت رسالة نصية جديدة.
3. بعد كدة الـ steps الباقية تعدل في مكانها عادي.

```js
// step فيه صورة
async function showStep1(ctx, lang) {
  await ctx.deleteMessage().catch(() => {});
  return ctx.replyWithPhoto(FILE_ID, { caption: '...', ...keyboard });
}

// step بعد الصورة
bot.action('step2', async (ctx) => {
  ctx.answerCbQuery();
  await ctx.deleteMessage().catch(() => {}); // يمسح الصورة
  return ctx.replyWithMarkdown('...', keyboard); // نص جديد
});
```

**تفصيلة مهمة:** أي action ممكن يُستدعى من رسالة صورة (زي زرار رجوع يوصل للصورة) لازم يستخدم `deleteMessage + reply` مش `editWithTyping` — حتى لو مش هو اللي بعت الصورة في الأصل.

---

## 5. الصور: استخدم file_id مش رفع الملف

ارفع الصورة مرة واحدة واحفظ الـ `file_id` — هو موجود على سيرفرات تليجرام وأسرع بكتير من رفع الملف في كل مرة.

**الخطوات:**

1. فعّل `DEV_MODE` وفي `handlers/maintenance.js` أضف command:

```js
bot.command('getfileid', (ctx) => {
  const photo = ctx.message?.reply_to_message?.photo;
  if (!photo) return ctx.reply('ابعت الصورة الأول، ثم اعمل reply عليها بـ /getfileid');
  const fileId = photo[photo.length - 1].file_id;
  ctx.reply(`\`${fileId}\``, { parse_mode: 'Markdown' });
});
```

2. ابعت الصورة في الشات، ثم اعمل **reply** عليها بـ `/getfileid` → البوت يردّ بالـ `file_id`.
3. احفظه في `config.js`.
4. وقفّل `DEV_MODE` لما تخلص.

> ⚠️ **مهم:** الـ `file_id` مربوط بالبوت اللي جبته منه ومش قابل للنقل. لو عملت بوت جديد لازم تعيد الخطوات من الأول عشان تجيب `file_id` جديد.

---

## 6. زرار نسخ الكود بضغطة واحدة (copy_text)

تليجرام بيدعم زرار ينسخ نص للـ clipboard مباشرة. Telegraf مالوش helper لده لحد الآن، بتكتبه كـ raw object:

```js
{ text: `📋 ${code} — اضغط للنسخ`, copy_text: { text: code } }
```

---

## 7. Markdown Escaping للبيانات الخارجية

أي نص جاي من المستخدم (اسم، يوزرنيم، رسالة) قد يحتوي على `_` أو `*` أو غيرها، ودي بتكسر الـ Markdown بالكامل وبتخلي الـ sendMessage يفشل بصمت.

```js
function escapeMd(text) {
  return String(text).replace(/[_*`[]/g, '\\$&');
}
```

طبّقها على: الاسم، الـ username، وأي input من المستخدم قبل ما تحطه في رسالة Markdown.

---

## 8. إشعارات المديرين بالـ Numeric ID

البوت مش قادر يبعت رسالة لحد بالـ @username إلا لو بدأ الشخص ده محادثة معه أولاً، وفي حالات البوت بيرفض كمان. استخدم الـ numeric ID دايماً.

```js
// managers.js
require('dotenv').config();
module.exports = (process.env.MANAGER_IDS || '')
  .split(',')
  .map((id) => parseInt(id.trim(), 10))
  .filter((id) => !isNaN(id));
```

```
# .env
MANAGER_IDS=123456789,987654321
```

**عشان تجيب الـ ID:** أضف `/myid` command مؤقت.

---

## 9. Clickable User Link للمديرين

بدل ما تكتب اسم العميل كنص عادي، استخدم link يفتح محادثة معه مباشرة — بيشتغل حتى لو العميل ماعندوش @username.

```js
const clientLink = `[${escapeMd(name)}](tg://user?id=${from.id})`;
```

---

## 10. إرسال لأكثر من مدير بـ Promise.allSettled

استخدم `allSettled` مش `all` — عشان لو مدير واحد فشل معاه الإرسال، باقي المديرين يوصلهم الإشعار.

```js
const results = await Promise.allSettled(
  managers.map((id) => bot.telegram.sendMessage(id, message, { parse_mode: 'Markdown' }))
);
const sent = results.some((r) => r.status === 'fulfilled');
```

---

## 11. Multi-Step Flow بـ Middleware

لأي flow فيه أكتر من خطوة وبيستنى input نصي من المستخدم، استخدم middleware + state machine.

```js
// bot.js
const userState = new Map();
function getUserState(userId) { return userState.get(userId) || null; }
function setUserState(userId, state) { userState.set(userId, state); }
function clearUserState(userId) { userState.delete(userId); }
```

**مهم:** سجّل الـ middleware قبل كل الـ handlers في `index.js`.

```js
bot.use(contactMiddleware); // أول حاجة
registerStart(bot);
// ...
```

---

## 12. زرار إلغاء في كل multi-step flow

في أي flow من أكتر من خطوة، حط زرار إلغاء في كل خطوة يمسح الـ state ويرجع للمستخدم رسالة تأكيد.

```js
bot.action('flow_cancel', (ctx) => {
  const lang = getLang(ctx.from.id) || 'ar';
  ctx.answerCbQuery();
  clearUserState(ctx.from.id);
  return editWithTyping(ctx, t('flow.cancelled', lang), {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[mainMenuBtn(lang)]]),
  });
});
```

---

## 13. Fallback للكلام الخارج عن نطاق البوت

آخر handler في `index.js` يصطاد أي نص ما اتطابقش مع أي handler — يوضّح للمستخدم أنه بوت ويعطيه خيارين.

```js
bot.on('text', (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
  const lang = getLang(ctx.from?.id) || 'ar';
  return ctx.replyWithMarkdown(
    t('fallback.message', lang),
    Markup.inlineKeyboard([
      [Markup.button.callback(t('main_menu.contact', lang), 'contact_start')],
      [Markup.button.callback(t('back.main_menu', lang), 'goto_main_menu')],
    ])
  );
});
```

**مهم:** يتسجل في آخر حاجة بعد كل الـ handlers، ولو عندك contact middleware هو اللي بيمنع تشغيله لما المستخدم يكون في flow.

---

## 14. i18n — النصوص في ملفات منفصلة

الكود يستخدم keys بس، النصوص في `locales/ar.json` و `locales/en.json`.

```js
// ✅ صح
ctx.replyWithMarkdown(t('download.message', lang));

// ❌ غلط
ctx.replyWithMarkdown('📲 قم بتحميل البرنامج...');
```

**الفايدة:** تعديل أي نص أو ترجمة = تعديل في ملف JSON بس، الكود ما يتغيرش.

---

## 15. زرار الرجوع للقائمة الرئيسية — helper ثابت

```js
function mainMenuBtn(lang) {
  return Markup.button.callback(t('back.main_menu', lang), 'goto_main_menu');
}
```

حطّه في `utils.js` واستخدمه في كل مكان بدل ما تكرر الكود.

---

## 16. Global Error Handling — منع تعطل البوت

`answerCbQuery()` بترمي error لو الـ query انتهت صلاحيتها (مثلاً بعد ريستارت البوت). من غير معالجة البوت بيوقف. الحل: مستويين من الحماية:

```js
// يمسك errors من داخل الـ Telegraf handlers
bot.catch((err) => {
  console.error('Bot error:', err.message);
});

// يمسك أي unhandled promise rejection في أي مكان
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});
```

ضيفهم قبل `bot.launch()` مباشرة في `index.js`.

---

## 17. Maintenance Mode — فصل أدوات التطوير

أي حاجة مخصصة للتطوير بس (جلب file_id، معرفة الـ ID، إلخ) تتحط في ملف منفصل `handlers/maintenance.js` ويتحكم فيها بـ `DEV_MODE` في `.env`.

```js
// index.js
if (process.env.DEV_MODE === 'true') {
  registerMaintenance(bot);
  console.log('⚙️  DEV_MODE is ON');
}
```

```ini
# .env — شغّل وقت التطوير، وقفّل في Production
DEV_MODE=true
```

**الفايدة:** المستخدمين العاديين ميشوفوش أوامر التطوير، وما تنساش تفعّلهم لما تحتاجهم.
