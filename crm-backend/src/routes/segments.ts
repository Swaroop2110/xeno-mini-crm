import { Router } from 'express';
import { Customer } from '../models/Customer';
import { buildMongoQuery } from '../services/segmentService';

export const segmentsRouter = Router();

// Endpoint: POST /api/segments/preview
// Returns the count of customers matching the provided filters
segmentsRouter.post('/preview', async (req, res) => {
  try {
    const { filters } = req.body;
    
    if (!filters) {
      return res.status(400).json({ error: 'Filters object is required' });
    }

    const mongoQuery = buildMongoQuery(filters);
    const audienceSize = await Customer.countDocuments(mongoQuery);

    res.status(200).json({
      audienceSize,
      mongoQuery // returning the query helps with debugging/explainability panel
    });
  } catch (error) {
    console.error('Segment preview error:', error);
    res.status(500).json({ error: 'Failed to preview segment' });
  }
});
