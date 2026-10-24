export const languages = [
  "français simple", "anglais", "arabe", "espagnol", "portugais", "chinois", "turc", "russe",
] as const;
export type Language = (typeof languages)[number];

export type Analysis = {
  expediteur: string;
  resume_simple: string;
  urgence: "faible" | "moyenne" | "haute";
  date_limite: string | null;
  date_limite_iso: string | null;
  date_estimee: boolean;
  actions: { etape: string; avant_le: string | null }[];
  documents_a_fournir: string[];
  reponse_proposee: string;
  reponse_traduction: string;
  glossaire: { terme: string; explication: string }[];
};

export const localeByLanguage: Record<Language, string> = {
  "français simple": "fr-FR", anglais: "en-GB", arabe: "ar", espagnol: "es-ES",
  portugais: "pt-PT", chinois: "zh-CN", turc: "tr-TR", russe: "ru-RU",
};
