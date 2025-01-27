const { v4 } = require("uuid");
const { connectDB } = require("../lib/db");

const insertRecording = async (userId, key, title) => {
  if (!userId && !key && !title) return false;
  try {
    const recordings_db = await connectDB();
    if (recordings_db) {
      const recording = await recordings_db.insertOne({
        userId,
        s3_key: key,
        uuid: v4(),
        title,
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return recording;
    }
  } catch (err) {
    console.log("Error: ", err);
  }
};

module.exports = { insertRecording };
