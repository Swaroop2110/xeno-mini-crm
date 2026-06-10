import { Router } from 'express';
import { parseGoal, generateMessage } from '../services/geminiService';
import { Customer } from '../models/Customer';

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
    res.status(500).json({ 
      error: 'AI failed to process the goal',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Endpoint: Generate personalized message preview
copilotRouter.post('/generate-message', async (req, res) => {
  try {
    const { template, customerId } = req.body;
    
    if (!template || !customerId) {
      return res.status(400).json({ error: 'Template and customerId are required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const message = await generateMessage(template, customer);
    res.status(200).json({ message });
  } catch (error) {
    console.error('Copilot generate message error:', error);
    res.status(500).json({ 
      error: 'AI failed to generate message',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
