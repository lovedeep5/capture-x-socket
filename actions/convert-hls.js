const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

async function convertToHLS(inputFilePath, outputDir) {
  const hlsOutputDir = path.join(outputDir, "hls");

  if (!fs.existsSync(hlsOutputDir)) {
    fs.mkdirSync(hlsOutputDir, { recursive: true });
  }

  const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename "${hlsOutputDir}/segment_%03d.ts" "${hlsOutputDir}/playlist.m3u8"`;

  return new Promise((resolve, reject) => {
    exec(ffmpegCommand, (err) => {
      if (err) {
        reject(new Error(`Error during FFmpeg process: ${err.message}`));
        return;
      }

      console.log(
        `Successfully converted video to HLS format. Output saved to ${hlsOutputDir}`
      );
      resolve(hlsOutputDir);
    });
  });
}

module.exports = convertToHLS;
