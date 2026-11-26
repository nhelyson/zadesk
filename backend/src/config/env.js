import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env or local .env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PROD: process.env.NODE_ENV === "production",
  PORT: parseInt(process.env.PORT || "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost",
  SESSION_SECRET: process.env.SESSION_SECRET || "zadesk_dev_secret_key_session_2026",
  SESSION_MAX_AGE_DAYS: parseInt(process.env.SESSION_MAX_AGE_DAYS || "7", 10),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  
  // Zavu Email Provider & OTP Configuration
  ZAVUDEV_API_KEY: process.env.ZAVUDEV_API_KEY || "",
  ZAVU_FROM_EMAIL: process.env.ZAVU_FROM_EMAIL || process.env.EMAIL_FROM || "zadesk@backup-sev.online",
  ZAVU_SENDER_ID: process.env.ZAVU_SENDER_ID || "kd7a0za0kdsrc381rvnfp3nszd8ds0c6",
  OTP_EXPIRATION_MINUTES: parseInt(process.env.OTP_EXPIRATION_MINUTES || "15", 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10),
  OTP_RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || "60", 10),

  // Meta & WhatsApp Cloud API Configuration
  META_APP_ID: process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || "",
  META_APP_SECRET: process.env.META_APP_SECRET || "",
  META_CONFIG_ID: process.env.META_CONFIG_ID || process.env.NEXT_PUBLIC_META_CONFIG_ID || "",
  META_API_VERSION: process.env.META_API_VERSION || "v21.0",

  // Cloudflare Turnstile Configuration
  TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || "",
  TURNSTILE_BYPASS_DEV: process.env.TURNSTILE_BYPASS_DEV === "true" || process.env.NODE_ENV !== "production",

  // SasPay Official Configuration (Phase D.2)
  SASPAY_API_KEY: process.env.SASPAY_API_KEY || "",
  SASPAY_WEBHOOK_SECRET: process.env.SASPAY_WEBHOOK_SECRET || "",
  APP_URL: process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost",
  SASPAY_API_BASE_URL: process.env.SASPAY_API_BASE_URL || "https://api.saspay.me/api/v1",

  // Web Push (VAPID) Configuration
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || "",
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || "mailto:support@zalisk.com",

  // Agent Presence Configuration (Heartbeat / Idle / Expiration)
  PRESENCE_HEARTBEAT_INTERVAL_SEC: parseInt(process.env.PRESENCE_HEARTBEAT_INTERVAL_SEC || "30", 10),
  PRESENCE_TTL_SEC: parseInt(process.env.PRESENCE_TTL_SEC || "75", 10),
  PRESENCE_AWAY_AFTER_SEC: parseInt(process.env.PRESENCE_AWAY_AFTER_SEC || "300", 10),
};


