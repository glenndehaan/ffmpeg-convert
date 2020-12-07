/**
 * Import vendor modules
 */
const Bull = require("bull");

/**
 * Import own modules
 */
const config = require('../config');

/**
 * Create all redis queue's
 */
const ffmpegQueue = new Bull('ffmpeg', {
    redis: config.redis,
    defaultJobOptions: config.job,
    limiter: {
        max: 100,
        duration: 10000
    }
});

/**
 * Export the Redis connector
 */
module.exports = {
    ffmpegQueue
};
