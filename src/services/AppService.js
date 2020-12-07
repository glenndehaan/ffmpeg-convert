/**
 * Import vendor modules
 */
const fs = require('fs');
const express = require('express');
const {v4: uuidv4} = require('uuid');

/**
 * Import own modules
 */
const config = require('../config');
const {ffmpegQueue} = require('../modules/redis');

/**
 * Check if we are using the dev version
 */
const dev = process.env.NODE_ENV !== 'production';

/**
 * Resolve base path of uploads dir
 */
const projectRoot = `${dev ? __dirname + '/../..' : process.cwd()}`;
const publicDir = `${projectRoot}/public`;
const exportDir = `${projectRoot}/public/export`;

/**
 * Check if public dir exists
 */
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
    console.log(`[DIRECTORY] Created: ${publicDir}`);
}

/**
 * Check if export dir exists
 */
if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
    console.log(`[DIRECTORY] Created: ${exportDir}`);
}

/**
 * Header to check if we are dealing with an actual PNG
 *
 * @type {string}
 */
const expectedHeader = 'data:image/png;base64,';

/**
 * Exports the App Service
 *
 * @return {Promise<void>}
 */
module.exports = async () => {
    /**
     * Create express app
     */
    const app = express();

    /**
     * Create socket
     */
    require('express-ws')(app);

    /**
     * Trust proxy
     */
    app.enable('trust proxy');

    /**
     * Disable powered by header for security reasons
     */
    app.disable('x-powered-by');

    /**
     * WS main route
     */
    app.ws('/', (ws) => {
        /**
         * Create globals
         */
        ws.id = uuidv4();
        ws.videoId = `video_${uuidv4()}`;
        ws.videoDir = `${exportDir}/${ws.videoId}`;
        ws.frameNum = 0;
        ws.videoWidth = 0;
        ws.videoHeight = 0;
        ws.videoFps = 0;

        /**
         * Main message bus
         */
        ws.on('message', async (data) => {
            const dataString = JSON.parse(data);

            if (typeof dataString.instruction === "undefined" || dataString.instruction === "") {
                global.log.error(`[SOCKET][${ws.id}] No instruction received from socket`);
                return;
            }

            /**
             * Handle start event from client
             */
            if (dataString.instruction === 'start' && typeof dataString.data !== 'undefined') {
                global.log.info(`[SOCKET][START][${ws.id}] Received start...`);
                global.log.info(`[SOCKET][START][${ws.id}] Video data received: (@todo)`);

                // Set video vars
                ws.videoWidth = dataString.data.width;
                ws.videoHeight = dataString.data.height;
                ws.videoFps = dataString.data.fps;

                if (!fs.existsSync(ws.videoDir)) {
                    fs.mkdirSync(ws.videoDir);
                    global.log.info(`[SOCKET][START][DIRECTORY][${ws.id}] Video export directory created: ${ws.videoDir}`);
                }
            }

            /**
             * Process frame
             */
            if (dataString.instruction === 'frame' && typeof dataString.data !== 'undefined') {
                const dataUrl = dataString.data.dataURL;

                if (ws.frameNum > 0) {
                    fs.writeFile(`${ws.videoDir}/${ws.frameNum}.png`, dataUrl.substr(expectedHeader.length), 'base64', err => {
                        if (!err) {
                            global.log.info(`[SOCKET][FRAME][${ws.id}] Received frame ${ws.frameNum}`);

                            try {
                                ws.send(JSON.stringify({instruction: 'frame', data: {frameNum: ws.frameNum, complete: true}}));
                            } catch (e) {
                                global.log.error(`[SOCKET][FRAME][${ws.id}] Error: ${e}`);
                            }

                            ws.frameNum += 1;
                        }
                    });
                } else {
                    ws.frameNum += 1;

                    try {
                        ws.send(JSON.stringify({instruction: 'frame', data: {frameNum: ws.frameNum, complete: true}}));
                    } catch (e) {
                        global.log.error(`[SOCKET][FRAME][${ws.id}] Error: ${e}`);
                    }
                }
            }

            /**
             * Start encoding the actual video
             */
            if (dataString.instruction === 'end') {
                global.log.info(`[SOCKET][END][${ws.id}] Received end...`);

                // Add video to the queue
                const redisResult = await ffmpegQueue.add({
                    id: ws.id,
                    videoId: ws.videoId,
                    videoDir: ws.videoDir,
                    width: ws.videoWidth,
                    height: ws.videoHeight,
                    fps: ws.videoFps
                }).catch((e) => {
                    global.log.error(`[SOCKET][END][${ws.id}][REDIS] ${e}`);
                });

                // Check if redis added the video to the queue
                if(typeof redisResult !== "undefined") {
                    global.log.info(`[SOCKET][END][${ws.id}] Added to queue! ID: ${redisResult.id}`);
                }
            }
        });
    });

    /**
     * Start listening on port
     */
    app.listen(config.app.port, config.app.bind, () => {
        global.log.info(`[NODE] App is running on: ${config.app.bind}:${config.app.port}`);
    });
};
