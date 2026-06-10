import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import { calculateChurnScore } from './churnScore';

const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateSeedData = async () => {
  await Customer.deleteMany({});
  await Order.deleteMany({});

  const cities = ['Mumbai', 'Delhi', 'Bangalore'];

  // Target distributions exactly as requested
  const spendTiers = [
    ...Array(100).fill({ tier: 'low', min: 500, max: 2000 }),
    ...Array(150).fill({ tier: 'mid', min: 2000, max: 8000 }),
    ...Array(50).fill({ tier: 'high', min: 8000, max: 25000 })
  ];

  const recencyTiers = [
    ...Array(100).fill({ minDays: 1, maxDays: 30 }),    // Active
    ...Array(120).fill({ minDays: 31, maxDays: 90 }),   // At-risk
    ...Array(60).fill({ minDays: 91, maxDays: 180 }),   // Churned
    ...Array(20).fill({ minDays: 181, maxDays: 365 })   // Inactive
  ];

  // Shuffle to randomize distributions across customers
  spendTiers.sort(() => Math.random() - 0.5);
  recencyTiers.sort(() => Math.random() - 0.5);

  const now = new Date();

  // Exactly 300 customers
  for (let i = 0; i < 300; i++) {
    const spendTarget = spendTiers[i];
    const recencyTarget = recencyTiers[i];
    
    // To ensure exactly 1500 orders, we give each of the 300 customers exactly 5 orders.
    const orderCount = 5; 
    
    const targetSpendAmount = spendTarget.min + Math.random() * (spendTarget.max - spendTarget.min);
    const avgOrderAmount = targetSpendAmount / orderCount;

    const lastOrderDaysAgo = randomInt(recencyTarget.minDays, recencyTarget.maxDays);
    
    const customer = new Customer({
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+9198${String(randomInt(10000000, 99999999))}`,
      // 55% female, 45% male
      gender: Math.random() < 0.55 ? 'female' : 'male',
      city: randomChoice(cities),
      totalSpend: 0,
      orderCount: 0,
      lastOrderDate: new Date(now.getTime() - lastOrderDaysAgo * 24 * 60 * 60 * 1000),
      churnScore: 0
    });

    await customer.save();

    let actualSpend = 0;
    
    // Create exactly 5 orders per customer
    for (let j = 0; j < orderCount; j++) {
      // Orders happen chronologically backwards from the most recent order
      const daysAgo = lastOrderDaysAgo + (j * randomInt(15, 45));
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const amount = Number((avgOrderAmount * (0.8 + Math.random() * 0.4)).toFixed(2));
      
      const order = new Order({
        customerId: customer._id,
        amount,
        items: [{ name: `Sample Item ${j + 1}`, price: amount, quantity: 1 }],
        channel: randomChoice(['online', 'in-store']),
        createdAt: orderDate
      });
      await order.save();
      actualSpend += amount;
    }

    // Update customer stats natively
    customer.totalSpend = Number(actualSpend.toFixed(2));
    customer.orderCount = orderCount;
    customer.churnScore = calculateChurnScore(lastOrderDaysAgo, orderCount, customer.totalSpend);
    await customer.save();
  }
};
