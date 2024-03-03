import passport from 'passport';
import { UserModel } from '../../register/register.model';
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  UserModel.findOne({ email: user?.email }).exec((err, user) => {
    done(err, user);
  });
});

import { GoogleLogin } from './strategy-setup';

// passport.use("google-signin", <passport.Strategy>GoogleLogin);

// passport.use(
//     new JwtStrategy(
//         {
//             jwtFromRequest: ExtractJwt.fromHeader("authorization"),
//             secretOrKey: "secretKey",
//         },
//         async (jwtPayload, done) => {
//             try {
//                 // Extract user</em>
//                 const user = jwtPayload.user;
//                 done(null, user);
//             } catch (error) {
//                 done(error, false);
//             }
//         }
//     )
// );
// passport.use("google-signup", <passport.Strategy>GoogleSignup);

export default passport;
