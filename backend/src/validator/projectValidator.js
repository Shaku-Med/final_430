const { z } = require('zod');

const dateSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  'Invalid date format'
);

const statusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

const baseProjectSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters long')
    .max(100, 'Project name must not exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description must not exceed 1000 characters'),
  startDate: dateSchema,
  endDate: dateSchema,
  status: statusSchema
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

// Create a new schema for updates that makes all fields optional
const updateProjectSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters long')
    .max(100, 'Project name must not exceed 100 characters')
    .optional(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  status: statusSchema.optional()
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

exports.createProjectSchema = baseProjectSchema;
exports.updateProjectSchema = updateProjectSchema;