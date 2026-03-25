/**
 * Creates or updates the demo Auth user that matches username "Mark" in the web app
 * (see web/utils/authIdentifier.ts → mark@ledgerlite.app).
 *
 * Prerequisites:
 *   - Firebase project selected: `firebase use <alias>` from repo root, or set GCLOUD_PROJECT
 *   - Credentials: set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON
 *     (Console → Project settings → Service accounts → Generate new private key)
 *
 * Usage (PowerShell):
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json"
 *   $env:SEED_DEMO_PASSWORD="Test@123456"
 *   npm run seed:demo-user
 *
 * Usage (bash):
 *   export GOOGLE_APPLICATION_CREDENTIALS=.../serviceAccount.json
 *   SEED_DEMO_PASSWORD='Test@123456' npm run seed:demo-user
 */

const admin = require("firebase-admin");

const DEMO_EMAIL = "mark@ledgerlite.app";
const DEMO_DISPLAY_NAME = "Mark";

const password =
  typeof process.env.SEED_DEMO_PASSWORD === "string" && process.env.SEED_DEMO_PASSWORD.length >= 8
    ? process.env.SEED_DEMO_PASSWORD
    : null;

if (!password) {
  console.error(
    "Set SEED_DEMO_PASSWORD to the demo password (min 8 chars), e.g. Test@123456 for user Mark."
  );
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp();
}

async function main() {
  try {
    const user = await admin.auth().createUser({
      email: DEMO_EMAIL,
      password,
      displayName: DEMO_DISPLAY_NAME,
      emailVerified: true,
    });
    console.log("Created demo user:", user.uid, DEMO_EMAIL);
  } catch (e) {
    if (e && e.code === "auth/email-already-exists") {
      const existing = await admin.auth().getUserByEmail(DEMO_EMAIL);
      await admin.auth().updateUser(existing.uid, {
        password,
        displayName: DEMO_DISPLAY_NAME,
        emailVerified: true,
      });
      console.log("Updated existing user password:", existing.uid, DEMO_EMAIL);
      return;
    }
    throw e;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
