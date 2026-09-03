import { MASTER_SPEC } from '../src/data/master_spec.js';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 10;

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  let record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  record.count++;
  rateLimitStore.set(ip, record);
  
  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  
  next();
}

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/learning-guide', rateLimit, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res.status(400).json({ error: 'Invalid or missing messages payload.' });
    }
    
    const totalLength = messages.reduce((acc, msg) => acc + (msg?.parts?.[0]?.text?.length || 0), 0);
    if (totalLength > 10000) {
      return res.status(400).json({ error: 'Payload too large.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemInstruction = `You are the AI Learning Guide for Mahmoud Teaching Platform.
Your role is to guide visitors, not replace Mahmoud.
Speak in a calm, human, knowledgeable, trustworthy, premium, and approachable tone.
Keep responses concise and helpful. Use English unless the user speaks Arabic.
Below is the Master Project Spec which defines the product, services, rules, and business logic.
You must adhere strictly to these rules, services, prices, and policies. Do not invent information that is not in the spec.
<master_spec>
${MASTER_SPEC}
</master_spec>`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate response.' });
  }
});

export default app;
