import express from "express";
import cookieParser from "cookie-parser";
import apiRouter from "../src/routes/index.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

async function runHttpTests() {
  console.log("=== STARTING HTTP ENDPOINT INTEGRATION TESTS FOR TURNSTILE ===\n");
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

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", apiRouter);
  app.use(errorHandler);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // Test 1: GET /api/auth/turnstile/config
    const configRes = await fetch(`${baseUrl}/auth/turnstile/config`);
    const configData = await configRes.json();
    assert(configRes.status === 200 && typeof configData.siteKey === "string", "1. GET /api/auth/turnstile/config returns siteKey safely");

    // Test 2: POST /api/auth/register with no Turnstile Token -> 400
    const registerNoTokenRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@test.com",
        password: "Password123!",
      }),
    });
    const registerNoTokenData = await registerNoTokenRes.json();
    assert(
      registerNoTokenRes.status === 400 && registerNoTokenData.code === "MISSING_TURNSTILE_TOKEN",
      "2. POST /api/auth/register blocks request without Turnstile token (HTTP 400)"
    );

    // Test 3: POST /api/auth/register with invalid Turnstile Token -> 400
    const registerInvalidTokenRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@test.com",
        password: "Password123!",
        turnstileToken: "invalid_test_challenge_token",
      }),
    });
    const registerInvalidTokenData = await registerInvalidTokenRes.json();
    assert(
      registerInvalidTokenRes.status === 400 && registerInvalidTokenData.code === "VALIDATION_FAILED",
      "3. POST /api/auth/register rejects invalid Turnstile challenge (HTTP 400)"
    );

    // Test 4: POST /api/auth/resend-otp with no Turnstile Token -> 400
    const resendNoTokenRes = await fetch(`${baseUrl}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tempToken: "sample_temp_token_123",
        purpose: "REGISTRATION",
      }),
    });
    const resendNoTokenData = await resendNoTokenRes.json();
    assert(
      resendNoTokenRes.status === 400 && resendNoTokenData.code === "MISSING_TURNSTILE_TOKEN",
      "4. POST /api/auth/resend-otp blocks direct bot attacks without Turnstile token (HTTP 400)"
    );

    // Test 5: Adaptive Login Challenge triggering after failed attempts
    const attackEmail = `bruteforce_test_${Date.now()}@example.com`;
    // Attempt 1
    await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: attackEmail, password: "wrong_password" }),
    });
    // Attempt 2
    await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: attackEmail, password: "wrong_password" }),
    });
    // Attempt 3
    const attempt3Res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: attackEmail, password: "wrong_password" }),
    });
    const attempt3Data = await attempt3Res.json();

    assert(
      attempt3Data.requiresCaptcha === true,
      "5. POST /api/auth/login enables requiresCaptcha after threshold failed attempts"
    );

    // Attempt 4 without token must be blocked (HTTP 403 CAPTCHA_REQUIRED)
    const attempt4Res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: attackEmail, password: "wrong_password" }),
    });
    const attempt4Data = await attempt4Res.json();

    assert(
      attempt4Res.status === 403 && attempt4Data.code === "CAPTCHA_REQUIRED",
      "6. POST /api/auth/login strictly blocks subsequent attempts until CAPTCHA is solved (HTTP 403)"
    );

  } finally {
    server.close();
  }

  console.log(`\n=== HTTP RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runHttpTests().catch((err) => {
  console.error("HTTP test runner error:", err);
  process.exit(1);
});
