const {
  Client,
  LocalSigner,
  decodeHex,
  argString
} = require('orbs-client-sdk');

const {
  ORBS_NODE_URL,
  ORBS_VCHAIN_ID,
  SIGNER_PUBLIC_KEY,
  SIGNER_PRIVATE_KEY
} = process.env;


const client = new Client(
  ORBS_NODE_URL,
  ORBS_VCHAIN_ID,
  "MAIN_NET",
  new LocalSigner({
    publicKey: decodeHex(SIGNER_PUBLIC_KEY),
    privateKey: decodeHex(SIGNER_PRIVATE_KEY)
  })
);

const registerImage = async (pHash, imageURL, postedAt, copyrights, binaryHash) => {
  const [tx] = await client.createTransaction(
    'OpenRights03',
    'registerMedia',
    [
      argString(pHash),
      argString(imageURL),
      argString(postedAt),
      argString(copyrights),
      argString(binaryHash),
    ]);
  const receipt = await client.sendTransaction(tx);
  return (
    receipt.executionResult === 'SUCCESS' &&
    receipt.requestStatus === 'COMPLETED'
  );
};

module.exports = {
  registerImage
};