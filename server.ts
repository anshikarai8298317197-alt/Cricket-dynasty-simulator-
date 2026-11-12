import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for news to prevent excessive rate-limiting
let newsCache: { timestamp: number; data: any[] } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
let quotaCooldownUntil = 0; // Cooldown after 429 quota exhaustion

const FALLBACK_HEADLINES = [
  {
    id: 'news-1',
    title: 'IPL 2026 Mega Auction: Franchises Finalize High-Stakes Retention Strategies',
    summary: 'Franchises lock in their core squads with intense bidding expected for elite all-rounders and express pacers ahead of the new season.',
    source: 'ESPNcricinfo',
    category: 'IPL & AUCTIONS',
    timeAgo: 'Just now',
  },
  {
    id: 'news-2',
    title: 'ICC World Championship: Elite White-Ball Power-Hitting Sets New Standard',
    summary: 'Top cricket nations elevate training intensity focusing on death-overs strike rates and modern bowling variations.',
    source: 'ICC Media Desk',
    category: 'INTERNATIONAL',
    timeAgo: '2h ago',
  },
  {
    id: 'news-3',
    title: 'Advanced Sports Science & Workload Management Revolutionizes Player Longevity',
    summary: 'Medical departments deploy biometric fatigue analytics to prevent bowler injuries during grueling tournament schedules.',
    source: 'Cricbuzz Tech',
    category: 'SQUAD & HEALTH',
    timeAgo: '4h ago',
  },
  {
    id: 'news-4',
    title: 'T20 Tacticians Prioritize Flexible Batting Orders and Spin Matchups',
    summary: 'Managers and analysts highlight middle-overs strike rotation and match-up tactics as the decisive championship factor.',
    source: 'Wisden Cricket',
    category: 'TACTICS',
    timeAgo: '6h ago',
  },
];

app.get('/api/news/cricket-headlines', async (_req: Request, res: Response) => {
  try {
    if (newsCache && Date.now() - newsCache.timestamp < CACHE_TTL_MS) {
      return res.json({ success: true, articles: newsCache.data, cached: true });
    }

    // If quota was previously exhausted, serve curated fallback without throwing errors
    if (Date.now() < quotaCooldownUntil) {
      return res.json({ success: true, articles: FALLBACK_HEADLINES, fallback: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ success: true, articles: FALLBACK_HEADLINES, fallback: true });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `Search Google for the top 4-5 real-world cricket news headlines and breaking updates from recent cricket tournaments, IPL, or international fixtures.
Format your answer strictly as a JSON array of objects with the keys:
- "id": string
- "title": punchy headline text
- "summary": 1-2 sentence concise summary
- "source": news publication name
- "category": tag (e.g. "IPL", "INTERNATIONAL", "TRANSFERS")
- "timeAgo": relative time (e.g. "1h ago", "Today")

Return only the valid JSON array without any markdown code fences or extra words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || '';
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.substring(7);
    } else if (text.startsWith('```')) {
      text = text.substring(3);
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = groundingChunks
      .map((c: any) => c.web?.title || c.web?.uri)
      .filter(Boolean);

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        newsCache = {
          timestamp: Date.now(),
          data: parsed,
        };
        return res.json({
          success: true,
          articles: parsed,
          sources: searchSources,
          grounded: true,
        });
      }
    } catch {
      // JSON parse error, quietly use fallback
    }

    return res.json({
      success: true,
      articles: FALLBACK_HEADLINES,
      fallback: true,
    });
  } catch (err: any) {
    const errorStr = String(err?.message || err || '');
    // If quota exceeded or 429, trigger a 15-minute cooldown to prevent spamming
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota')) {
      quotaCooldownUntil = Date.now() + 15 * 60 * 1000;
    }
    return res.json({
      success: true,
      articles: FALLBACK_HEADLINES,
      fallback: true,
    });
  }
});

// Vite middleware in development
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Wicket Dynasty] Full-stack Server listening on http://0.0.0.0:${PORT}`);
});
