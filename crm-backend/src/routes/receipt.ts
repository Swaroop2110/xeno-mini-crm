import { Router } from 'express';
import { Communication } from '../models/Communication';
import { Campaign } from '../models/Campaign';
import { checkCampaignCompletion } from '../services/campaignService';

export const receiptRouter = Router();

receiptRouter.post('/', async (req, res) => {
  try {
    const { communicationId, campaignId, customerId, status, timestamp, idempotencyKey } = req.body;

    // 1. Idempotency Check
    // If this specific idempotency key has already been added to the array, it's a duplicate.
    const existing = await Communication.findOne({ 
      _id: communicationId,
      idempotencyKeys: idempotencyKey 
    });

    if (existing) {
      // Return 200 immediately to acknowledge without reprocessing
      return res.status(200).json({ message: 'Event already processed' });
    }

    // 2. Validate Communication Exists
    const communication = await Communication.findById(communicationId);
    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    // 3. Update Communication
    communication.status = status;
    communication.statusHistory.push({ status, timestamp: new Date(timestamp || Date.now()) });
    communication.idempotencyKeys.push(idempotencyKey);
    
    if (status === 'failed') {
      communication.retryCount += 1;
    }
    
    await communication.save();

    // 4. Update campaign stats atomically
    const validStats = ['sent', 'delivered', 'failed', 'opened', 'clicked', 'converted'];
    if (validStats.includes(status)) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { [`stats.${status}`]: 1 }
      });
    }

    // 5. If all communications are terminal, trigger analysis
    // We execute this async without awaiting it so we can respond 200 immediately
    checkCampaignCompletion(campaignId).catch(console.error);

    res.status(200).json({ message: 'Receipt processed successfully' });
  } catch (error) {
    console.error('Receipt error:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});
