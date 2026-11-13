async function runLiveTests() {
  console.log("=== RUNNING LIVE HTTP E2E TESTS ON DOCKER ZADESK API ===\n");
  const baseUrl = "http://localhost/api";
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

  // 1. Healthcheck
  const health = await fetch(`${baseUrl}/health`).then((r) => r.json());
  assert(health.status === "ok", "1. Server Healthcheck is OK");

  // 2. Turnstile public config
  const turnstileConfig = await fetch(`${baseUrl}/auth/turnstile/config`).then((r) => r.json());
  assert(typeof turnstileConfig.siteKey === "string", "2. GET /api/auth/turnstile/config returns public siteKey");

  // 3. Register without Turnstile token -> 400 Bad Request
  const regNoTokenRes = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Test",
      lastName: "User",
      email: "test.bot@example.com",
      password: "SuperSecretPassword123!",
    }),
  });
  const regNoTokenData = await regNoTokenRes.json();
  assert(
    regNoTokenRes.status === 400 && regNoTokenData.code === "MISSING_TURNSTILE_TOKEN",
    "3. POST /api/auth/register blocks request without Turnstile token (HTTP 400 MISSING_TURNSTILE_TOKEN)"
  );

  // 4. Register with invalid challenge token -> 400 Bad Request
  const regInvalidRes = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Test",
      lastName: "User",
      email: "test.bot@example.com",
      password: "SuperSecretPassword123!",
      turnstileToken: "invalid_challenge_response_token_abc",
    }),
  });
  const regInvalidData = await regInvalidRes.json();
  assert(
    regInvalidRes.status === 400 && regInvalidData.code === "VALIDATION_FAILED",
    "4. POST /api/auth/register rejects forged/invalid challenge (HTTP 400 VALIDATION_FAILED)"
  );

  // 5. Resend OTP without Turnstile token -> 400 Bad Request
  const resendNoTokenRes = await fetch(`${baseUrl}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tempToken: "temp_fake_token_123",
      purpose: "REGISTRATION",
    }),
  });
  const resendNoTokenData = await resendNoTokenRes.json();
  assert(
    resendNoTokenRes.status === 400 && resendNoTokenData.code === "MISSING_TURNSTILE_TOKEN",
    "5. POST /api/auth/resend-otp blocks bot attacks without Turnstile token (HTTP 400)"
  );

  // 6. Adaptive Login Protection Test
  const attackEmail = `target_victim_${Date.now()}@example.com`;
  // Failed Attempt 1
  await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: attackEmail, password: "bad_password" }),
  });
  // Failed Attempt 2
  await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: attackEmail, password: "bad_password" }),
  });
  // Failed Attempt 3
  const fail3Res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: attackEmail, password: "bad_password" }),
  });
  const fail3Data = await fail3Res.json();

  assert(
    fail3Data.requiresCaptcha === true,
    "6. POST /api/auth/login triggers requiresCaptcha: true on 3rd failed attempt"
  );

  // Attempt 4 without captcha token must be blocked with HTTP 403 CAPTCHA_REQUIRED
  const fail4Res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: attackEmail, password: "bad_password" }),
  });
  const fail4Data = await fail4Res.json();

  assert(
    fail4Res.status === 403 && fail4Data.code === "CAPTCHA_REQUIRED",
    "7. POST /api/auth/login strictly blocks subsequent attempts until CAPTCHA is provided (HTTP 403 CAPTCHA_REQUIRED)"
  );

  console.log(`\n=== LIVE E2E RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runLiveTests().catch((e) => {
  console.error("Live test failed:", e);
  process.exit(1);
});
