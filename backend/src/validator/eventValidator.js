const { z } = require('zod');
exports.eventSchema = z.object({ title: z.string(), description: z.string(), date: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'), location: z.string().optional() });
