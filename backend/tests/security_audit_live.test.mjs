async function runFullAuditTests() {
  console.log("=== RUNNING FULL SECURITY & RATE LIMITING AUDIT SUITE ===\n");
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

  // 1. Config public endpoint check
  const configRes = await fetch(`${baseUrl}/auth/turnstile/config`);
  const configData = await configRes.json();
  assert(
    configRes.status === 200 &&
      typeof configData.siteKey === "string" &&
      configData.secretKey === undefined,
    "1. GET /api/auth/turnstile/config exposes siteKey only and NEVER secretKey"
  );

  // 2. Direct POST /register without Turnstile token
  const regNoTokenRes = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Attacker",
      lastName: "Bot",
      email: `bot_${Date.now()}@spammer.com`,
      password: "Password123!",
    }),
  });
  const regNoTokenData = await regNoTokenRes.json();
  assert(
    regNoTokenRes.status === 400 && regNoTokenData.code === "MISSING_TURNSTILE_TOKEN",
    "2. POST /register without token is blocked at middleware (HTTP 400, Zavu NOT called)"
  );

  // 3. Direct POST /register with fake/invalid Turnstile token
  const regInvalidRes = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Attacker",
      lastName: "Bot",
      email: `bot_${Date.now()}@spammer.com`,
      password: "Password123!",
      turnstileToken: "forged_turnstile_response_token_xyz",
    }),
  });
  const regInvalidData = await regInvalidRes.json();
  assert(
    regInvalidRes.status === 400 && regInvalidData.code === "VALIDATION_FAILED",
    "3. POST /register with invalid token is rejected by Cloudflare verification (HTTP 400)"
  );

  // 4. Direct POST /resend-otp without Turnstile token
  const resendNoTokenRes = await fetch(`${baseUrl}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tempToken: "fake_temp_token_for_audit",
      purpose: "REGISTRATION",
    }),
  });
  const resendNoTokenData = await resendNoTokenRes.json();
  assert(
    resendNoTokenRes.status === 400 && resendNoTokenData.code === "MISSING_TURNSTILE_TOKEN",
    "4. POST /resend-otp without token is blocked (HTTP 400, Zavu protected against email bombing)"
  );

  // 5. Adaptive Login Bruteforce Protection
  const targetEmail = `audit_victim_${Date.now()}@example.com`;
  for (let i = 1; i <= 3; i++) {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail, password: "wrong_password" }),
    });
    const data = await res.json();
    if (i === 3) {
      assert(data.requiresCaptcha === true, "5. POST /login triggers requiresCaptcha on 3rd failed attempt");
    }
  }

  // 6. Attempt 4 on login without CAPTCHA token
  const attempt4Res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: targetEmail, password: "wrong_password" }),
  });
  const attempt4Data = await attempt4Res.json();
  assert(
    attempt4Res.status === 403 && attempt4Data.code === "CAPTCHA_REQUIRED",
    "6. POST /login strictly rejects attempt 4 without Turnstile token (HTTP 403 CAPTCHA_REQUIRED)"
  );

  console.log(`\n=== AUDIT LIVE TESTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runFullAuditTests().catch((e) => {
  console.error("Full audit tests failed:", e);
  process.exit(1);
});
