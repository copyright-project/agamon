const db = require('./services/db');

(async function () {
  const registeredImagesMap = await db.local.getRegisteredImagesForAllUsers();
  const amount = Object.keys(registeredImagesMap).length;
  let index = 1;
  for (let [key, value] of Object.entries(registeredImagesMap)) {
    const { data } = await db.new.updateFields(key, { registeredImagesCount: value, isSyncedBack: true });
    console.log(`${index++} of ${amount}`, key);
    console.log(data);
  }
})()