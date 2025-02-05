const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

const { addJob } = require("./lib/convert-video-queue");
const { removeDir } = require("./lib/remove-dir");
const { insertRecording } = require("./actions/recordings");
const { AWS_MASTER_PATH } = require("./constants");
const { isAuth } = require("./lib/auth");
const { getClientId } = require("./lib/client-id");

const server = new WebSocket.Server({ port: process.env.PORT || 8080 });
const videoChunksDir = path.join(__dirname, "video_chunks");

if (!fs.existsSync(videoChunksDir)) {
  fs.mkdirSync(videoChunksDir, { recursive: true });
}

server.on("connection", async (socket, req) => {
  console.log("socket client connected");
  const auth = await isAuth(req.headers.cookie);

  if (!auth) {
    socket.send("Unauthorised user!");
    socket.close(1000, "Unauthorised user!");
  }

  const clientId = getClientId(auth?.user_id);

  const clientChunksDir = path.join(videoChunksDir, clientId);
  const chunkFilePath = path.join(clientChunksDir, "video.webm");

  const writeStream = fs.createWriteStream(chunkFilePath, { flags: "a" });
  fs.mkdirSync(clientChunksDir, { recursive: true });

  writeStream.on("error", (err) => {
    socket.send(JSON.stringify({ error: "File write error" }));
    socket.close();
  });

  socket.on("message", async (message) => {
    console.log(`Received video chunk from ${clientId}`);
    const buffer = Buffer.from(message);

    if (!writeStream.writable) {
      console.error(`Write stream already closed for ${clientId}`);
      return;
    }

    writeStream.write(buffer, (err) => {
      if (err) {
        console.error(`Error writing chunk for ${clientId}:`, err);
      }
    });
  });

  socket.on("close", () => {
    console.log(`Client ${clientId} disconnected`);

    writeStream.end(async () => {
      addJob({ chunkFilePath, clientChunksDir, clientId, user: auth });
      const key = `${AWS_MASTER_PATH}/${clientId}/video.webm`;
      await insertRecording(auth?.user_id, key, clientId);

      setTimeout(() => {
        removeDir(clientChunksDir);
      }, 1000 * 60 * 10); // Delete after 10 minutes
    });
  });

  socket.on("error", (err) => {
    console.error(`Socket error for ${clientId}:`, err);
  });
});

console.log("WebSocket server running on ws://localhost:8080");
