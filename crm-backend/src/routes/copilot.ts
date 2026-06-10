import { Router } from 'express';
import { parseGoal } from '../services/geminiService';

export const copilotRouter = Router();

// Endpoint: Parse marketer goal into structured JSON
copilotRouter.post('/parse-goal', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal text is required' });
    }

    const parsedData = await parseGoal(goal);
    res.status(200).json(parsedData);
  } catch (error) {
    console.error('Copilot parse goal error:', error);
    res.status(500).json({ error: 'AI failed to process the goal' });
  }
});
