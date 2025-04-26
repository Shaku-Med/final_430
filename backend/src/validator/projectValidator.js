const { z } = require( 'zod');
exports.createProjectSchema = z.object({ name: z.string(), description: z.string(), startDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'), endDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'), status: z.string() });
exports.updateProjectSchema = exports.createProjectSchema;