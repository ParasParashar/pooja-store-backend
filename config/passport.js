import passport from "passport";
import prisma from "../prisma/prisma.js";
import dotenv from "dotenv";
import GoogleStrategy from "passport-google-oauth20";

dotenv.config();

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",")
  : [];

const callbackURL =
  process.env.NODE_ENV === "production"
    ? "https://pooja-store-backend-0cn7.onrender.com/auth/google/callback"
    : "http://localhost:4000/auth/google/callback";
console.log(callbackURL, "current callback url ");
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        // If user does not exist, create a new user
        if (!user) {
          const isAdmin = ADMIN_EMAILS.includes(profile.emails[0].value);

          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              isAdmin: isAdmin,
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
