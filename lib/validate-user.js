const jwt_decode = require("jwt-decode");

const validateUserBySessionCookie = async (session_token) => {
  if (!session_token) return false;
  try {
    const { sid } = jwt_decode.jwtDecode(session_token);

    if (!sid) return false;

    const request = await fetch(`https://api.clerk.com/v1/sessions/${sid}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_KEY}`,
      },
    });
    const json = await request.json();

    if (json.status !== "active") {
      return false;
    }

    return json;
  } catch (error) {
    console.error("Error: validateUser", error);
  }
};

module.exports = { validateUserBySessionCookie };
