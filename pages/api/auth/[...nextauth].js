// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs"; // Using bcryptjs instead of bcrypt for better compatibility
import { checkRateLimit } from "@/lib/rateLimit";
import { logAudit } from "@/lib/auditLogger";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 48 * 60 * 60, // 48 hours in seconds
    updateAge: 48 * 60 * 60, // Update session every 48 hours
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        try {
          // Rate limiting for login attempts (5 per minute per IP)
          const forwarded = req.headers?.["x-forwarded-for"];
          const ip = forwarded
            ? forwarded.split(",")[0].trim()
            : req.socket?.remoteAddress || "unknown";
          const identifier = `auth:${ip}`;

          const rateLimit = checkRateLimit(identifier, 5, 60000);
          if (!rateLimit.success) {
            throw new Error(
              `Too many login attempts. Please try again in ${rateLimit.resetIn} seconds.`
            );
          }

          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const db = await connectToDatabase();
          const collection = db.collection("frontenduser");

          // Case-insensitive email search
          const user = await collection.findOne({
            email: { $regex: new RegExp(`^${credentials.email}$`, "i") },
          });

          if (!user) {
            // Log failed login attempt
            await logAudit({
              userEmail: credentials.email,
              userName: credentials.email,
              action: "LOGIN_FAILED",
              entityType: "auth",
              description: "Login failed: User not found",
              ipAddress: ip,
              userAgent: req.headers?.["user-agent"],
              requestMethod: "POST",
              requestPath: "/api/auth/callback/credentials",
              statusCode: 401,
              errorMessage: "Invalid email or password"
            });
            throw new Error("Invalid email or password");
          }

          // Check if account is active
          if (user.isActive === false) {
            // Log failed login attempt - account disabled
            await logAudit({
              userId: user._id,
              userEmail: user.email,
              userName: user.name,
              userRole: user.role,
              action: "LOGIN_FAILED",
              entityType: "auth",
              description: "Login failed: Account is disabled",
              ipAddress: ip,
              userAgent: req.headers?.["user-agent"],
              requestMethod: "POST",
              requestPath: "/api/auth/callback/credentials",
              statusCode: 403,
              errorMessage: "Account is disabled"
            });
            throw new Error("Account is disabled");
          }

          // Check if account is locked
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            const remainingMinutes = Math.ceil(
              (new Date(user.lockedUntil) - new Date()) / 60000
            );
            // Log failed login attempt - account locked
            await logAudit({
              userId: user._id,
              userEmail: user.email,
              userName: user.name,
              userRole: user.role,
              action: "LOGIN_FAILED",
              entityType: "auth",
              description: `Login failed: Account is locked for ${remainingMinutes} more minutes`,
              ipAddress: ip,
              userAgent: req.headers?.["user-agent"],
              requestMethod: "POST",
              requestPath: "/api/auth/callback/credentials",
              statusCode: 403,
              errorMessage: "Account is temporarily locked"
            });
            throw new Error(
              `Account is locked. Please try again in ${remainingMinutes} minutes.`
            );
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            // Increment failed login attempts
            const failedAttempts = (user.failedLoginAttempts || 0) + 1;
            const updateData = {
              failedLoginAttempts: failedAttempts,
              lastFailedLogin: new Date()
            };

            // Lock account after 5 failed attempts
            if (failedAttempts >= 5) {
              updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            }

            // Update user in database
            await collection.updateOne(
              { _id: user._id },
              { $set: updateData }
            );

            // Log failed login attempt - wrong password
            await logAudit({
              userId: user._id,
              userEmail: user.email,
              userName: user.name,
              userRole: user.role,
              action: "LOGIN_FAILED",
              entityType: "auth",
              description: failedAttempts >= 5 
                ? "Login failed: Account locked after 5 failed attempts"
                : `Login failed: Invalid password (Attempt ${failedAttempts}/5)`,
              ipAddress: ip,
              userAgent: req.headers?.["user-agent"],
              requestMethod: "POST",
              requestPath: "/api/auth/callback/credentials",
              statusCode: 401,
              errorMessage: "Invalid email or password"
            });

            if (failedAttempts >= 5) {
              throw new Error("Account locked due to multiple failed login attempts. Please try again in 15 minutes.");
            }

            throw new Error("Invalid email or password");
          }

          // Reset failed login attempts on successful login
          if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await collection.updateOne(
              { _id: user._id },
              { 
                $set: { 
                  failedLoginAttempts: 0,
                  lockedUntil: null,
                  lastFailedLogin: null
                } 
              }
            );
          }

          // Return user data without sensitive information
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
            sessionVersion: user.sessionVersion || 1,
            userPhone: user.userPhone || "",
            userImage: user.userImage || "",
            ip: ip, // Pass IP for audit logging
            userAgent: req.headers?.["user-agent"] // Pass user agent
          };
        } catch (error) {
          console.error("Authentication error:", error.message);
          // Return null to indicate failed authentication
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const db = await connectToDatabase();
      const collection = db.collection("frontenduser");

      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.userPhone = user.userPhone;
        token.userImage = user.userImage;
        
        // Log successful login
        await logAudit({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          userRole: user.role,
          action: "LOGIN",
          entityType: "auth",
          description: `User ${user.name} logged in successfully`,
          ipAddress: user.ip || "unknown",
          userAgent: user.userAgent || "unknown",
          requestMethod: "POST",
          requestPath: "/api/auth/callback/credentials",
          statusCode: 200
        });
      }
      // Subsequent requests - verify session
      else if (token?.id) {
        const dbUser = await collection.findOne({
          _id: new ObjectId(token.id),
        });

        if (!dbUser) {
          throw new Error("User not found");
        }

        // Check session version
        if (dbUser.sessionVersion !== token.sessionVersion) {
          throw new Error("Session expired");
        }

        // Update token with latest user data
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.role = dbUser.role;
        token.userPhone = dbUser.userPhone;
        token.userImage = dbUser.userImage;
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.userPhone = token.userPhone;
        session.user.userImage = token.userImage;
        session.sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/signin", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // Used for email verification
    newUser: "/auth/new-user", // New users will be directed here
  },
  events: {
    async signOut({ token }) {
      // Log logout
      if (token) {
        await logAudit({
          userId: token.id,
          userEmail: token.email,
          userName: token.name,
          userRole: token.role,
          action: "LOGOUT",
          entityType: "auth",
          description: `User ${token.name} logged out`,
          requestMethod: "POST",
          requestPath: "/api/auth/signout",
          statusCode: 200
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Required for production
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
