/**
 * Import vendor modules
 */
const {exec} = require('child_process');
const rimraf = require('rimraf');

/**
 * Import own modules
 */
const {ffmpegQueue} = require('../modules/redis');

/**
 * Check if we are using the dev version
 */
const dev = process.env.NODE_ENV !== 'production';

/**
 * Resolve base path of uploads dir
 */
const projectRoot = `${dev ? __dirname + '/../..' : process.cwd()}`;
const exportDir = `${projectRoot}/public/export`;

/**
 * Exports the FFMpeg Service
 */
module.exports = () => {
    ffmpegQueue.process((job, done) => {
        // Start the job
        global.log.info(`[FFMPEG][REDIS][MESSAGE] Processing: ${job.id}`);
        job.progress(50);

        // Set variables
        const videoId = job.data.videoId;
        const videoDir = job.data.videoDir;
        const width = job.data.width;
        const height = job.data.height;
        const fps = job.data.fps;

        // Process video
        exec(`ffmpeg -r ${fps} -f image2 -s ${width}x${height} -i '${videoDir}/%01d.png' -vcodec libx264 -crf 1 -pix_fmt yuv420p '${exportDir}/${videoId}.mp4'`, async (error) => {
            if (error === null) {
                rimraf(videoDir, () => {
                    global.log.info(`[FFMPEG][REDIS][DIR][${job.id}] Removed source dir: ${videoDir}`);
                });

                global.log.info(`[FFMPEG][REDIS][${job.id}] Finished conversion!`);
                await job.progress(100);
                done(null, "Done!");
            } else {
                global.log.error(`[FFMPEG][REDIS][${job.id}] Conversion failed: ${error}`);
                await job.progress(75);
                done(error);
            }
        });
    });
};
