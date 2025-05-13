const { z } = require('zod');
exports.updateProfileSchema = z.object({ username: z.string().optional(), full_name: z.string().optional(), avatar_url: z.string().url().optional(), is_admin: z.boolean().optional() });
