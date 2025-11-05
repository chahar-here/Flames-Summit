// setAdmin.js
// Make sure you have your firebase-admin.ts setup
// For a simple script, you can just initialize it here.

const admin = require("firebase-admin");

// !! IMPORTANT !!
// Get this from your Firebase Project Settings > Service accounts
const serviceAccount = require("/Users/utkarshchahar/Downloads/Flamess/flamess-e6675-firebase-adminsdk-fbsvc-6e7dba1ac4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// --- SET YOUR ADMIN UID HERE ---
const uidToMakeAdmin = "PJhwrj7X6ARfTtY1pmb088vKqMn1"; 
// Replace with the UID of the user you want to make admin
// ---------------------------------

admin
  .auth()
  .setCustomUserClaims(uidToMakeAdmin, { admin: true }) // The "admin badge"
  .then(() => {
    console.log(`Success! ${uidToMakeAdmin} is now an admin.`);
    process.exit();
  })
  .catch((error) => {
    console.error("Error setting custom claim:", error);
    process.exit(1);
  });