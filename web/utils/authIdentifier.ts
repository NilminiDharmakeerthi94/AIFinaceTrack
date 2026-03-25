/**
 * Firebase email/password auth requires an email. Plain usernames (e.g. "Mark")
 * are mapped to @{domain} so demos can sign in without typing a full address.
 */
const USERNAME_EMAIL_DOMAIN = "ledgerlite.app";

export function toAuthEmail(identifier: string): string {
  const t = identifier.trim();
  if (!t) return t;
  if (t.includes("@")) return t.toLowerCase();
  const local = t.toLowerCase().replace(/\s+/g, "");
  return `${local}@${USERNAME_EMAIL_DOMAIN}`;
}
