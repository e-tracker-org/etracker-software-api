import passport from 'passport';

const Strategy = require('passport-local').Strategy;
import { UserModel, User } from '../../register/register.model';
import { Profile, Strategy as GoogleStrategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../../../constants';
import { comparePasswords } from '../../../../helpers/comparePassword';
import { ObjectId } from 'bson';

interface GoogleStrategyConfig extends StrategyOptions {
  state?: boolean;
}

passport.serializeUser(function (user: any, done) {
  done(null, user._id);
});

passport.deserializeUser(function (user, done) {
  UserModel.findOne({ email: user.email }).exec((err, user) => {
    done(err, user);
  });
});

passport.use(
  'google',
  <passport.Strategy>new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID!,
      callbackURL: '/api/v1/auth/google/callback',
      clientSecret: GOOGLE_CLIENT_SECRET!,
      scope: ['email', 'profile'],
      state: true, // Use state parameter instead of session
    } as GoogleStrategyConfig,
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      // Find or create user in your database
      const emails = profile.emails?.map((email) => email.value);
      // const password = profile.emails?.map(email => email.value);
      UserModel.findOne({ email: emails[0] })
        .lean()
        .exec(async (err, user: any) => {
          if (err) {
            return done('Server Error', undefined);
          }

          if (!user) {
            const userObject = {
              password: profile.id,
              email: emails[0],
              firstname: profile.name?.givenName,
              lastname: profile.name?.familyName,
              state: 'Abia',
            };
            let newUser = await UserModel.create(userObject);

            newUser.save((error, inserted) => {
              if (error) {
                return done(error, undefined);
              }

              return done(null, inserted);
            });
          }
          if (user) {
            // return done("Verify user password);
            if (!(await comparePasswords(user.password, profile.id))) {
              return done('Google authentication failed', undefined);
            }
            return done(null, user);
          }
        });
    }
  )
);
