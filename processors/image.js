require('dotenv').config();
const db = require('../services/db');
const orbs = require('../services/orbs');
const hash = require('../services/hash');

module.exports = async (job) => {
  const {
    ownerId,
    copyrightAttribution,
    imageUrl,
    postedAt,
    postId
  } = job.data;

  const { binaryHash, pHash } = await hash.calculate(imageUrl);

  const payload = `${postId}|${postedAt}|${copyrightAttribution}|${imageUrl}`;
  const isSuccess = await orbs.registerImage(binaryHash, pHash, payload);

  if (isSuccess) {
    await db.local.updateRegisteredImagesForUser(ownerId);
  }

  return binaryHash;
};