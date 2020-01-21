const axios = require('axios');
const auth = require('../auth');

const BASE_URL = 'https://open-rights.firebaseio.com/users';

const updateDBCall = async (userId, payload) => {
  try {
    const newDBToken = await auth.getNewDBToken();
    return axios.patch(`${BASE_URL}/${userId}.json?access_token=${newDBToken}`, payload);
  } catch (error) {
    console.log(error);
  }
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

const updateFields = (userId, payload) => updateDBCall(userId, payload);

module.exports = {
  createUser,
  updateField,
  updateFields
};
