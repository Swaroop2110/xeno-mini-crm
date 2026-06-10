export interface ParsedFilters {
  lastOrderDaysBefore?: number | null;
  lastOrderDaysAfter?: number | null;
  minTotalSpend?: number | null;
  maxTotalSpend?: number | null;
  minOrderCount?: number | null;
  city?: string | null;
  minChurnScore?: number | null;
}

/**
 * Translates the structured JSON parsed by Gemini into a native MongoDB query object.
 */
export const buildMongoQuery = (filters: ParsedFilters): Record<string, any> => {
  const query: Record<string, any> = {};
  const now = new Date();

  // Date Math for lastOrderDate
  // "Before X days ago" means the date must be older than (now - X days)
  // "After X days ago" means the date must be more recent than (now - X days)
  if (filters.lastOrderDaysBefore != null || filters.lastOrderDaysAfter != null) {
    query.lastOrderDate = {};
    
    if (filters.lastOrderDaysBefore != null) {
      const beforeDate = new Date(now.getTime() - filters.lastOrderDaysBefore * 24 * 60 * 60 * 1000);
      query.lastOrderDate.$lt = beforeDate; // Older than X days
    }
    
    if (filters.lastOrderDaysAfter != null) {
      const afterDate = new Date(now.getTime() - filters.lastOrderDaysAfter * 24 * 60 * 60 * 1000);
      query.lastOrderDate.$gt = afterDate; // More recent than X days
    }
  }

  // Spend
  if (filters.minTotalSpend != null || filters.maxTotalSpend != null) {
    query.totalSpend = {};
    if (filters.minTotalSpend != null) query.totalSpend.$gte = filters.minTotalSpend;
    if (filters.maxTotalSpend != null) query.totalSpend.$lte = filters.maxTotalSpend;
  }

  // Order Count
  if (filters.minOrderCount != null) {
    query.orderCount = { $gte: filters.minOrderCount };
  }

  // City (case-insensitive exact match)
  if (filters.city) {
    query.city = { $regex: new RegExp(`^${filters.city}$`, 'i') };
  }

  // Churn Score
  if (filters.minChurnScore != null) {
    query.churnScore = { $gte: filters.minChurnScore };
  }

  return query;
};
