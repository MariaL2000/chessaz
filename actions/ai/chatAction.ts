"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey!);

export async function askChessBot(
  message: string,
  history: { role: string; content: string }[],
) {
  try {
    if (!apiKey) {
      return {
        ok: false,
        text: "The AI assistant is not configured yet. Please contact support.",
      };
    }

    // 1. Consultar recursos recientes para dar contexto real al bot
    let resourcesContext = "";
    try {
      const resources = await prisma.resource.findMany({
        take: 5,
        select: { title: true, price: true },
      });

      resourcesContext = resources
        .map((r) => `- ${r.title}: ${r.price === 0 ? "FREE" : `$${r.price}`}`)
        .join("\n");
    } catch {
      resourcesContext = "Chessaz platform courses and resources.";
    }

    // 2. Definir instrucciones de sistema
    const systemInstruction = `
      You are the official Virtual Assistant for "Chessaz", an online chess education platform.
      You are a friendly, professional, and knowledgeable bilingual AI assistant. 
      Always respond in English (or the user's language).

      Your Key Functions:
      - Help students find chess courses and training resources. Featured:
        ${resourcesContext}
      - Answer questions regarding chess rules, strategies, openings, and tactics.
      - Encourage teachers and coaches to sell their own resources! Inform them that Chessaz 
        allows teachers to easily publish, share, and monetize their content.
      - Keep answers concise and professional.
    `;

    // 3. Inicializar modelo
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    // 4. Iniciar chat con historial
    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
    });

    // 5. Enviar mensaje
    const result = await chat.sendMessage(message);
    const response = result.response;

    return { ok: true, text: response.text() };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      ok: false,
      text: "I'm sorry, I encountered an issue. Please try again.",
    };
  }
}
