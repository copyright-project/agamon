const axios = require('axios');

// const HASH_SERVICE_BASE_URL = 'https://image-hash.herokuapp.com';
const HASH_SERVICE_BASE_URL = 'http://localhost:5000';

const calculate = async url => {
  const { data } = await axios.post(`${HASH_SERVICE_BASE_URL}/hash`, {
    url
  });
  return data;
};

module.exports = {
  calculate
};
