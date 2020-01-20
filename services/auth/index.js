const { google } = require('googleapis');
const oldDBServiceAccount = require('./old-db-admin-key.json');
const newDBServiceAccount = require('./new-db-admin-key.json');

// Define the required scopes.
const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/firebase.database"
];

let oldTokenCache, newTokenCache;

// Authenticate a JWT client with the service account.
const oldJWTClient = new google.auth.JWT(
  oldDBServiceAccount.client_email,
  null,
  oldDBServiceAccount.private_key,
  scopes
);

const newJWTClient = new google.auth.JWT(
  newDBServiceAccount.client_email,
  null,
  newDBServiceAccount.private_key,
  scopes
);

const getOldDBToken = async () => {
  if (oldTokenCache !== undefined) {
    return Promise.resolve(oldTokenCache);
  }
  return new Promise((resolve, reject) => {
    oldJWTClient.authorize((error, tokens) => {
      if (error) {
        console.log("Error making request to generate access token:", error);
        reject(error);
      } else if (tokens.access_token === null) {
        console.log("Provided service account does not have permission to generate access tokens");
        reject("Provided service account does not have permission to generate access tokens");
      } else {
        oldTokenCache = tokens.access_token;
        resolve(tokens.access_token);
      }
    });
  })
};

const getNewDBToken = async () => {
  if (newTokenCache !== undefined) {
    return Promise.resolve(newTokenCache);
  }
  return new Promise((resolve, reject) => {
    newJWTClient.authorize((error, tokens) => {
      if (error) {
        console.log("Error making request to generate access token:", error);
        reject(error);
      } else if (tokens.access_token === null) {
        console.log("Provided service account does not have permission to generate access tokens");
        reject("Provided service account does not have permission to generate access tokens");
      } else {
        newTokenCache = tokens.access_token;
        resolve(tokens.access_token);
      }
    });
  })
};



module.exports = {
  getOldDBToken,
  getNewDBToken
};