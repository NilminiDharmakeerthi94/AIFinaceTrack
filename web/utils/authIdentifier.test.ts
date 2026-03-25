import { toAuthEmail } from "./authIdentifier";

describe("toAuthEmail", () => {
  it("maps username to synthetic email", () => {
    expect(toAuthEmail("Mark")).toBe("mark@ledgerlite.app");
    expect(toAuthEmail("  Jane  ")).toBe("jane@ledgerlite.app");
  });

  it("passes through real emails lowercased", () => {
    expect(toAuthEmail("User@Example.COM")).toBe("user@example.com");
  });
});
