const path = require("path");
const fs = require("fs");
const { Upload } = require("@aws-sdk/lib-storage");
const { BUCKET, S3 } = require("../lib/aws-bucket");
require("dotenv").config();

const { AWS_MASTER_PATH, VIDEO_CHUNKS_PATH } = require("../constants");

const uploadDirAws = async (userPath) => {
  const mainFolderPath = path.join(VIDEO_CHUNKS_PATH, userPath);
  const hlsFolderPath = path.join(mainFolderPath, "hls");

  const allFiles = getAllFiles(mainFolderPath); // Get all files recursively

  const uploadPromises = allFiles.map(async (filePath) => {
    const relativePath = path.relative(mainFolderPath, filePath); // Maintain directory structure
    const fileStream = fs.createReadStream(filePath);
    const key = `${AWS_MASTER_PATH}/${userPath}/${relativePath}`;

    try {
      const upload = new Upload({
        client: S3,
        params: {
          Bucket: BUCKET,
          Key: key,
          Body: fileStream,
          ContentType: getContentType(filePath),
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

// Helper function to get all files recursively
function getAllFiles(folderPath) {
  let filesList = [];

  if (!fs.existsSync(folderPath)) return filesList;

  const items = fs.readdirSync(folderPath);

  items.forEach((item) => {
    const fullPath = path.join(folderPath, item);
    if (fs.statSync(fullPath).isDirectory()) {
      filesList = filesList.concat(getAllFiles(fullPath)); // Recursive call for subdirectories
    } else {
      filesList.push(fullPath);
    }
  });

  return filesList;
}

// Determine correct content type for S3
function getContentType(fileName) {
  if (fileName.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  if (fileName.endsWith(".ts")) return "video/mp2t";
  return "application/octet-stream";
}

module.exports = uploadDirAws;
