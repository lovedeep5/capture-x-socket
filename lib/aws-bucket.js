const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const BUCKET = process.env.AWS_S3_BUCKET;
const S3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

module.exports = { BUCKET, S3 };
