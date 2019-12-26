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

const registerImage = async (binaryHash, pHash, payload) => {
  const [tx] = await client.createTransaction(
    'OpenRights01',
    'registerMedia',
    [
      argString(binaryHash),
      argString(pHash),
      argString(payload)
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