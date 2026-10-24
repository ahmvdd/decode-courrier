import OpenAI from "openai";

let client: OpenAI | undefined;
export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY_MISSING");
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}
