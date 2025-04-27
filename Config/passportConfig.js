const GoogleUser = require("../model/GoogleUser");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:7000/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if user exists
      const existingUser = await GoogleUser.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      // If new user, save to DB
      const newUser = new GoogleUser({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value,
      });

      await newUser.save();
      done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user); // save entire user object to session (you can save user.id also)
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
