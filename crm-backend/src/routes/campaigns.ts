import { Router } from 'express';
import axios from 'axios';
import { Campaign } from '../models/Campaign';
import { Customer } from '../models/Customer';
import { Communication } from '../models/Communication';
import { buildMongoQuery } from '../services/segmentService';

export const campaignsRouter = Router();

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:3001';

// Endpoint: Create a draft campaign
campaignsRouter.post('/', async (req, res) => {
  try {
    const { name, goal, segment, channel, messageTemplate } = req.body;
    
    const campaign = new Campaign({
      name,
      goal,
      segment,
      channel,
      messageTemplate,
      status: 'draft'
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Endpoint: Launch campaign
campaignsRouter.post('/:id/send', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft campaigns can be launched' });
    }

    // 1. Get audience
    const query = buildMongoQuery(campaign.segment.filters);
    const customers = await Customer.find(query);

    if (customers.length === 0) {
      return res.status(400).json({ error: 'Audience is empty' });
    }

    // 2. Generate communications
    const communicationsToInsert = customers.map(customer => {
      // TRADEOFF: We do basic string replacement here rather than calling Gemini 
      // individually for every single customer at send-time.
      // Calling Gemini for 100,000 customers during dispatch would be far too slow and expensive.
      const personalizedMessage = campaign.messageTemplate
        .replace(/{name}/g, customer.name)
        .replace(/{city}/g, customer.city);

      return {
        campaignId: campaign._id,
        customerId: customer._id,
        message: personalizedMessage,
        channel: campaign.channel,
        status: 'queued',
        idempotencyKeys: [],
        statusHistory: [{ status: 'queued', timestamp: new Date() }]
      };
    });

    // 3. Bulk insert to DB
    const insertedComms = await Communication.insertMany(communicationsToInsert);

    // 4. Update campaign status
    campaign.status = 'active';
    campaign.launchedAt = new Date();
    // We do NOT update stats here. The channel service will call our webhook for every state change.
    await campaign.save();

    // 5. Dispatch to channel service
    const dispatchPayload = {
      campaignId: campaign._id,
      communications: insertedComms.map(c => ({
        communicationId: c._id,
        customerId: c.customerId,
        channel: c.channel,
        message: c.message
      }))
    };

    // We do not await this, we fire and forget to the internal simulator service
    // so the marketer gets an instant response.
    axios.post(`${CHANNEL_SERVICE_URL}/dispatch`, dispatchPayload)
      .catch(err => console.error('Failed to contact channel service:', err.message));

    res.status(200).json({ 
      message: 'Campaign launched successfully',
      audienceSize: customers.length,
      campaign
    });
  } catch (error) {
    console.error('Launch campaign error:', error);
    res.status(500).json({ error: 'Failed to launch campaign' });
  }
});

// Endpoint: List all campaigns
campaignsRouter.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Endpoint: Get Campaign Detail + Stats
campaignsRouter.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});
