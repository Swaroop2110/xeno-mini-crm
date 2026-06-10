import { Router } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { Campaign } from '../models/Campaign';
import { Customer } from '../models/Customer';
import { Communication } from '../models/Communication';
import { buildMongoQuery } from '../services/segmentService';
import { analyzeCampaign } from '../services/geminiService';

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

// Endpoint: Deep Campaign Stats (Aggregation Query)
campaignsRouter.get('/:id/stats', async (req, res) => {
  try {
    const campaignId = new mongoose.Types.ObjectId(req.params.id);
    
    // Aggregation 1: Count communications by status
    const statusCounts = await Communication.aggregate([
      { $match: { campaignId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Aggregation 2: Get recent failures for the marketer to review
    const recentFailures = await Communication.find({ 
      campaignId, 
      status: 'failed' 
    })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('customerId', 'name city email'); // Populate basic customer details

    // Convert array of { _id: "sent", count: 5 } to an object { sent: 5 }
    const formattedStats = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      breakdown: formattedStats,
      recentFailures
    });
  } catch (error) {
    console.error('Stats aggregation error:', error);
    res.status(500).json({ error: 'Failed to aggregate campaign stats' });
  }
});

// Endpoint: AI Campaign Analysis
campaignsRouter.post('/:id/analyze', async (req, res) => {
  try {
    const campaignId = new mongoose.Types.ObjectId(req.params.id);
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const statusCounts = await Communication.aggregate([
      { $match: { campaignId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formattedStats = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const analysis = await analyzeCampaign(campaign, formattedStats);
    res.status(200).json({ analysis });
  } catch (error) {
    console.error('Campaign analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze campaign' });
  }
});
