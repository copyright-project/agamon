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

  const isSuccess = await orbs.registerImage(
    pHash,
    imageUrl,
    postedAt,
    copyrightAttribution,
    binaryHash
  );

  if (isSuccess) {
    await db.local.updateRegisteredImagesForUser(ownerId);
  }

  return binaryHash;
};