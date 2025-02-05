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
      console.log("Uploading video to AWS...", job.id);

      await uploadDirAws(job.data.clientId);
      fs.rmSync(job.data.clientChunksDir, { recursive: true });
    } catch (error) {
      console.error("Error: Uploading video to AWS...", error);
    }
  },
  connection
);

worker.on("completed", async (job) => {
  console.log(
    "Job completed : File uploaded to AWS",
    job.id,
    job.data.clientId
  );
});

worker.on("drained", () => {
  console.log("All jobs have been processed, queue is empty.");
});

module.exports = { addJob };
