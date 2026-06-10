import { Campaign } from '../models/Campaign';
import { Communication } from '../models/Communication';

export const checkCampaignCompletion = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign || campaign.status === 'completed') return;

  const totalComms = await Communication.countDocuments({ campaignId });
  
  // Any status past 'sent' means the initial dispatch outcome is known
  // (It either failed or was delivered, which may later turn into opens/clicks)
  const nonTerminalComms = await Communication.countDocuments({
    campaignId,
    status: { $in: ['queued', 'sent'] }
  });

  if (totalComms > 0 && nonTerminalComms === 0) {
    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();

    console.log(`Campaign ${campaignId} is now completed. AI Analyst will be triggered here.`);
    // TODO: Trigger Gemini post-campaign analysis (async, non-blocking) in Step 16
  }
};
