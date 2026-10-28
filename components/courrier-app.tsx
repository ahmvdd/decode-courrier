"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { languages, localeByLanguage, type Analysis, type Language } from "@/lib/types";

const languageLabels: Record<Language, string> = {
  "français simple": "Français simple", anglais: "English", arabe: "العربية", espagnol: "Español",
  portugais: "Português", chinois: "中文", turc: "Türkçe", russe: "Русский",
};

const homeCopy: Record<Language, { title: string; subtitle: string; example: string; next: string }> = {
  "français simple": { title: "Ton courrier, expliqué simplement.", subtitle: "Ce qu'il dit, ce que tu dois faire, et avant quand. À lire ou à écouter, dans ta langue.", example: "Essayer avec un exemple", next: "Et maintenant ?" },
  anglais: { title: "Your letter, explained simply.", subtitle: "What it says, what to do, and by when. Read or listen in your language.", example: "Try an example", next: "What next?" },
  arabe: { title: "رسالتك، بشرح بسيط.", subtitle: "ماذا تقول، وما الذي عليك فعله، ومتى. اقرأ أو استمع بلغتك.", example: "جرّب مثالاً", next: "ماذا بعد؟" },
  espagnol: { title: "Tu carta, explicada fácilmente.", subtitle: "Qué dice, qué tienes que hacer y para cuándo. Léela o escúchala en tu idioma.", example: "Probar con un ejemplo", next: "¿Y ahora qué?" },
  portugais: { title: "A tua carta, explicada de forma simples.", subtitle: "O que diz, o que tens de fazer e até quando. Lê ou ouve na tua língua.", example: "Experimentar um exemplo", next: "E agora?" },
  chinois: { title: "简单读懂你的信件。", subtitle: "了解信件内容、要做什么以及截止时间。用你的语言阅读或收听。", example: "试试示例", next: "接下来怎么办？" },
  turc: { title: "Mektubun kolayca açıklansın.", subtitle: "Ne yazıyor, ne yapmalısın ve ne zamana kadar? Kendi dilinde oku veya dinle.", example: "Bir örnek dene", next: "Şimdi ne yapmalı?" },
  russe: { title: "Письмо простыми словами.", subtitle: "Что в нём сказано, что нужно сделать и к какому сроку. Читай или слушай на своём языке.", example: "Попробовать на примере", next: "Что дальше?" },
};

const exampleLetter = `Trésor public – Service des impôts (exemple fictif)\nAvis de relance\nMontant restant à payer : 706,00 €\nMerci de payer avant le 10 novembre 2026. Si vous avez déjà payé, ignorez cet avis. Si vous avez des difficultés, vous pouvez demander un délai de paiement au service des impôts.`;

function removeDeadlineFromAction(value: string) {
  const date = String.raw`(?:\d{1,2}(?:er)?\s+\p{L}+\s+\d{4}|\p{L}+\s+\d{1,2},?\s+\d{4}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4})`;
  return value
    .replace(new RegExp(String.raw`\s*(?:avant(?:\s+le)?|d'ici(?:\s+au)?|au plus tard le|before|by|no later than|hasta|antes del?|до)\s+${date}[,.]?`, "giu"), "")
    .replace(/\s+([,.!?;:])/g, "$1").replace(/[,.!?;:\s]+$/, "").trim();
}

const accessibilityUi: Record<Language, { increase: string; decrease: string; contrast: string; controls: string; todo: string; resultReady: string; primaryAction: string }> = {
  "français simple": { increase: "A+", decrease: "A−", contrast: "Contraste élevé", controls: "Réglages d’accessibilité", todo: "À FAIRE", resultReady: "Résultat prêt. Consulte la première action et sa date limite." , primaryAction: "Action principale" },
  anglais: { increase: "A+", decrease: "A−", contrast: "High contrast", controls: "Accessibility settings", todo: "TO DO", resultReady: "Result ready. See the main action and its deadline first.", primaryAction: "Main action" },
  arabe: { increase: "A+", decrease: "A−", contrast: "تباين عالٍ", controls: "إعدادات تسهيل الاستخدام", todo: "ما يجب فعله", resultReady: "النتيجة جاهزة. ابدأ بالإجراء الرئيسي وموعده النهائي.", primaryAction: "الإجراء الرئيسي" },
  espagnol: { increase: "A+", decrease: "A−", contrast: "Alto contraste", controls: "Ajustes de accesibilidad", todo: "POR HACER", resultReady: "Resultado listo. Consulta primero la acción principal y su fecha límite.", primaryAction: "Acción principal" },
  portugais: { increase: "A+", decrease: "A−", contrast: "Alto contraste", controls: "Definições de acessibilidade", todo: "A FAZER", resultReady: "Resultado pronto. Consulta primeiro a ação principal e o prazo.", primaryAction: "Ação principal" },
  chinois: { increase: "A+", decrease: "A−", contrast: "高对比度", controls: "无障碍设置", todo: "待办事项", resultReady: "结果已准备好。请先查看主要事项和截止日期。", primaryAction: "主要事项" },
  turc: { increase: "A+", decrease: "A−", contrast: "Yüksek kontrast", controls: "Erişilebilirlik ayarları", todo: "YAPILACAK", resultReady: "Sonuç hazır. Önce ana işlemi ve son tarihi incele.", primaryAction: "Ana işlem" },
  russe: { increase: "A+", decrease: "A−", contrast: "Высокая контрастность", controls: "Настройки доступности", todo: "ЧТО СДЕЛАТЬ", resultReady: "Результат готов. Сначала проверь главное действие и срок.", primaryAction: "Главное действие" },
};

const shareUi: Record<Language, { button: string; title: string; from: string; says: string; action: string; deadline: string; amount: string; copy: string; copied: string }> = {
  "français simple": { button: "Envoyer à un proche", title: "Résumé de mon courrier", from: "Expéditeur", says: "Le courrier dit", action: "À faire", deadline: "Date limite", amount: "Montant", copy: "Copier", copied: "Message copié." },
  anglais: { button: "Send to someone I trust", title: "My letter summary", from: "Sender", says: "The letter says", action: "To do", deadline: "Deadline", amount: "Amount", copy: "Copy", copied: "Message copied." },
  arabe: { button: "أرسل إلى شخص مقرّب", title: "ملخص رسالتي", from: "الجهة المرسلة", says: "ماذا تقول الرسالة", action: "ما يجب فعله", deadline: "الموعد النهائي", amount: "المبلغ", copy: "نسخ", copied: "تم نسخ الرسالة." },
  espagnol: { button: "Enviar a alguien de confianza", title: "Resumen de mi carta", from: "Remitente", says: "La carta dice", action: "Qué hacer", deadline: "Fecha límite", amount: "Importe", copy: "Copiar", copied: "Mensaje copiado." },
  portugais: { button: "Enviar a alguém de confiança", title: "Resumo da minha carta", from: "Remetente", says: "A carta diz", action: "O que fazer", deadline: "Prazo", amount: "Montante", copy: "Copiar", copied: "Mensagem copiada." },
  chinois: { button: "发送给信任的人", title: "我的信件摘要", from: "发件方", says: "信件内容", action: "待办事项", deadline: "截止日期", amount: "金额", copy: "复制", copied: "消息已复制。" },
  turc: { button: "Yakınıma gönder", title: "Mektubumun özeti", from: "Gönderen", says: "Mektupta yazan", action: "Yapılacak", deadline: "Son tarih", amount: "Tutar", copy: "Kopyala", copied: "Mesaj kopyalandı." },
  russe: { button: "Отправить близкому", title: "Кратко о письме", from: "Отправитель", says: "В письме говорится", action: "Что сделать", deadline: "Срок", amount: "Сумма", copy: "Скопировать", copied: "Сообщение скопировано." },
};

function removePersonalDetails(value: string) {
  return value
    .replace(/\b(?:M(?:me|lle|\.)?|Monsieur|Madame)\s+[\p{Lu}][\p{L}'’-]+(?:\s+[\p{Lu}][\p{L}'’-]+){0,2}/gu, "une personne")
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, "")
    .replace(/\b(?:\+?\d[ .()-]*){8,}\b/g, "")
    .replace(/\b\d{1,5}\s+(?:bis\s+|ter\s+)?(?:rue|avenue|av\.?|boulevard|bd\.?|impasse|allée|chemin|place|route)\b[^,.;\n]*/gi, "une adresse personnelle")
    .replace(/\b\d{5}\s+[\p{L}'’-]+(?:[ -][\p{L}'’-]+){0,3}\b/gu, "")
    .replace(/\s+/g, " ").trim();
}

function firstTwoSentences(value: string) {
  return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.slice(0, 2).join(" ").trim() || value.trim();
}

const ui: Record<Language, Record<string, string>> = {
  "français simple": {
    tagline: "Les démarches, dans ta langue", title: "Comprends ton courrier dans ta langue. Réponds en français parfait.", intro: "Prends une photo nette de ton courrier officiel, ou colle son texte ici.",
    language: "Langue de l’explication", photo: "📷  Prendre en photo mon courrier", reading: "Lecture du courrier…", or: "ou colle le texte", text: "Texte du courrier", placeholder: "Copie et colle le texte ici…", analyze: "Comprendre ce courrier", analyzing: "Analyse en cours…", privacy: "Ta photo est envoyée pour analyse puis n’est pas stockée sur notre serveur.", caution: "Une explication automatique peut se tromper. Vérifie les dates et les démarches auprès de l’organisme si tu as un doute.",
    another: "← Analyser un autre courrier", from: "Courrier de", deadline: "Date limite", estimated: "≈ estimation", summary: "En résumé", listen: "Écouter", preparingAudio: "Préparation de l’audio…", actions: "Tes options et les conséquences", noActions: "Aucune option précise n’est indiquée dans ce courrier.", documents: "Documents à préparer", answer: "Ta réponse en français", copy: "Copier la réponse", copied: "Réponse copiée.", translation: "Voir la traduction pour comprendre", glossary: "Les mots à connaître", reminder: "Ajouter un rappel", reminderDetails: "Rappel trois jours avant la date limite.", notice: "Cette explication est automatique. En cas de doute, contacte l’organisme indiqué sur le courrier.", noResult: "Aucun résultat à afficher", start: "Commence par ajouter un courrier à expliquer.", back: "Retour à l’accueil", footer: "Un outil d’aide à la compréhension. Il ne remplace pas les conseils d’un professionnel.",
    urgencyLow: "À ton rythme", urgencyMedium: "À traiter bientôt", urgencyHigh: "À traiter rapidement", copyError: "La copie automatique n’a pas fonctionné. Sélectionne le texte pour le copier.", apiError: "Une erreur est survenue. Réessaie.", audioError: "La lecture audio a échoué.",
  },
  anglais: {
    tagline: "Your paperwork, in your language", title: "Understand your letter in your language. Reply in perfect French.", intro: "Take a clear photo of your official letter, or paste its text here.", language: "Explanation language", photo: "📷  Take a photo of my letter", reading: "Reading the letter…", or: "or paste the text", text: "Letter text", placeholder: "Copy and paste the text here…", analyze: "Understand this letter", analyzing: "Analyzing…", privacy: "Your photo is sent for analysis and is not stored on our server.", caution: "Automatic explanations can be wrong. Check dates and steps with the organization if you are unsure.", another: "← Analyze another letter", from: "Letter from", deadline: "Deadline", estimated: "≈ estimate", summary: "In brief", listen: "Listen", preparingAudio: "Preparing audio…", actions: "Your options and their consequences", noActions: "This letter does not state any specific options.", documents: "Documents to prepare", answer: "Your reply in French", copy: "Copy reply", copied: "Reply copied.", translation: "Show translation to understand", glossary: "Words to know", reminder: "Add a reminder", reminderDetails: "Reminder three days before the deadline.", notice: "This is an automatic explanation. If unsure, contact the organization named in the letter.", noResult: "No result to show", start: "Start by adding a letter to explain.", back: "Back to home", footer: "A tool to help you understand. It does not replace professional advice.", urgencyLow: "No rush", urgencyMedium: "Deal with this soon", urgencyHigh: "Deal with this quickly", copyError: "Automatic copying did not work. Select the text to copy it.", apiError: "Something went wrong. Please try again.", audioError: "Audio playback failed.",
  },
  arabe: {
    tagline: "افهم الإجراءات بلغتك", title: "افهم رسالتك بلغتك. وأجب بفرنسية سليمة.", intro: "التقط صورة واضحة للرسالة الرسمية أو ألصق نصها هنا.", language: "لغة الشرح", photo: "📷  صوّر رسالتي", reading: "جارٍ قراءة الرسالة…", or: "أو ألصق النص", text: "نص الرسالة", placeholder: "انسخ النص وألصقه هنا…", analyze: "افهم هذه الرسالة", analyzing: "جارٍ التحليل…", privacy: "تُرسل الصورة للتحليل ولا تُحفظ على خادمنا.", caution: "قد يخطئ الشرح الآلي. تحقّق من المواعيد والخطوات لدى الجهة المعنية عند الشك.", another: "← حلّل رسالة أخرى", from: "الجهة المرسلة", deadline: "الموعد النهائي", estimated: "≈ تقدير", summary: "الخلاصة", listen: "استمع", preparingAudio: "جارٍ إعداد الصوت…", actions: "الخيارات والعواقب", noActions: "لا تعرض هذه الرسالة خيارات محددة.", documents: "الوثائق المطلوبة", answer: "ردّك باللغة الفرنسية", copy: "انسخ الرد", copied: "تم نسخ الرد.", translation: "اعرض الترجمة للفهم", glossary: "كلمات مهمة", reminder: "أضف تذكيراً", reminderDetails: "تذكير قبل الموعد بثلاثة أيام.", notice: "هذا شرح آلي. عند الشك، تواصل مع الجهة المذكورة في الرسالة.", noResult: "لا توجد نتيجة للعرض", start: "أضف رسالة لشرحها.", back: "العودة إلى الصفحة الرئيسية", footer: "أداة للمساعدة على الفهم، ولا تغني عن نصيحة المختص.", urgencyLow: "يمكنك أخذ وقتك", urgencyMedium: "تابع الأمر قريباً", urgencyHigh: "تابع الأمر بسرعة", copyError: "تعذّر النسخ تلقائياً. حدّد النص لنسخه.", apiError: "حدث خطأ. حاول مرة أخرى.", audioError: "تعذّر تشغيل الصوت.",
  },
  espagnol: {
    tagline: "Tus trámites, en tu idioma", title: "Entiende tu carta en tu idioma. Responde en francés perfecto.", intro: "Haz una foto nítida de tu carta oficial o pega aquí el texto.", language: "Idioma de la explicación", photo: "📷  Hacer una foto de mi carta", reading: "Leyendo la carta…", or: "o pega el texto", text: "Texto de la carta", placeholder: "Copia y pega el texto aquí…", analyze: "Entender esta carta", analyzing: "Analizando…", privacy: "La foto se envía para analizarla y no se guarda en nuestro servidor.", caution: "La explicación automática puede equivocarse. Si tienes dudas, confirma las fechas y los pasos con el organismo.", another: "← Analizar otra carta", from: "Carta de", deadline: "Fecha límite", estimated: "≈ estimación", summary: "En resumen", listen: "Escuchar", preparingAudio: "Preparando audio…", actions: "Opciones y consecuencias", noActions: "La carta no indica opciones concretas.", documents: "Documentos que preparar", answer: "Tu respuesta en francés", copy: "Copiar respuesta", copied: "Respuesta copiada.", translation: "Ver la traducción para entenderla", glossary: "Palabras importantes", reminder: "Añadir un recordatorio", reminderDetails: "Aviso tres días antes de la fecha límite.", notice: "Esta explicación es automática. Si tienes dudas, contacta con el organismo indicado en la carta.", noResult: "No hay ningún resultado", start: "Añade una carta para explicarla.", back: "Volver al inicio", footer: "Una herramienta para ayudarte a entender. No sustituye el asesoramiento profesional.", urgencyLow: "Sin prisa", urgencyMedium: "Conviene hacerlo pronto", urgencyHigh: "Hazlo cuanto antes", copyError: "No se pudo copiar automáticamente. Selecciona el texto para copiarlo.", apiError: "Ha ocurrido un error. Inténtalo de nuevo.", audioError: "No se pudo reproducir el audio.",
  },
  portugais: {
    tagline: "Os teus documentos, na tua língua", title: "Entende a tua carta na tua língua. Responde em francês perfeito.", intro: "Tira uma fotografia nítida da carta oficial ou cola o texto aqui.", language: "Língua da explicação", photo: "📷  Fotografar a minha carta", reading: "A ler a carta…", or: "ou cola o texto", text: "Texto da carta", placeholder: "Copia e cola o texto aqui…", analyze: "Compreender esta carta", analyzing: "A analisar…", privacy: "A fotografia é enviada para análise e não fica guardada no nosso servidor.", caution: "A explicação automática pode conter erros. Confirma as datas e os passos junto da entidade se tiveres dúvidas.", another: "← Analisar outra carta", from: "Carta de", deadline: "Prazo", estimated: "≈ estimativa", summary: "Em resumo", listen: "Ouvir", preparingAudio: "A preparar o áudio…", actions: "Opções e consequências", noActions: "A carta não indica opções específicas.", documents: "Documentos a preparar", answer: "A tua resposta em francês", copy: "Copiar resposta", copied: "Resposta copiada.", translation: "Ver tradução para compreender", glossary: "Palavras importantes", reminder: "Adicionar lembrete", reminderDetails: "Lembrete três dias antes do prazo.", notice: "Esta explicação é automática. Em caso de dúvida, contacta a entidade indicada na carta.", noResult: "Não há resultados para mostrar", start: "Adiciona uma carta para a explicar.", back: "Voltar ao início", footer: "Uma ferramenta para ajudar a compreender. Não substitui aconselhamento profissional.", urgencyLow: "Sem pressa", urgencyMedium: "Trata disto em breve", urgencyHigh: "Trata disto rapidamente", copyError: "Não foi possível copiar automaticamente. Seleciona o texto para o copiar.", apiError: "Ocorreu um erro. Tenta novamente.", audioError: "A leitura do áudio falhou.",
  },
  chinois: {
    tagline: "用你的语言理解行政信件", title: "用你的语言读懂信件，用流利的法语回复。", intro: "拍摄清晰的官方信件照片，或在此粘贴信件文字。", language: "说明语言", photo: "📷  拍摄我的信件", reading: "正在读取信件…", or: "或粘贴文字", text: "信件内容", placeholder: "在此复制并粘贴文字…", analyze: "理解这封信", analyzing: "正在分析…", privacy: "照片仅用于分析，不会保存在我们的服务器上。", caution: "自动说明可能有误。如有疑问，请向相关机构核实日期和办理步骤。", another: "← 分析另一封信", from: "发件机构", deadline: "截止日期", estimated: "≈ 估算", summary: "摘要", listen: "收听", preparingAudio: "正在准备音频…", actions: "可选方案及其后果", noActions: "信中没有说明具体选项。", documents: "需要准备的文件", answer: "你的法语回复", copy: "复制回复", copied: "已复制回复。", translation: "展开译文以便理解", glossary: "重要词汇", reminder: "添加提醒", reminderDetails: "截止日期前三天提醒。", notice: "这是自动生成的说明。如有疑问，请联系信中所列机构。", noResult: "没有可显示的结果", start: "先添加一封需要解释的信。", back: "返回首页", footer: "帮助理解信件的工具，不能代替专业建议。", urgencyLow: "可以从容处理", urgencyMedium: "请尽快处理", urgencyHigh: "请尽快办理", copyError: "自动复制失败。请选中文字后复制。", apiError: "发生错误，请重试。", audioError: "音频播放失败。",
  },
  turc: {
    tagline: "Resmî işlemler, kendi dilinde", title: "Mektubunu kendi dilinde anla. Kusursuz Fransızca cevap ver.", intro: "Resmî mektubunun net bir fotoğrafını çek veya metni buraya yapıştır.", language: "Açıklama dili", photo: "📷  Mektubumun fotoğrafını çek", reading: "Mektup okunuyor…", or: "veya metni yapıştır", text: "Mektup metni", placeholder: "Metni buraya kopyalayıp yapıştır…", analyze: "Bu mektubu anla", analyzing: "İnceleniyor…", privacy: "Fotoğraf analiz için gönderilir ve sunucumuzda saklanmaz.", caution: "Otomatik açıklama hatalı olabilir. Emin değilsen tarihleri ve işlemleri kurumla doğrula.", another: "← Başka bir mektubu incele", from: "Gönderen", deadline: "Son tarih", estimated: "≈ tahmin", summary: "Özet", listen: "Dinle", preparingAudio: "Ses hazırlanıyor…", actions: "Seçeneklerin ve sonuçları", noActions: "Mektupta belirli bir seçenek belirtilmiyor.", documents: "Hazırlanacak belgeler", answer: "Fransızca cevabın", copy: "Cevabı kopyala", copied: "Cevap kopyalandı.", translation: "Anlamak için çeviriyi göster", glossary: "Bilmen gereken kelimeler", reminder: "Hatırlatıcı ekle", reminderDetails: "Son tarihten üç gün önce hatırlat.", notice: "Bu otomatik bir açıklamadır. Emin değilsen mektuptaki kurumla iletişime geç.", noResult: "Gösterilecek sonuç yok", start: "Açıklamak için bir mektup ekle.", back: "Ana sayfaya dön", footer: "Anlamana yardımcı olur; profesyonel danışmanlığın yerini tutmaz.", urgencyLow: "Acele yok", urgencyMedium: "Yakında ilgilen", urgencyHigh: "Hızlıca ilgilen", copyError: "Otomatik kopyalama başarısız. Kopyalamak için metni seç.", apiError: "Bir hata oluştu. Tekrar dene.", audioError: "Ses oynatılamadı.",
  },
  russe: {
    tagline: "Документы и дела на твоём языке", title: "Пойми письмо на своём языке. Ответь на безупречном французском.", intro: "Сфотографируй официальное письмо или вставь его текст сюда.", language: "Язык объяснения", photo: "📷  Сфотографировать письмо", reading: "Читаем письмо…", or: "или вставь текст", text: "Текст письма", placeholder: "Скопируй и вставь текст сюда…", analyze: "Понять это письмо", analyzing: "Анализируем…", privacy: "Фото отправляется на анализ и не сохраняется на нашем сервере.", caution: "Автоматическое объяснение может быть неточным. Если сомневаешься, уточни даты и порядок действий в учреждении.", another: "← Разобрать другое письмо", from: "Отправитель", deadline: "Крайний срок", estimated: "≈ оценка", summary: "Кратко", listen: "Слушать", preparingAudio: "Готовим аудио…", actions: "Варианты действий и последствия", noActions: "В письме не указаны конкретные варианты.", documents: "Документы для подготовки", answer: "Твой ответ на французском", copy: "Скопировать ответ", copied: "Ответ скопирован.", translation: "Показать перевод для понимания", glossary: "Важные слова", reminder: "Добавить напоминание", reminderDetails: "Напоминание за три дня до срока.", notice: "Это автоматическое объяснение. Если сомневаешься, свяжись с учреждением из письма.", noResult: "Нет результата для показа", start: "Добавь письмо, которое нужно объяснить.", back: "На главную", footer: "Помогает понять письмо, но не заменяет консультацию специалиста.", urgencyLow: "Можно не спешить", urgencyMedium: "Займись этим скоро", urgencyHigh: "Нужно действовать быстро", copyError: "Не удалось скопировать автоматически. Выдели текст и скопируй его.", apiError: "Произошла ошибка. Попробуй ещё раз.", audioError: "Не удалось воспроизвести аудио.",
  },
};

function dateInLongLocale(value: string, language: Language) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(localeByLanguage[language], { dateStyle: "long", timeZone: "UTC" }).format(date);
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function utcDay(value: string) { return value.replaceAll("-", ""); }

const reviewUi: Record<Language, { title: string; instruction: string; clear: string; another: string; consent: string; analyze: string; busy: string; textConsent: string; error: string }> = {
  "français simple": { title: "Vérifie ta photo", instruction: "Dessine des rectangles noirs sur les informations à cacher. Appuie ou clique, puis fais glisser.", clear: "Effacer les rectangles", another: "Choisir une autre photo", consent: "J'accepte que mon courrier soit analysé par un service d'IA. Rien n'est conservé.", analyze: "Analyser le courrier", busy: "Analyse en cours…", textConsent: "J'accepte que mon courrier soit analysé par un service d'IA. Rien n'est conservé.", error: "Impossible de préparer la photo. Réessaie." },
  anglais: { title: "Review your photo", instruction: "Draw black rectangles over details to hide. Press or click, then drag.", clear: "Clear rectangles", another: "Choose another photo", consent: "I agree to have my letter analyzed by an AI service. Nothing is kept.", analyze: "Analyze letter", busy: "Analyzing…", textConsent: "I agree to have my letter analyzed by an AI service. Nothing is kept.", error: "Could not prepare the image. Please try again." },
  arabe: { title: "راجع صورتك", instruction: "ارسم مستطيلات سوداء فوق المعلومات التي تريد إخفاءها. اضغط أو انقر ثم اسحب.", clear: "امسح المستطيلات", another: "اختر صورة أخرى", consent: "أوافق على تحليل رسالتي بواسطة خدمة ذكاء اصطناعي. لن يتم الاحتفاظ بأي شيء.", analyze: "حلّل الرسالة", busy: "جارٍ التحليل…", textConsent: "أوافق على تحليل رسالتي بواسطة خدمة ذكاء اصطناعي. لن يتم الاحتفاظ بأي شيء.", error: "تعذّر تجهيز الصورة. حاول مرة أخرى." },
  espagnol: { title: "Revisa tu foto", instruction: "Dibuja rectángulos negros sobre los datos que quieras ocultar. Pulsa o haz clic y arrastra.", clear: "Borrar rectángulos", another: "Elegir otra foto", consent: "Acepto que un servicio de IA analice mi carta. No se conserva nada.", analyze: "Analizar la carta", busy: "Analizando…", textConsent: "Acepto que un servicio de IA analice mi carta. No se conserva nada.", error: "No se pudo preparar la imagen. Inténtalo de nuevo." },
  portugais: { title: "Revê a tua fotografia", instruction: "Desenha retângulos pretos sobre os dados que queres ocultar. Toca ou clica e arrasta.", clear: "Apagar retângulos", another: "Escolher outra fotografia", consent: "Aceito que a minha carta seja analisada por um serviço de IA. Nada é guardado.", analyze: "Analisar a carta", busy: "A analisar…", textConsent: "Aceito que a minha carta seja analisada por um serviço de IA. Nada é guardado.", error: "Não foi possível preparar a imagem. Tenta novamente." },
  chinois: { title: "检查照片", instruction: "在要隐藏的信息上绘制黑色矩形。按住或点击后拖动。", clear: "清除矩形", another: "选择另一张照片", consent: "我同意使用人工智能服务分析我的信件。不会保存任何内容。", analyze: "分析信件", busy: "正在分析…", textConsent: "我同意使用人工智能服务分析我的信件。不会保存任何内容。", error: "无法处理图片，请重试。" },
  turc: { title: "Fotoğrafını kontrol et", instruction: "Gizlemek istediğin bilgilerin üzerine siyah dikdörtgenler çiz. Dokun veya tıkla, ardından sürükle.", clear: "Dikdörtgenleri temizle", another: "Başka fotoğraf seç", consent: "Mektubumun bir yapay zekâ hizmeti tarafından incelenmesini kabul ediyorum. Hiçbir şey saklanmaz.", analyze: "Mektubu analiz et", busy: "Analiz ediliyor…", textConsent: "Mektubumun bir yapay zekâ hizmeti tarafından incelenmesini kabul ediyorum. Hiçbir şey saklanmaz.", error: "Görsel hazırlanamadı. Lütfen tekrar dene." },
  russe: { title: "Проверь фотографию", instruction: "Закрась чёрными прямоугольниками данные, которые нужно скрыть. Нажми или коснись экрана и потяни.", clear: "Убрать прямоугольники", another: "Выбрать другое фото", consent: "Я согласен(-на) на анализ письма сервисом ИИ. Данные не сохраняются.", analyze: "Анализировать письмо", busy: "Идёт анализ…", textConsent: "Я согласен(-на) на анализ письма сервисом ИИ. Данные не сохраняются.", error: "Не удалось подготовить изображение. Попробуйте ещё раз." },
};

function PhotoReview({ file, language, consent, onConsentChange, onCancel, onAnalyze, busy }: {
  file: File; language: Language; consent: boolean; onConsentChange: (value: boolean) => void;
  onCancel: () => void; onAnalyze: (file: File) => Promise<void>; busy: boolean;
}) {
  const strings = reviewUi[language];
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rectangles, setRectangles] = useState<Array<{ x: number; y: number; width: number; height: number }>>([]);
  const [draft, setDraft] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, dimensions.width, dimensions.height);
    for (const rectangle of [...rectangles, ...(draft ? [draft] : [])]) {
      context.fillStyle = "#000000";
      context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
  }, [dimensions, rectangles, draft]);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * (canvas.width / bounds.width), y: (event.clientY - bounds.top) * (canvas.height / bounds.height) };
  }

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dimensions.width) return;
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    const start = point(event); dragStart.current = start;
    setDraft({ x: start.x, y: start.y, width: 0, height: 0 });
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragStart.current) return;
    const start = dragStart.current; const current = point(event);
    setDraft({ x: Math.min(start.x, current.x), y: Math.min(start.y, current.y), width: Math.abs(current.x - start.x), height: Math.abs(current.y - start.y) });
  }

  function onPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragStart.current) return;
    const start = dragStart.current; const end = point(event); dragStart.current = null; setDraft(null);
    const rectangle = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.abs(end.x - start.x), height: Math.abs(end.y - start.y) };
    if (rectangle.width > 4 && rectangle.height > 4) setRectangles(previous => [...previous, rectangle]);
  }

  async function submitMaskedPhoto() {
    const image = imageRef.current; const overlay = canvasRef.current;
    if (!image || !overlay || !consent) return;
    try {
      const output = document.createElement("canvas"); output.width = image.naturalWidth; output.height = image.naturalHeight;
      const context = output.getContext("2d");
      if (!context) throw new Error("canvas unavailable");
      context.drawImage(image, 0, 0); context.drawImage(overlay, 0, 0);
      const blob = await new Promise<Blob | null>(resolve => output.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("canvas export failed");
      await onAnalyze(new File([blob], "courrier-masque.jpg", { type: "image/jpeg" }));
    } catch { setPhotoError(strings.error); }
  }

  return <section className="minimal-card">
    <button type="button" onClick={onCancel} className="mb-5 text-base font-semibold underline underline-offset-4">← {strings.another}</button>
    <h1 className="mb-2 text-3xl font-semibold tracking-tight">{strings.title}</h1>
    <p className="mb-5 text-lg leading-relaxed text-neutral-600">{strings.instruction}</p>
    <div className="relative w-full overflow-hidden border border-neutral-300 bg-neutral-100" style={{ aspectRatio: dimensions.width && dimensions.height ? `${dimensions.width}/${dimensions.height}` : "3/4", touchAction: "none" }}>
      {imageUrl && <img ref={imageRef} src={imageUrl} alt="Aperçu du courrier" onLoad={event => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} className="absolute inset-0 h-full w-full object-contain" />}
      <canvas ref={canvasRef} width={dimensions.width || 1} height={dimensions.height || 1} role="img" aria-label={strings.instruction} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} className="absolute inset-0 h-full w-full cursor-crosshair" />
    </div>
    <button type="button" onClick={() => { setRectangles([]); setDraft(null); }} disabled={!rectangles.length} className="my-4 text-base font-semibold underline underline-offset-4 disabled:opacity-40">{strings.clear}</button>
    <label className="consent-row">
      <input type="checkbox" checked={consent} onChange={event => onConsentChange(event.target.checked)} />
      <span>{strings.consent}</span>
    </label>
    {photoError && <p role="alert" className="mt-4 text-base font-semibold text-red-800">{photoError}</p>}
    <button type="button" onClick={() => void submitMaskedPhoto()} disabled={busy || !consent || !dimensions.width} className="minimal-primary mt-5 w-full">{busy ? strings.busy : strings.analyze}</button>
  </section>;
}

export default function CourrierApp({ showResult = false }: { showResult?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<Language>("français simple");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [showShareFallback, setShowShareFallback] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const rtl = language === "arabe";
  const t = ui[language];
  const a11y = accessibilityUi[language];
  const shareText = shareUi[language];

  useEffect(() => {
    try {
      const savedScale = window.localStorage.getItem("courrier-text-scale");
      const parsedScale = savedScale ? Number(savedScale) : 1;
      if (Number.isFinite(parsedScale)) setTextScale(Math.min(1.6, Math.max(1, parsedScale)));
      setHighContrast(window.localStorage.getItem("courrier-high-contrast") === "true");
    } catch { /* Le stockage peut être indisponible en navigation privée. */ }
    const savedLanguage = sessionStorage.getItem("courrier-language");
    if (savedLanguage && (languages as readonly string[]).includes(savedLanguage)) setLanguage(savedLanguage as Language);
    if (showResult) {
      const saved = sessionStorage.getItem("courrier-analysis");
      if (saved) setAnalysis(JSON.parse(saved) as Analysis);
    }
  }, [showResult]);

  function changeTextScale(delta: number) {
    setTextScale(current => {
      const next = Math.min(1.6, Math.max(1, Math.round((current + delta) * 10) / 10));
      try { window.localStorage.setItem("courrier-text-scale", String(next)); } catch { /* Le réglage reste actif pour cette visite. */ }
      return next;
    });
  }

  function toggleContrast() {
    setHighContrast(current => {
      const next = !current;
      try { window.localStorage.setItem("courrier-high-contrast", String(next)); } catch { /* Le réglage reste actif pour cette visite. */ }
      return next;
    });
  }

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    sessionStorage.setItem("courrier-language", nextLanguage);
  }

  async function analyze(file?: File, textOverride?: string) {
    if (!consent && textOverride === undefined) return;
    setError(""); setBusy(true);
    try {
      const form = new FormData();
      form.append("language", language);
      if (file) form.append("image", file);
      else form.append("text", (textOverride ?? text).trim());
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t.apiError);
      sessionStorage.setItem("courrier-analysis", JSON.stringify(payload.analysis));
      sessionStorage.setItem("courrier-language", language);
      setAnalysis(payload.analysis);
      router.push("/result");
    } catch (e) { setError(e instanceof Error ? e.message : t.apiError); }
    finally { setBusy(false); }
  }

  async function speak() {
    if (!analysis) return;
    setSpeaking(true); setError("");
    try {
      const action = analysis.actions[0]?.etape || t.noActions;
      const actionDate = analysis.actions[0]?.avant_le || displayDeadline;
      const spokenText = `${a11y.todo}. ${a11y.primaryAction}: ${action}. ${actionDate ? `${t.deadline}: ${analysis.date_estimee ? `${t.estimated} ` : ""}${actionDate}.` : ""} ${t.summary}: ${analysis.resume_simple}`;
      const response = await fetch("/api/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: spokenText, language }) });
      if (!response.ok) { const payload = await response.json(); throw new Error(payload.error || t.audioError); }
      const player = new Audio(URL.createObjectURL(await response.blob()));
      await player.play();
    } catch (e) { setError(e instanceof Error ? e.message : t.audioError); }
    finally { setSpeaking(false); }
  }

  async function copyReply() {
    if (!analysis?.reponse_proposee) return;
    try { await navigator.clipboard.writeText(analysis.reponse_proposee); setError(t.copied); }
    catch { setError(t.copyError); }
  }

  const shareMessage = analysis ? (() => {
    const summary = firstTwoSentences(removePersonalDetails(analysis.resume_simple));
    const action = removePersonalDetails(analysis.actions[0]?.etape || t.noActions);
    const sender = removePersonalDetails(analysis.expediteur);
    const date = analysis.date_limite_iso ? dateInLongLocale(analysis.date_limite_iso, language) : analysis.date_limite ? removePersonalDetails(analysis.date_limite) : "";
    const amountMatch = `${analysis.resume_simple} ${analysis.actions.map(item => item.etape).join(" ")}`.match(/(?:\d[\d\s.,]*\s?(?:€|euros?|EUR))|(?:€\s?\d[\d\s.,]*)/i);
    const amount = amountMatch?.[0]?.trim();
    return [
      `${shareText.from} : ${sender}`,
      `${shareText.says} : ${summary}`,
      `${shareText.action} : ${action}`,
      date ? `${shareText.deadline} : ${analysis.date_estimee ? `${t.estimated} ` : ""}${date}` : "",
      amount ? `${shareText.amount} : ${amount}` : "",
    ].filter(Boolean).join("\n");
  })() : "";

  async function shareWithClosePerson() {
    if (!shareMessage) return;
    setShareCopied(false);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareText.title, text: shareMessage });
        setShowShareFallback(false);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setShowShareFallback(true);
  }

  async function copyShareMessage() {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setShareCopied(true);
    } catch {
      setError(t.copyError);
    }
  }

  const encodedShareMessage = encodeURIComponent(shareMessage);

  function addReminder() {
    const deadline = analysis?.date_limite_iso;
    if (!deadline) return;
    const start = utcDay(deadline);
    const nextDay = new Date(`${deadline}T00:00:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const end = `${nextDay.getUTCFullYear()}${String(nextDay.getUTCMonth() + 1).padStart(2, "0")}${String(nextDay.getUTCDate()).padStart(2, "0")}`;
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Decode ton courrier//Reminder//FR", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      `UID:decode-courrier-${start}@local`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${escapeIcs(`${t.deadline}: ${analysis.expediteur}`)}`,
      `DESCRIPTION:${escapeIcs(t.reminderDetails)}`, "BEGIN:VALARM", "TRIGGER:-P3D", "ACTION:DISPLAY", `DESCRIPTION:${escapeIcs(t.reminderDetails)}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "rappel-courrier.ics"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const googleCalendarUrl = analysis?.date_limite_iso ? (() => {
    const start = utcDay(analysis.date_limite_iso!);
    const nextDay = new Date(`${analysis.date_limite_iso}T00:00:00Z`); nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const end = `${nextDay.getUTCFullYear()}${String(nextDay.getUTCMonth() + 1).padStart(2, "0")}${String(nextDay.getUTCDate()).padStart(2, "0")}`;
    const params = new URLSearchParams({ action: "TEMPLATE", text: `${t.deadline}: ${analysis.expediteur}`, dates: `${start}/${end}`, details: t.reminderDetails });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })() : "";

  const urgencyText = analysis ? ({ faible: t.urgencyLow, moyenne: t.urgencyMedium, haute: t.urgencyHigh })[analysis.urgence] : "";
  const displayDeadline = analysis?.date_limite_iso ? dateInLongLocale(analysis.date_limite_iso, language) : analysis?.date_limite;
  const primaryAction = analysis?.actions[0];
  const primaryActionLabel = primaryAction?.etape ? removeDeadlineFromAction(primaryAction.etape) : t.noActions;
  const primaryDateRaw = primaryAction?.avant_le || analysis?.date_limite_iso || analysis?.date_limite || "";
  const primaryDate = primaryDateRaw ? (analysis?.date_limite_iso && primaryDateRaw === analysis.date_limite_iso ? displayDeadline : dateInLongLocale(primaryDateRaw, language)) : "";

  return <main lang={localeByLanguage[language]} dir={rtl ? "rtl" : "ltr"} data-contrast={highContrast ? "high" : "normal"} style={{ "--text-scale": textScale } as React.CSSProperties} className={`minimal-app ${!showResult ? "home-page" : "result-page"} min-h-screen px-4 py-6 sm:px-6 sm:py-10 ${highContrast ? "contrast-high" : ""}`}>
    <div className={`page-container mx-auto ${showResult ? "max-w-2xl" : "max-w-5xl"}`}>
      <header className="site-header mb-6 flex items-center gap-3">
        <div aria-hidden="true" className="brand-mark flex h-11 w-11 items-center justify-center rounded-md text-xl font-bold text-white">D<span className="brand-dot">.</span></div>
        <div><p className="m-0 text-xl font-extrabold">Décode ton courrier</p><p className="brand-caption m-0">{t.tagline}</p></div>
      </header>

      <div role="group" aria-label={a11y.controls} className="accessibility-controls mb-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => changeTextScale(-0.1)} disabled={textScale <= 1} aria-label={`${a11y.decrease} — ${a11y.controls}`} className="a11y-control">{a11y.decrease}</button>
        <button type="button" onClick={() => changeTextScale(0.1)} disabled={textScale >= 1.6} aria-label={`${a11y.increase} — ${a11y.controls}`} className="a11y-control">{a11y.increase}</button>
        <button type="button" onClick={toggleContrast} aria-pressed={highContrast} className="a11y-control">{a11y.contrast}{highContrast ? " ✓" : ""}</button>
      </div>

      {!showResult && photoFile ? <PhotoReview file={photoFile} language={language} consent={consent} onConsentChange={setConsent} onCancel={() => { setPhotoFile(null); setConsent(false); }} onAnalyze={analyze} busy={busy} /> : !showResult ? <>
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> {t.tagline}</span>
            <h1 className="home-title">{homeCopy[language].title}</h1>
            <p className="home-subtitle">{homeCopy[language].subtitle}</p>
          </div>
          <div className="letter-illustration" aria-hidden="true">
            <div className="letter-sheet"><span className="letter-stamp">FR</span><span className="letter-line letter-line-short"/><span className="letter-line"/><span className="letter-line"/><span className="letter-line letter-line-mid"/><span className="letter-rule"/><span className="letter-line"/><span className="letter-line letter-line-mid"/><span className="letter-signature"/></div>
            <span className="illustration-spark spark-one">✳</span><span className="illustration-spark spark-two">✳</span>
          </div>
        </section>
        <section className="intake-card">
        <label htmlFor="language" className="mb-2 block font-bold">{t.language}</label>
        <select id="language" aria-label={t.language} value={language} onChange={e => changeLanguage(e.target.value as Language)} className="mb-6 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg">
          {languages.map(value => <option key={value} value={value}>{languageLabels[value]}</option>)}
        </select>
        <div className="intake-heading"><span className="step-number" aria-hidden="true">01</span><div><h2>{t.photo.replace("📷  ", "")}</h2><p>{t.intro}</p></div></div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} aria-label={t.photo} className="minimal-primary photo-button w-full">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="camera-icon"><path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.8"/></svg>
          <span>{t.photo.replace("📷  ", "")}</span><span className="button-arrow" aria-hidden="true">↗</span>
        </button>
        <input ref={inputRef} className="hidden" type="file" accept="image/*" capture="environment" aria-hidden="true" tabIndex={-1} onChange={e => { const file = e.target.files?.[0]; if (file) { setPhotoFile(file); setConsent(false); setError(""); } e.currentTarget.value = ""; }} />
        <button type="button" onClick={() => void analyze(undefined, exampleLetter)} disabled={busy} className="minimal-secondary mt-3 w-full">{homeCopy[language].example}</button>
        <div className="my-6 flex items-center gap-3 text-slate-500"><span className="h-px flex-1 bg-slate-200"/><span>{t.or}</span><span className="h-px flex-1 bg-slate-200"/></div>
        <label htmlFor="letter-text" className="mb-2 block font-bold">{t.text}</label>
        <textarea id="letter-text" rows={5} value={text} onChange={e => setText(e.target.value)} placeholder={t.placeholder} className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-lg leading-relaxed" />
        <label className="consent-row mt-5">
          <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />
          <span>{reviewUi[language].textConsent}</span>
        </label>
        <button type="button" onClick={() => void analyze()} disabled={busy || !text.trim() || !consent} className="minimal-primary mt-4 w-full">{busy ? t.analyzing : t.analyze}</button>
        <p className="mt-5 text-base leading-relaxed text-neutral-600">{t.privacy}</p>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">{t.caution}</p>
        </section>
      </> : analysis ? <section className="minimal-card p-5 sm:p-8" aria-labelledby="result-title">
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{a11y.resultReady}</div>
        <button type="button" onClick={() => router.push("/")} className="mb-5 rounded-lg px-1 py-2 font-bold text-[#111111] underline">{t.another}</button>
        <h1 id="result-title" className="sr-only">{t.summary}</h1>
        <p className="mb-4 text-base font-bold text-slate-600">{t.from} : {analysis.expediteur}</p>
        <div className="result-top mb-6">
          <div className={`todo-card ${analysis.urgence === "haute" ? "todo-high" : analysis.urgence === "moyenne" ? "todo-medium" : "todo-low"}`}>
            <p className="mb-2 text-lg font-extrabold uppercase tracking-wide">{a11y.todo}</p>
            <p className="mb-3 text-2xl font-extrabold leading-snug">{primaryActionLabel}</p>
            {primaryDate && <><p className="mb-1 text-lg font-bold">{t.deadline}</p><p className="deadline-display">{analysis.date_estimee && <span>{t.estimated} </span>}{analysis.date_limite_iso && primaryDateRaw === analysis.date_limite_iso ? <time dateTime={analysis.date_limite_iso}>{primaryDate}</time> : primaryDate}</p></>}
            <span className="mt-3 inline-block rounded-full border-2 px-3 py-1 text-base font-bold">{urgencyText}</span>
          </div>
          <button type="button" onClick={() => void speak()} disabled={speaking} aria-label={`${t.listen}. ${a11y.primaryAction}, date limite, puis ${t.summary}`} className="listen-primary"><span aria-hidden="true">🔊</span> {speaking ? t.preparingAudio : t.listen}</button>
        </div>
        <div className="mb-6 rounded-lg border-2 border-slate-300 p-4">
          <h2 className="mb-3 mt-0 text-lg font-extrabold">{homeCopy[language].next}</h2>
          {analysis.date_limite_iso && <p className="mt-0 text-base">{t.reminderDetails}</p>}
          <div className="action-buttons">
            {analysis.date_limite_iso && <><button type="button" onClick={addReminder} className="secondary-action rounded-lg border-2 px-5 py-3 font-bold">{t.reminder} (.ics)</button><a href={googleCalendarUrl} target="_blank" rel="noreferrer" className="secondary-action inline-flex items-center rounded-lg border-2 px-5 py-3 font-bold">Google Calendar</a></>}
            <button type="button" onClick={() => void shareWithClosePerson()} className="secondary-action rounded-lg border-2 px-5 py-3 font-bold">{shareText.button}</button>
          </div>
          {showShareFallback && <div className="mt-4 flex flex-wrap gap-3" aria-label={shareText.button}>
            <a href={`https://wa.me/?text=${encodedShareMessage}`} target="_blank" rel="noreferrer" className="secondary-action inline-flex items-center rounded-lg border-2 px-5 py-3 font-bold">WhatsApp</a>
            <a href={`sms:?body=${encodedShareMessage}`} className="secondary-action inline-flex items-center rounded-lg border-2 px-5 py-3 font-bold">SMS</a>
            <button type="button" onClick={() => void copyShareMessage()} className="secondary-action rounded-lg border-2 px-5 py-3 font-bold">{shareCopied ? shareText.copied : shareText.copy}</button>
          </div>}
        </div>
        <details className="result-section" open><summary>{t.summary}</summary><p className="whitespace-pre-line text-xl leading-relaxed">{analysis.resume_simple}</p></details>
        <details className="result-section"><summary>{t.actions}</summary>{analysis.actions.length ? <ol className="space-y-4 ps-6">{analysis.actions.map((action, i) => <li key={i} className="ps-1 leading-relaxed"><span>{action.etape}</span>{action.avant_le && <span className="mt-1 block font-bold">{t.deadline} : {dateInLongLocale(action.avant_le, language)}</span>}</li>)}</ol> : <p>{t.noActions}</p>}</details>
        {!!analysis.documents_a_fournir.length && <details className="result-section"><summary>{t.documents}</summary><ul className="list-disc space-y-3 ps-6">{analysis.documents_a_fournir.map((item, i) => <li key={i}>{item}</li>)}</ul></details>}
        {!!analysis.glossaire.length && <details className="result-section"><summary>{t.glossary}</summary><dl className="space-y-3">{analysis.glossaire.map((entry, i) => <div key={i} className="rounded-lg bg-slate-50 p-4"><dt className="font-bold">{entry.terme}</dt><dd className="mb-0 mt-1 leading-relaxed">{entry.explication}</dd></div>)}</dl></details>}
        {!!analysis.reponse_proposee && <details className="result-section"><summary>{t.answer}</summary><textarea readOnly dir="ltr" lang="fr" aria-label={t.answer} value={analysis.reponse_proposee} rows={9} className="w-full rounded-lg border-2 border-slate-300 bg-white p-3 text-left leading-relaxed"/><button type="button" onClick={() => void copyReply()} className="mt-3 rounded-lg border-2 border-[#111111] px-5 py-3 font-bold text-[#111111]">{t.copy}</button><details className="mt-4"><summary>{t.translation}</summary><p className="whitespace-pre-line rounded-lg bg-white p-4 leading-relaxed">{analysis.reponse_traduction}</p></details></details>}
        <p className="mt-6 rounded-lg bg-slate-100 p-4 text-base leading-relaxed text-slate-700">{t.notice}</p>
      </section> : <section className="soft-shadow rounded-3xl bg-white p-6"><h1 className="text-2xl font-extrabold">{t.noResult}</h1><p>{t.start}</p><button onClick={() => router.push("/")} className="rounded-xl bg-[#111111] px-5 py-3 font-bold text-white">{t.back}</button></section>}
      {error && <p role="status" aria-live="polite" className="mt-4 rounded-xl bg-red-100 p-4 font-semibold text-red-900">{error}</p>}
      <footer className="px-2 py-6 text-center text-sm leading-relaxed text-slate-600">{t.footer}</footer>
    </div>
  </main>;
}
