const { z } = require('zod');
exports.eventSchema = z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters long')
      .max(100, 'Title must not exceed 100 characters'),
    description: z.string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional(),
    date: z.string()
      .refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
    location: z.string()
      .max(200, 'Location must not exceed 200 characters')
      .optional()
  });