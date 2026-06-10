import { Router } from 'express';
import { generateSeedData } from '../utils/seed';

export const seedRouter = Router();

seedRouter.post('/', async (req, res) => {
  try {
    console.log('Starting seed generation... This may take a moment.');
    await generateSeedData();
    res.status(200).json({ message: 'Database seeded successfully with 300 customers and 1500 orders' });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});
