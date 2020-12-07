/**
 * Import vendor modules
 */
const express = require('express');
const {setQueues, BullAdapter, router} = require('bull-board');

/**
 * Import own modules
 */
const config = require('../config');
const {ffmpegQueue} = require('../modules/redis');

/**
 * Exports the Stats Service
 *
 * @return {Promise<void>}
 */
module.exports = async () => {
    /**
     * Set available queue's for bull-board
     */
    setQueues([new BullAdapter(ffmpegQueue)]);

    /**
     * Create express app
     */
    const app = express();

    /**
     * Trust proxy
     */
    app.enable('trust proxy');

    /**
     * Expose the bull-board stats
     */
    app.use(config.stats.path, router);

    /**
     * Disable powered by header for security reasons
     */
    app.disable('x-powered-by');

    /**
     * Start listening on port
     */
    app.listen(config.stats.port, config.stats.bind, () => {
        global.log.info(`[NODE] Stats are running on: ${config.stats.bind}:${config.stats.port}`);
    });
};
