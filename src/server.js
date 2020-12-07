/**
 * Import vendor packages
 */
const fs = require('fs');
const program = require('commander');

/**
 * Import own packages
 */
const config = require('./config');
const statsService = require('./services/StatsService');
const appService = require('./services/AppService');
const ffmpegService = require('./services/FfmpegService');

/**
 * Define global variables
 */
let subcommand = false;
const dev = process.env.NODE_ENV !== 'production';

/**
 * Catch unhandled promise rejections
 */
process.on('unhandledRejection', reason => {
    global.log.error(reason);
});

/**
 * Check if log dir exists
 */
if (!fs.existsSync(dev ? `${__dirname}/log` : `${process.cwd()}/log`)) {
    fs.mkdirSync(dev ? `${__dirname}/log` : `${process.cwd()}/log`);
    console.log(`[DIRECTORY] Created: ${dev ? `${__dirname}/log` : `${process.cwd()}/log`}`);
}

/**
 * Setup the logger with splitted logs
 *
 * @param name
 */
const initLogger = (name) => {
    /**
     * Init logger and set log level
     */
    global.log = require('simple-node-logger').createSimpleLogger({
        logFilePath: dev ? `${__dirname}/log/ffmpeg-convert.${name}.log` : `${process.cwd()}/log/ffmpeg-convert.${name}.log`,
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
    });

    global.log.setLevel(config.log.level);

    global.log.info(`[NODE][${name}] Service started!`);
}

/**
 * Set application name
 */
program.name('ffmpeg-convert');

/**
 * Setup application commands
 */
program
    .command('process')
    .description('processes the ffmpeg queue')
    .action(() => {
        subcommand = true;
        initLogger('process');
        ffmpegService();
    });

program
    .command('server')
    .description('launches the websocket server')
    .action(async () => {
        subcommand = true;
        initLogger('server');
        appService();
    });

program
    .command('stats')
    .description('show queue stats')
    .action(async () => {
        subcommand = true;
        initLogger('stats');
        statsService();
    });

/**
 * Let commander handle process arguments
 */
program.parse(process.argv);

/**
 * Run help when no command is given
 */
if (!subcommand) {
    program.outputHelp();
}
