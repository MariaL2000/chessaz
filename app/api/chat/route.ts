/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    let resourcesContext = "";
    try {
      const resources = await prisma.resource.findMany({
        take: 6,
        select: {
          title: true,
          price: true,
        },
      });

      resourcesContext = resources
        .map((r) => `- ${r.title}: ${r.price === 0 ? "FREE" : `$${r.price}`}`)
        .join("\n");
    } catch {
      resourcesContext =
        "Explore our latest chess courses and lessons on the platform.";
    }

    const systemPrompt = `
      You are the official Virtual Assistant for "Chessaz", an online chess education platform.
      You are a friendly, professional, and knowledgeable bilingual AI assistant. Always respond in the language used by the user (default to English if ambiguous).

      Your Key Functions:
      1. Help students find chess courses, lessons, openings, and training resources available on Chessaz:
         Featured available items:
         ${resourcesContext}
      2. Answer questions regarding chess rules, strategies, openings, and tactics clearly and professionally.
      3. Encourage teachers and coaches to sell their own resources! Inform them that Chessaz allows teachers to easily publish, share, and monetize their chess lessons and content.
      
      Keep answers concise, engaging, and welcoming.
    `;

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await streamText({
      model: google("gemini-2.5-flash"), // <-- CAMBIADO AQUÍ
      system: systemPrompt,
      messages: formattedMessages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("API Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
