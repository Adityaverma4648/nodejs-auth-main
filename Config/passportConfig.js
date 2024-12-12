const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-client-id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your-client-secret";
const User = require('../model/user');

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback", // Ensure this matches your redirect URI in Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Implement your user find or create logic here
        const user = await User.findOrCreate({ googleId: profile.id });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
