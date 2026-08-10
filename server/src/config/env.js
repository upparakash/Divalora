import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: process.env.PORT || 4001,
  // Public origin of the site as visitors see it — the API server itself
  // usually sits behind a proxy/CDN or on a different host in production, so
  // req.protocol/req.get('host') would resolve to the wrong (internal) origin.
  siteUrl: (process.env.SITE_URL || "http://localhost:5173").replace(/\/$/, ""),
  db: {
    host: required("DB_HOST"),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    name: required("DB_NAME"),
  },
  jwtSecret: required("JWT_SECRET"),
  admin: {
    username: required("ADMIN_USERNAME"),
    passwordHash: required("ADMIN_PASSWORD_HASH"),
  },
};
