import { FirebaseError } from "firebase/app";
import { firebaseAuthUserMessage } from "./firebaseAuthUserMessage";

describe("firebaseAuthUserMessage", () => {
  it("explains invalid API key instead of raw SDK text", () => {
    const err = new FirebaseError(
      "auth/api-key-not-valid",
      "Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)."
    );
    const msg = firebaseAuthUserMessage(err, "fallback");
    expect(msg).toContain("API key");
    expect(msg).not.toMatch(/please-pass-a-valid-api-key/i);
  });

  it("uses fallback for unknown errors", () => {
    expect(firebaseAuthUserMessage(null, "fallback")).toBe("fallback");
  });
});
