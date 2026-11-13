import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { googleAuthSchema } from "../src/utils/validation.js";

describe("Google Auth Mode & Schema Validation Tests", () => {
  it("devrait accepter un mode 'register' valide", () => {
    const parsed = googleAuthSchema.parse({
      credential: "valid-google-id-token-abc",
      mode: "register",
    });
    assert.equal(parsed.mode, "register");
    assert.equal(parsed.credential, "valid-google-id-token-abc");
  });

  it("devrait accepter un mode 'login' valide", () => {
    const parsed = googleAuthSchema.parse({
      credential: "valid-google-id-token-abc",
      mode: "login",
    });
    assert.equal(parsed.mode, "login");
  });

  it("devrait utiliser 'login' par défaut si mode est omis", () => {
    const parsed = googleAuthSchema.parse({
      credential: "valid-google-id-token-abc",
    });
    assert.equal(parsed.mode, "login");
  });

  it("devrait rejeter un mode invalide", () => {
    assert.throws(
      () => {
        googleAuthSchema.parse({
          credential: "valid-google-id-token-abc",
          mode: "invalid_mode_unknown",
        });
      },
      (err) => {
        return err.name === "ZodError";
      }
    );
  });

  it("devrait rejeter une requête sans credential", () => {
    assert.throws(
      () => {
        googleAuthSchema.parse({
          mode: "register",
        });
      },
      (err) => {
        return err.name === "ZodError";
      }
    );
  });
});
