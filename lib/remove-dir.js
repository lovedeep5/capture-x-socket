const fs = require("fs");

const removeDir = (dir) => {
  fs.rm(dir, { recursive: true, force: true }, (err) => {
    if (err) console.error(`Error deleting ${clientChunksDir}:`, err);
  });
};

module.exports = {
  removeDir,
};
