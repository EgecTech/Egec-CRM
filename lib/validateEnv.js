// lib/validateEnv.js
/**
 * Environment Variables Validation
 * Validates that all required environment variables are set
 * This prevents cryptic runtime errors in production
 */

export function validateEnv() {
  // Only validate in production to avoid development issues
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const required = [
    "MONGODB_URI",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nPlease check your .env file and ensure all required variables are set.");
    
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  console.log("✅ All required environment variables are set");
}

/**
 * Validates environment variables and provides warnings for optional ones
 */
export function validateEnvWithWarnings() {
  // Validate required variables
  validateEnv();

  // Only check optional variables in production
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const optional = [
    "SENTRY_DSN",
    "NEXT_PUBLIC_SENTRY_DSN",
    "REDIS_URL",
  ];

  const missingOptional = optional.filter((key) => !process.env[key]);

  if (missingOptional.length > 0) {
    console.warn("⚠️  Optional environment variables not set:");
    missingOptional.forEach((key) => console.warn(`   - ${key}`));
    console.warn("   (These are optional but recommended for production)");
  }
}

