const { z } = require('zod');
exports.commentSchema = z.object({ content: z.string().min(1) });