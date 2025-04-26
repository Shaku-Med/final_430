const { z } = require('zod');
exports.signupSchema = z.object({ email: z.string().email(), password: z.string().min(8).regex(/\d/, 'Must contain a number') });
exports.verifySchema = z.object({ email: z.string().email(), code: z.string().length(6) });
exports.loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
