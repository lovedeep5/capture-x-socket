const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const { addJob } = require("./lib/convert-video-queue");

const server = new WebSocket.Server({ port: 8080 });

const videoChunksDir = path.join(__dirname, "video_chunks");

// Ensure base directory exists
if (!fs.existsSync(videoChunksDir)) {
  fs.mkdirSync(videoChunksDir, { recursive: true });
}

server.on("connection", async (socket) => {
  console.log("Client connected");

  const clientId = `client_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 5)}`;

  const clientChunksDir = path.join(videoChunksDir, clientId);

  fs.mkdirSync(clientChunksDir, { recursive: true });

  const chunkFilePath = path.join(clientChunksDir, "video.webm");
  const writeStream = fs.createWriteStream(chunkFilePath, { flags: "a" });

  // Handle stream errors
  writeStream.on("error", (err) => {
    console.error(`WriteStream error for ${clientId}:`, err);
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

    writeStream.end(() => {
      console.log(`Finished writing video for ${clientId}`);

      // addJob({ chunkFilePath, clientChunksDir, clientId });

      // Optionally, clean up old files after some time
      setTimeout(() => {
        fs.rm(clientChunksDir, { recursive: true, force: true }, (err) => {
          if (err) console.error(`Error deleting ${clientChunksDir}:`, err);
        });
      }, 1000 * 60 * 10); // Delete after 10 minutes
    });
  });

  socket.on("error", (err) => {
    console.error(`Socket error for ${clientId}:`, err);
  });
});

console.log("WebSocket server running on ws://localhost:8080");
