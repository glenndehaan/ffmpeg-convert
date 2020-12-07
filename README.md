# FFMpeg Convert

A web FFMpeg converter

## Structure
- NodeJS
- Redis
- Commander
- Bull
- Bull Board
- Express
- Express WS

## Basic Usage
- Install Redis 5 or higher
- Download the latest version from the releases page on GitHub
- Save the binary in its own folder
- Run the binary `./ffmpeg-convert-xxx` (this will create some additional files)
- Start the server `./ffmpeg-convert-xxx server`
- Start the ffmpeg processor `./ffmpeg-convert-xxx process`
- Optional: Start the statistics server `./ffmpeg-convert-xxx stats`

## Development Usage
- Install NodeJS 14.0 or higher
- Install Redis 5 or higher
- Run `npm install` in the root project folder
- Run `npm start [args]` in the root project folder

## config.json Explanation
```json
{
    "redis": {
        "host": "localhost",
        "port": 6379
    },
    "job": {
        "attempts": 20,
        "backoff": 5000
    },
    "log": {
        "level": "trace"
    },
    "app": {
        "bind": "0.0.0.0",
        "port": 3100
    },
    "stats": {
        "bind": "0.0.0.0",
        "port": 3099,
        "path": "/"
    }
}
```

## Help
```
Usage: ffmpeg-convert [options] [command]

Options:
  -h, --help      display help for command

Commands:
  process         processes the ffmpeg queue
  server          launches the websocket server
  stats           show queue stats
  help [command]  display help for command
```

## License

MIT
