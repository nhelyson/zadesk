import { verifyTurnstileToken } from "../src/services/turnstileService.js";
import { cacheService } from "../src/cache/cacheService.js";
import { env } from "../src/config/env.js";

async function runTests() {
  console.log("=== STARTING CLOUDFLARE TURNSTILE AUTOMATED SECURITY TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // Test 1: Missing Token Rejection
  try {
    const res = await verifyTurnstileToken({ token: "" });
    assert(res.success === false && res.code === "MISSING_TOKEN", "1. Rejects missing empty token");
  } catch (e) {
    assert(false, `1. Missing token test error: ${e.message}`);
  }

  // Test 2: Whitespace Token Rejection
  try {
    const res = await verifyTurnstileToken({ token: "   " });
    assert(res.success === false && res.code === "MISSING_TOKEN", "2. Rejects whitespace-only token");
  } catch (e) {
    assert(false, `2. Whitespace token test error: ${e.message}`);
  }

  // Test 3: Null/Undefined Token Rejection
  try {
    const res = await verifyTurnstileToken({ token: null });
    assert(res.success === false && res.code === "MISSING_TOKEN", "3. Rejects null/undefined token");
  } catch (e) {
    assert(false, `3. Null token test error: ${e.message}`);
  }

  // Test 4: Invalid Dummy Token Rejection via Cloudflare API
  try {
    const res = await verifyTurnstileToken({ token: "invalid_dummy_token_123456" });
    assert(res.success === false, "4. Rejects invalid token from Cloudflare siteverify");
  } catch (e) {
    assert(false, `4. Invalid token test error: ${e.message}`);
  }

  // Test 5: Anti-Replay Protection
  try {
    const dummyToken = "dummy_test_token_for_replay_test_" + Date.now();
    // Simulate consumed token in cache
    const crypto = await import("crypto");
    const tokenHash = crypto.createHash("sha256").update(dummyToken).digest("hex");
    await cacheService.set(`turnstile:used:${tokenHash}`, { verifiedAt: Date.now() }, 60);

    const replayRes = await verifyTurnstileToken({ token: dummyToken });
    assert(replayRes.success === false && replayRes.code === "TOKEN_ALREADY_USED", "5. Rejects replayed/consumed token");
  } catch (e) {
    assert(false, `5. Anti-replay test error: ${e.message}`);
  }

  // Test 6: Secret Key Sanitization in Errors
  try {
    const res = await verifyTurnstileToken({ token: "fake_token_to_check_leak" });
    const jsonStr = JSON.stringify(res);
    const hasSecretKey = env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SECRET_KEY.length > 5 && jsonStr.includes(env.TURNSTILE_SECRET_KEY);
    assert(!hasSecretKey, "6. Secret key is never leaked in verification response or error codes");
  } catch (e) {
    assert(false, `6. Secret key leak test error: ${e.message}`);
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite runner failure:", err);
  process.exit(1);
});
