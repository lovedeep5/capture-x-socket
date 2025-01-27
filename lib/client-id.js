const getClientId = (userId) => {
  return `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
};

module.exports = { getClientId };
