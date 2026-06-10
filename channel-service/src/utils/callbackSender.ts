import axios from 'axios';
import { ReceiptPayload } from '../queue/types';

const CRM_RECEIPT_URL = process.env.CRM_RECEIPT_URL || 'http://localhost:3000/api/receipt';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Sends a callback to the CRM service with automatic retries and exponential backoff.
 */
export const sendCallback = async (payload: ReceiptPayload) => {
  const maxRetries = 3;
  const backoffDelays = [1000, 2000, 4000]; // 1s, 2s, 4s

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await axios.post(CRM_RECEIPT_URL, payload, { timeout: 5000 });
      return; // Success
    } catch (error: any) {
      if (attempt === maxRetries) {
        // TRADEOFF: After 3 failed retries, we log and discard.
        // In a true production system, we would push this to a Dead Letter Queue (DLQ)
        // for manual inspection or later replay. For this scope, discarding is acceptable.
        console.error(`[DLQ] Callback permanently failed for ${payload.idempotencyKey} after ${maxRetries} retries.`);
        return;
      }
      
      const waitTime = backoffDelays[attempt];
      // console.warn(`Callback failed for ${payload.idempotencyKey}. Retrying in ${waitTime}ms...`);
      await delay(waitTime);
    }
  }
};
