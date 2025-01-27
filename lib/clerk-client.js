require("dotenv").config();

const { createClerkClient } = require("@clerk/backend");
const clerk = createClerkClient({ secretKey: process.env.CLERK_KEY });
