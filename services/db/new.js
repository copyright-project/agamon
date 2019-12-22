const auth = require('../auth');

const BASE_URL = 'https://open-rights.firebaseio.com/test';

const updateDBCall = async (userId, payload) => {
  const newDBToken = await auth.getNewDBToken();
  return axios.patch(`${BASE_URL}/${userId}.json?access_token=${newDBToken}`, payload);
};

const createUser = (userId, payload) => {
  return updateDBCall(userId, payload);
};

const updateField = (userId, key, value) => {
  const payload = {
    [key]: value
  };
  return updateDBCall(userId, payload)
};

module.exports = {
  createUser,
  updateField
};
