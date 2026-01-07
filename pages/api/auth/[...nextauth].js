// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs"; // Using bcryptjs instead of bcrypt for better compatibility

export default NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
    updateAge: 48 * 60 * 60,
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
      async authorize(credentials) {
        try {
          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const db = await connectToDatabase();
          const collection = db.collection("admin");

          // Case-insensitive email search
          const user = await collection.findOne({
            email: { $regex: new RegExp(`^${credentials.email}$`, "i") },
          });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Check if account is active
          if (user.isActive === false) {
            throw new Error("Account is disabled");
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid email or password");
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
      const collection = db.collection("admin");

      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.userPhone = user.userPhone;
        token.userImage = user.userImage;
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
      // Optional: Handle sign-out cleanup
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Required for production
  debug: process.env.NODE_ENV === "development",
});
