/**
 * Import base packages
 */
const deepmerge = require('deepmerge');

/**
 * Define the base config
 */
const baseConfig = {
    redis: {
        host: "localhost",
        port: 6379
    },
    job: {
        attempts: 20,
        backoff: 5000
    },
    log: {
        level: "trace"
    },
    app: {
        bind: "0.0.0.0",
        port: 3100
    },
    stats: {
        bind: "0.0.0.0",
        port: 3099,
        path: "/"
    }
};

/**
 * Check if we are using the dev version
 */
const dev = process.env.NODE_ENV !== 'production';

/**
 * Returns the correct config
 */
try {
    module.exports = deepmerge(baseConfig, eval('require')(dev ? __dirname + '/config.json' : process.cwd() + '/config.json'));
} catch (e) {
    console.error(`[CONFIG] Missing! Location: ${dev ? `${__dirname}/config.json` : `${process.cwd()}/config.json`}`);
    process.exit(1);
}
