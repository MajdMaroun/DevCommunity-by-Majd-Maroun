import { cookies } from "next/headers";

const en = {
  notifications: "Notifications",
  notificationsDesc: "Choose what you hear about.",
  emailNotifications: "Email notifications",
  emailNotificationsDesc: "Replies, mentions, and account activity.",
  pushNotifications: "Push notifications",
  pushNotificationsDesc: "Get alerts on your devices.",
  weeklyDigest: "Weekly digest",
  weeklyDigestDesc: "A summary of what you missed.",
  privacy: "Privacy",
  privacyDesc: "Control who can see what.",
  privateAccount: "Private account",
  privateAccountDesc: "Only approved followers can see your posts.",
  showActivityStatus: "Show activity status",
  showActivityStatusDesc: "Let others see when you're online.",
  preferences: "Preferences",
  theme: "Theme",
  system: "System",
  dark: "Dark",
  light: "Light",
  language: "Language",
  save: "Save changes",
  saving: "Saving...",
  saved: "Settings saved.",
  pushUnsupported: "This browser doesn't support push notifications.",
  pushBlocked: "Notifications are blocked. Allow them in your browser settings.",
};

export type Dict = typeof en;

const ar: Dict = {
  notifications: "الإشعارات",
  notificationsDesc: "اختر ما تريد أن تصلك إشعارات عنه.",
  emailNotifications: "إشعارات البريد الإلكتروني",
  emailNotificationsDesc: "الردود والإشارات ونشاط الحساب.",
  pushNotifications: "الإشعارات الفورية",
  pushNotificationsDesc: "احصل على تنبيهات على أجهزتك.",
  weeklyDigest: "الملخص الأسبوعي",
  weeklyDigestDesc: "ملخص لما فاتك.",
  privacy: "الخصوصية",
  privacyDesc: "تحكم في من يمكنه رؤية ماذا.",
  privateAccount: "حساب خاص",
  privateAccountDesc: "المتابعون المعتمدون فقط يمكنهم رؤية منشوراتك.",
  showActivityStatus: "إظهار حالة النشاط",
  showActivityStatusDesc: "دع الآخرين يرون متى تكون متصلاً.",
  preferences: "التفضيلات",
  theme: "المظهر",
  system: "النظام",
  dark: "داكن",
  light: "فاتح",
  language: "اللغة",
  save: "حفظ التغييرات",
  saving: "جارٍ الحفظ...",
  saved: "تم حفظ الإعدادات.",
  pushUnsupported: "هذا المتصفح لا يدعم الإشعارات الفورية.",
  pushBlocked: "الإشعارات محظورة. اسمح بها من إعدادات المتصفح.",
};

const fr: Dict = {
  notifications: "Notifications",
  notificationsDesc: "Choisissez ce dont vous voulez être informé.",
  emailNotifications: "Notifications par e-mail",
  emailNotificationsDesc: "Réponses, mentions et activité du compte.",
  pushNotifications: "Notifications push",
  pushNotificationsDesc: "Recevez des alertes sur vos appareils.",
  weeklyDigest: "Résumé hebdomadaire",
  weeklyDigestDesc: "Un résumé de ce que vous avez manqué.",
  privacy: "Confidentialité",
  privacyDesc: "Contrôlez qui peut voir quoi.",
  privateAccount: "Compte privé",
  privateAccountDesc: "Seuls les abonnés approuvés voient vos publications.",
  showActivityStatus: "Afficher le statut d'activité",
  showActivityStatusDesc: "Laissez les autres voir quand vous êtes en ligne.",
  preferences: "Préférences",
  theme: "Thème",
  system: "Système",
  dark: "Sombre",
  light: "Clair",
  language: "Langue",
  save: "Enregistrer",
  saving: "Enregistrement...",
  saved: "Paramètres enregistrés.",
  pushUnsupported: "Ce navigateur ne prend pas en charge les notifications push.",
  pushBlocked: "Les notifications sont bloquées. Autorisez-les dans votre navigateur.",
};

const es: Dict = {
  notifications: "Notificaciones",
  notificationsDesc: "Elige de qué quieres enterarte.",
  emailNotifications: "Notificaciones por correo",
  emailNotificationsDesc: "Respuestas, menciones y actividad de la cuenta.",
  pushNotifications: "Notificaciones push",
  pushNotificationsDesc: "Recibe alertas en tus dispositivos.",
  weeklyDigest: "Resumen semanal",
  weeklyDigestDesc: "Un resumen de lo que te perdiste.",
  privacy: "Privacidad",
  privacyDesc: "Controla quién puede ver qué.",
  privateAccount: "Cuenta privada",
  privateAccountDesc: "Solo los seguidores aprobados ven tus publicaciones.",
  showActivityStatus: "Mostrar estado de actividad",
  showActivityStatusDesc: "Deja que otros vean cuándo estás en línea.",
  preferences: "Preferencias",
  theme: "Tema",
  system: "Sistema",
  dark: "Oscuro",
  light: "Claro",
  language: "Idioma",
  save: "Guardar cambios",
  saving: "Guardando...",
  saved: "Ajustes guardados.",
  pushUnsupported: "Este navegador no admite notificaciones push.",
  pushBlocked: "Las notificaciones están bloqueadas. Permítelas en tu navegador.",
};

const dictionaries = { en, ar, fr, es };

export async function getDict(): Promise<{ lang: keyof typeof dictionaries; t: Dict }> {
  const jar = await cookies();
  const raw = jar.get("lang")?.value ?? "en";
  const lang = (raw in dictionaries ? raw : "en") as keyof typeof dictionaries;
  return { lang, t: dictionaries[lang] };
}