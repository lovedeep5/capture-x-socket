const fs = require("fs");
const { Queue, Worker } = require("bullmq");
const convertToHLS = require("../actions/convert-hls.js");
const { connection } = require("../config/redis");
const uploadDirAws = require("../actions/upload-dir-aws.js");

const convertVideoQueue = new Queue("convert video", connection);

const addJob = async (jobData) => {
  await convertVideoQueue.add("convert video", jobData);
};

const worker = new Worker(
  "convert video",
  async (job) => {
    try {
      console.log("Processing video to hsl...", job.id);
      const { chunkFilePath, clientChunksDir } = job.data;
      return await convertToHLS(chunkFilePath, clientChunksDir);
    } catch (error) {
      console.error("Error: Processing video to hsl...", error);
    }
  },
  connection
);

worker.on("completed", async (job) => {
  console.log("Job completed", job.id, job.data.clientId);

  await uploadDirAws(job.data.clientId);
  fs.rmSync(job.data.clientChunksDir, { recursive: true });
});

worker.on("drained", () => {
  console.log("All jobs have been processed, queue is empty.");
});

module.exports = { addJob };
