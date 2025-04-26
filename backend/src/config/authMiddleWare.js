const supabase = require('../config/supabase');

// Middleware to check authentication
const authenticateUser = async (req, res, next) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized - Please log in' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};

// Rate limiting configuration
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many attempts, please try again later'
});
module.exports = { authenticateUser, authLimiter };
