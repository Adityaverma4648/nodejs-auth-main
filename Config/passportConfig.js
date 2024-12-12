const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const dotenv = require("dotenv");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// google stratergy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      // Check if user exists in the database

      console.log({ accessToken, refreshToken, profile });
      try {
        let user = await User.findOne({ googleId: profile.id });

        console.log(user);

        if (!user) {
          user = new User({
            googleId: profile.id,
            userName: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.picture,
            role: "student",
            password: "",
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: "process.env.FACEBOOK_APP_ID",
      clientSecret: "process.env.FACEBOOK_APP_SECRET",
      callbackURL: "http://localhost:7000/auth/facebook/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// LinkedIn Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: "process.env.LINKEDIN_APP_ID",
      clientSecret: "process.env.LINKEDIN_APP_SECRET",
      callbackURL: "http://localhost:7000/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// X (Twitter) Strategy
passport.use(
  new TwitterStrategy(
    {
      consumerKey: "process.env.TWITTER_API_KEY",
      consumerSecret: "process.env.TWITTER_API_SECRET_KEY",
      callbackURL: "http://localhost:7000/auth/twitter/callback",
    },
    (token, tokenSecret, profile, done) => {
      return done(null, profile);
    }
  )
);

module.exports = passport;
