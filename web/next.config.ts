import type { NextConfig } from "next";

const FIREBASE_PUBLIC_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

/** Fails `next build` early when config would ship empty (avoids a broken Hosting deploy). */
function assertFirebasePublicEnvForProductionBuild() {
  if (process.env.NODE_ENV !== "production") return;
  const missing = FIREBASE_PUBLIC_KEYS.filter((k) => !process.env[k]?.trim());
  if (missing.length === 0) return;
  throw new Error(
    `Missing Firebase web env at build time: ${missing.join(", ")}. ` +
      "Copy web/.env.example to web/.env.local and fill values from Firebase Console → Project settings → Your apps. " +
      "For GitHub Actions deploys, add the same names as repository secrets (NEXT_PUBLIC_FIREBASE_*)."
  );
}

assertFirebasePublicEnvForProductionBuild();

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
