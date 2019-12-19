const auth = require('../auth');

const BASE_URL = 'https://open-rights.firebaseio.com/test';

const createUser = async (userId, payload) => {
  const newDBToken = await auth.getNewDBToken();
  return axios.patch(`${BASE_URL}/${userId}.json?access_token=${newDBToken}`, payload);
};

module.exports = {
  createUser
};
