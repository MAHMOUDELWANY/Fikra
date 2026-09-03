import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Learning Guide AI Route
  app.post('/api/learning-guide', async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI service unavailable.' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `
You are the AI Learning Guide for Mahmoud Teaching Platform.
Your role is to guide visitors, not replace Mahmoud.
You can help with: discovering learner needs, explaining services, suggesting a suitable service, explaining how the trial works, explaining booking, answering product FAQs, and guiding the learner toward booking a free trial.

Rules:
- NEVER invent Mahmoud's credentials (he has IELTS C1, Al-Azhar educational background, ~3 years experience, ~30 students taught, Preply Teaching Online Certificate).
- NEVER invent prices (English is ~$10/hr, other subjects are ~$7/hr).
- NEVER invent availability, policies, or testimonials.
- NEVER promise learning outcomes.
- NEVER act as a replacement for Mahmoud.
- For complex religious/educational questions beyond basic knowledge, direct the user to Mahmoud or an appropriate authoritative source.
- Standard lesson durations: 30, 45, or 60 minutes.
- Free trial: default 30 mins, max 45 mins. One per new student.
- Cancellation/rescheduling: Allowed up to 3 hours before the lesson.

Speak in a calm, human, knowledgeable, trustworthy, premium, and approachable tone.
Keep responses concise and helpful. Use English unless the user speaks Arabic.
      `.trim();

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
