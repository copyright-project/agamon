const axios = require('axios');
const Queue = require('bull');
const auth = require('./services/auth');

const usersQueue = new Queue('users');

(async function () {
  const tokenToOldDB = await auth.getOldDBToken();
  const { data } = await axios.get(`https://instagram-media-rights.firebaseio.com/users.json?access_token=${tokenToOldDB}`);
  Object.keys(data).forEach(key => {
    usersQueue.add({
      userId: key,
      accessToken: data[key]['accessToken'],
      copyrightAttribution: data[key]['copyrightAttribution']
    })
  });
})();