const { MongoClient } = require("mongodb");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

const connectDB = async () => {
  const client = new MongoClient(connectionString);
  try {
    const database = client.db("Cluster0");
    const recordings = database.collection("Recordings");

    return recordings;
  } catch (err) {
    console.error("Error: ", err);
  }
};

module.exports = { connectDB };
