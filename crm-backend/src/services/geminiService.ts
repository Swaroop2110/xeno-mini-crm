import { GoogleGenerativeAI } from '@google/generative-ai';

export const parseGoal = async (goal: string) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

/**
 * Generates a personalized message using AI based on customer context.
 */
export const generateMessage = async (template: string, customer: any) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are a highly skilled marketing copywriter.
Write a personalized marketing message for this customer.
Template concept/goal: "${template}"

Customer Context:
- Name: ${customer.name}
- City: ${customer.city}
- Total Spend: ${customer.totalSpend} INR
- Order Count: ${customer.orderCount}
- Churn Risk: ${customer.churnScore > 0.6 ? 'High' : 'Low'} (Score: ${customer.churnScore})

Constraints:
- Keep it concise, engaging, and highly persuasive.
- DO NOT use markdown.
- Use the customer's name and reference their location or status if relevant.
- Ensure the message directly aligns with the template concept.

Respond ONLY with the exact message text. No explanations.
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini generateMessage error:', error);
    throw new Error('Failed to generate message using AI');
  }
};
