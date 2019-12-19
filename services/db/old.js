const auth = require('../auth');

const BASE_URL = 'https://instagram-media-rights.firebaseio.com/test';

const getAllUsers = async () => {
  const tokenToOldDB = await auth.getOldDBToken();
  const { data } = await axios.get(`${BASE_URL}.json?access_token=${tokenToOldDB}`);
  return data;
}

module.exports = {
  getAllUsers
};
