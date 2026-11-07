import {rateLimit} from 'express-rate-limit'

const authLimiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication requests. Please try again later."
    }
});

const loginLimiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }
})

export {authLimiter, loginLimiter}