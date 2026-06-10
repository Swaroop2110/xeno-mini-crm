import { CommunicationPayload, Status, ReceiptPayload } from './types';
import { sendCallback } from '../utils/callbackSender';

// In-memory queue
const queue: CommunicationPayload[] = [];
let isProcessing = false;

// TRADEOFF: Using a simple in-memory array and a boolean lock to process items in batches.
// At 1M messages/day, we would use Redis + BullMQ so the queue survives process restarts
// and can be scaled horizontally across multiple workers.
export const enqueueCommunications = (communications: CommunicationPayload[]) => {
  queue.push(...communications);
  
  if (!isProcessing) {
    processQueue();
  }
};

const delay = (min: number, max: number) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(res => setTimeout(res, ms));
};

const reportStatus = async (item: CommunicationPayload, status: Status) => {
  const payload: ReceiptPayload = {
    communicationId: item.communicationId,
    campaignId: item.campaignId,
    customerId: item.customerId,
    status,
    timestamp: new Date().toISOString(),
    idempotencyKey: `${item.communicationId}_${status}`
  };
  await sendCallback(payload);
};

const processCommunication = async (item: CommunicationPayload) => {
  // 1. Sent: immediately, always succeeds
  await reportStatus(item, 'sent');

  // 2. Delivered vs Failed
  await delay(1000, 3000);
  const deliveryRoll = Math.random();
  if (deliveryRoll < 0.10) {
    // 10% chance to fail
    await reportStatus(item, 'failed');
    return; // Terminal state
  }
  
  await reportStatus(item, 'delivered');

  // 3. Opened
  await delay(3000, 8000);
  if (Math.random() > 0.40) return; // 40% of delivered are opened
  await reportStatus(item, 'opened');

  // 4. Clicked
  await delay(5000, 15000);
  if (Math.random() > 0.25) return; // 25% of opened are clicked
  await reportStatus(item, 'clicked');

  // 5. Converted
  await delay(10000, 30000);
  if (Math.random() > 0.15) return; // 15% of clicked convert
  await reportStatus(item, 'converted');
};

const processQueue = async () => {
  isProcessing = true;
  const CONCURRENCY_LIMIT = 10;

  while (queue.length > 0) {
    // Take a batch of up to CONCURRENCY_LIMIT
    const batch = queue.splice(0, CONCURRENCY_LIMIT);
    
    // Process the batch concurrently
    await Promise.all(batch.map(item => processCommunication(item)));
  }

  isProcessing = false;
};
