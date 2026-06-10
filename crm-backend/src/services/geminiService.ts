import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Parses a natural language goal from a marketer into structured JSON filters.
 * SIGNAL: This prompt extracts intent and safely maps it to our exact database schema boundaries.
 */
export const parseGoal = async (goal: string) => {
  const prompt = `
You are an AI assistant for a marketing CRM.
A marketer has described a campaign goal.
Extract structured campaign parameters from it.

Goal: "${goal}"

Available customer fields:
- lastOrderDate (Date)
- totalSpend (Number, in INR)
- orderCount (Number)
- churnScore (Number, 0-1)
- city (String)
- gender (String)

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "segment": {
    "lastOrderDaysBefore": <number or null>,
    "lastOrderDaysAfter": <number or null>,
    "minTotalSpend": <number or null>,
    "maxTotalSpend": <number or null>,
    "minOrderCount": <number or null>,
    "city": <string or null>,
    "minChurnScore": <number or null>
  },
  "recommendedChannel": "email" | "sms" | "whatsapp",
  "campaignName": "<string>",
  "channelReasoning": "<1-2 sentences why this channel>",
  "segmentReasoning": "<1-2 sentences why this audience>",
  "expectedConversionMin": <number>,
  "expectedConversionMax": <number>
}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Strip markdown formatting if Gemini accidentally includes it
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini parseGoal error:', error);
    throw new Error('Failed to parse goal using AI');
  }
};
