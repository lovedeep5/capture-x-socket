const path = require("path");
const AWS_MASTER_PATH = "videos/hsl";
const VIDEO_CHUNKS_PATH = path.join(__dirname, "video_chunks");

module.exports = { AWS_MASTER_PATH, VIDEO_CHUNKS_PATH };
