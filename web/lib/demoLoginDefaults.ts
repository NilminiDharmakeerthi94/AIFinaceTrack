/**
 * Pre-fills login/signup in development only. Production builds use empty fields.
 * Demo Auth user: username `Mark` → mark@ledgerlite.app (see utils/authIdentifier.ts).
 * Create/update that user with: `cd functions && npm run seed:demo-user` (requires SEED_DEMO_PASSWORD).
 */
export function demoLoginDefaults(): { identifier: string; password: string } {
  if (process.env.NODE_ENV !== "development") {
    return { identifier: "", password: "" };
  }
  return { identifier: "Mark", password: "Test@123456" };
}
