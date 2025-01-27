const { getCookieValue } = require("../lib/get-cookie-by-name");
const { validateUserBySessionCookie } = require("../lib/validate-user");
const isAuth = async (cookies) => {
  const session_token = await getCookieValue("__session", cookies);
  const user_session = await validateUserBySessionCookie(session_token);
  return user_session;
};
module.exports = { isAuth };
