import { Router } from 'express';
import { DispatchRequest } from '../queue/types';
import { enqueueCommunications } from '../queue/processor';

export const dispatchRouter = Router();

dispatchRouter.post('/', (req, res) => {
  const payload: DispatchRequest = req.body;

  if (!payload || !payload.campaignId || !payload.communications) {
    return res.status(400).json({ error: 'Invalid dispatch payload' });
  }

  // Enqueue the batch
  enqueueCommunications(payload.communications);

  // Return 202 Accepted immediately (do not wait for processing)
  res.status(202).json({ 
    message: 'Communications queued for dispatch',
    count: payload.communications.length
  });
});
