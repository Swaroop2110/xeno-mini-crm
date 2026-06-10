/**
 * Calculates the churn score based on customer activity.
 * 
 * Formula (explicitly as requested):
 * score = 0.0
 * if daysSinceLastOrder > 90: score += 0.4
 * if daysSinceLastOrder > 60: score += 0.2
 * if orderCount < 2: score += 0.2
 * if totalSpend < 1000: score += 0.2
 * return min(score, 1.0)
 */
export const calculateChurnScore = (daysSinceLastOrder: number, orderCount: number, totalSpend: number): number => {
  let score = 0.0;
  if (daysSinceLastOrder > 90) score += 0.4;
  if (daysSinceLastOrder > 60) score += 0.2;
  if (orderCount < 2) score += 0.2;
  if (totalSpend < 1000) score += 0.2;
  return Math.min(score, 1.0);
};
