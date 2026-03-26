import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/scores — Submit a new score
router.post('/', authenticate, async (req, res) => {
  try {
    const { wpm, rawWpm, accuracy, mode, duration, difficulty } = req.body;

    // Validation
    if (wpm == null || rawWpm == null || accuracy == null || !mode || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields: wpm, rawWpm, accuracy, mode, difficulty.' });
    }

    if (!['time', 'quote'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be "time" or "quote".' });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Difficulty must be "easy", "medium", or "hard".' });
    }

    if (mode === 'time' && !duration) {
      return res.status(400).json({ error: 'Duration is required for time mode.' });
    }

    const score = await req.prisma.score.create({
      data: {
        wpm: Math.round(wpm),
        rawWpm: Math.round(rawWpm),
        accuracy: parseFloat(accuracy),
        mode,
        duration: mode === 'time' ? parseInt(duration) : null,
        difficulty,
        userId: req.user.id,
      },
    });

    res.status(201).json({ score });
  } catch (err) {
    console.error('Submit score error:', err);
    res.status(500).json({ error: 'Failed to submit score.' });
  }
});

// GET /api/scores/me — Get current user's score history
router.get('/me', authenticate, async (req, res) => {
  try {
    const { mode, duration, difficulty, limit = 50 } = req.query;
    const where = { userId: req.user.id };

    if (mode) where.mode = mode;
    if (duration) where.duration = parseInt(duration);
    if (difficulty) where.difficulty = difficulty;

    const scores = await req.prisma.score.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json({ scores });
  } catch (err) {
    console.error('Get scores error:', err);
    res.status(500).json({ error: 'Failed to get scores.' });
  }
});

// GET /api/scores/personal-best — Get user's personal bests
router.get('/personal-best', authenticate, async (req, res) => {
  try {
    // Get best score for each mode/duration combination
    const allScores = await req.prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { wpm: 'desc' },
    });

    // Group by mode+duration key and pick the best
    const bests = {};
    for (const score of allScores) {
      const key = score.mode === 'quote' ? 'quote' : `time-${score.duration}`;
      if (!bests[key] || score.wpm > bests[key].wpm) {
        bests[key] = {
          wpm: score.wpm,
          rawWpm: score.rawWpm,
          accuracy: score.accuracy,
          difficulty: score.difficulty,
          date: score.createdAt,
        };
      }
    }

    res.json({ personalBests: bests });
  } catch (err) {
    console.error('Get personal best error:', err);
    res.status(500).json({ error: 'Failed to get personal bests.' });
  }
});

export default router;
