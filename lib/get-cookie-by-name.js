const getCookieValue = (cookieName, cookies) => {
  if (!cookies) return null;

  const cookieArray = cookies.split(";");
  for (const cookie of cookieArray) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName) {
      return value;
    }
  }
  return null;
};

module.exports = { getCookieValue };
