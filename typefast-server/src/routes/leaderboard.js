import { Router } from 'express';

const router = Router();

// GET /api/leaderboard/all — Get all scores unfiltered
router.get('/all', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const scores = await req.prisma.score.findMany({
      orderBy: { wpm: 'desc' },
      take: parseInt(limit),
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    const leaderboard = scores.map((score, index) => ({
      rank: index + 1,
      id: score.id,
      wpm: score.wpm,
      rawWpm: score.rawWpm,
      accuracy: score.accuracy,
      mode: score.mode,
      duration: score.duration,
      difficulty: score.difficulty,
      createdAt: score.createdAt,
      user: score.user,
    }));

    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to get leaderboard.' });
  }
});

// GET /api/leaderboard — Get top scores (filtered)
router.get('/', async (req, res) => {
  try {
    const { mode = 'time', duration = 60, difficulty, limit = 20 } = req.query;
    const where = { mode };

    if (mode === 'time' && duration) {
      where.duration = parseInt(duration);
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const scores = await req.prisma.score.findMany({
      where,
      orderBy: { wpm: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });

    // Add rank numbers
    const leaderboard = scores.map((score, index) => ({
      rank: index + 1,
      id: score.id,
      wpm: score.wpm,
      rawWpm: score.rawWpm,
      accuracy: score.accuracy,
      difficulty: score.difficulty,
      createdAt: score.createdAt,
      user: score.user,
    }));

    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to get leaderboard.' });
  }
});

export default router;
