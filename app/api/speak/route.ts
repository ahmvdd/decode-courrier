import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { languages, type Language } from "@/lib/types";

export const runtime = "nodejs";
const voices: Record<Language, string> = {
  "français simple": "coral", anglais: "nova", arabe: "sage", espagnol: "shimmer",
  portugais: "coral", chinois: "nova", turc: "sage", russe: "shimmer",
};
const languageNames: Record<Language, string> = {
  "français simple": "French", anglais: "English", arabe: "Arabic", espagnol: "Spanish",
  portugais: "Portuguese", chinois: "Chinese", turc: "Turkish", russe: "Russian",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.text !== "string" || !body.text.trim()) return NextResponse.json({ error: "Aucun texte à lire." }, { status: 400 });
    if (body.text.length > 4000) return NextResponse.json({ error: "Le texte est trop long pour la lecture audio." }, { status: 400 });
    const language: Language = typeof body.language === "string" && (languages as readonly string[]).includes(body.language) ? body.language as Language : "français simple";
    const audio = await getOpenAI().audio.speech.create({ model: "gpt-4o-mini-tts", voice: voices[language] as "coral", input: body.text, instructions: `Speak clearly and slowly in ${languageNames[language]}.` });
    return new Response(await audio.arrayBuffer(), { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Synthèse vocale échouée:", error);
    const message = error instanceof Error && error.message === "OPENAI_API_KEY_MISSING" ? "Le service n’est pas encore configuré. Ajoutez OPENAI_API_KEY dans .env.local." : "La lecture audio n’est pas disponible pour le moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
