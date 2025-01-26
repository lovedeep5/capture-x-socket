const path = require("path");
const fs = require("fs");
const { Upload } = require("@aws-sdk/lib-storage");
const { BUCKET, S3 } = require("../lib/aws-bucket");
require("dotenv").config();

const { AWS_MASTER_PATH, VIDEO_CHUNKS_PATH } = require("../constants");

const uploadDirAws = async (userPath) => {
  const folderPath = path.join(VIDEO_CHUNKS_PATH, userPath, "hls");
  const files = fs.readdirSync(folderPath);

  const uploadPromises = files.map(async (file) => {
    const filePath = path.join(folderPath, file);
    const fileStream = fs.createReadStream(filePath);
    const key = `${AWS_MASTER_PATH}/${userPath}/${file}`; // Ensure proper S3 key formatting

    try {
      const upload = new Upload({
        client: S3,
        params: {
          Bucket: BUCKET,
          Key: key,
          Body: fileStream,
          ContentType: getContentType(file), // Set correct MIME type
        },
      });

      await upload.done();
      console.log(`✅ Uploaded: ${key}`);
    } catch (error) {
      console.error(`❌ Upload failed for ${key}:`, error);
    }
  });

  await Promise.all(uploadPromises);
  console.log("🎉 All files uploaded successfully!");
};

function getContentType(fileName) {
  if (fileName.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  if (fileName.endsWith(".ts")) return "video/mp2t";
  return "application/octet-stream";
}

module.exports = uploadDirAws;
