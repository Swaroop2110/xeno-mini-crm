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

// Endpoint: GET /api/segments/customers
// Returns all customers in the database (with basic pagination)
segmentsRouter.get('/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Customer.countDocuments();

    res.status(200).json({
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});
