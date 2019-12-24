require('dotenv').config();
const db = require('../services/db');
const orbs = require('../services/orbs');
const hash = require('../services/hash');

module.exports = async (job) => {
  const {
    ownerId,
    copyrightAttribution,
    imageUrl,
    postedAt
  } = job.data;

  const { binaryHash, pHash } = await hash.calculate(imageUrl);

  const payload = `${postedAt}|${copyrightAttribution}|${imageUrl}`;
  const isSuccess = await orbs.registerImage(binaryHash, pHash, payload);

  if (isSuccess) {
    await db.new.incrementField(ownerId, 'registeredImages');
  }

};