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

const incrementField = async (userId, key) => {
  const newDBToken = await auth.getNewDBToken();
  const url = `${BASE_URL}/${userId}/${key}.json?access_token=${newDBToken}`;
  const { data } = await axios.get(url);
  const updatedCounter = parseInt(data[key], 10) + 1;
  const { status } = await axios.put(url, updatedCounter);
  return status === 200;
};

module.exports = {
  createUser,
  updateField,
  incrementField
};
