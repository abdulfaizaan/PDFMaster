import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Simple in-memory rate limiter for Edge/Serverless environments
// (Note: resets on cold starts, but good enough for a basic hackathon demo)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

export const runtime = 'edge'; // Optional: run on Edge

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const rateLimit = rateLimitMap.get(ip);

    if (rateLimit && rateLimit.resetAt > now) {
      if (rateLimit.count >= MAX_REQUESTS) {
        return new Response('Too many requests, please slow down.', { status: 429 });
      }
      rateLimit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }

    // 2. Parse request body
    const { messages, documentContext } = await req.json();

    if (!messages) {
      return new Response('Missing messages', { status: 400 });
    }

    // 3. Initialize Groq Provider
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // 4. Inject PDF Context if provided
    let systemPrompt = "You are MergeMaster AI, an intelligent assistant designed to help users understand their PDF documents.";
    
    if (documentContext) {
      systemPrompt += `\n\nHere is the extracted text from the user's PDF document. Use this to answer their questions accurately. Do not invent information that is not in the document.\n\n--- DOCUMENT START ---\n${documentContext}\n--- DOCUMENT END ---`;
    }

    // 5. Call Llama 3 via Groq and stream response
    const result = await streamText({
      model: groq('llama3-8b-8192') as any,
      system: systemPrompt,
      messages,
      temperature: 0.3,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}
