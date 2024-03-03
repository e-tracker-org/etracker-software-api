import express, { Router } from 'express';
import forgotRouter from '../modules/auth/forgot-password/forgot.route';
import loginRouter from '../modules/auth/login/login.route';
import verifyOTP from '../modules/auth/otp/otp.route';
import registerRouter from '../modules/auth/register/register.route';
import resetPass from '../modules/auth/reset-password/reset-pass.route';
import verifyAccount from '../modules/auth/verify-account/verify-account.route';
import propertyRouter from '../modules/property/property.route';
import uploadRouter from '../modules/uploads/upload.routes';
import fileTypesRouter from '../modules/uploads/file-types/file-types.routes';
import profileRouter from '../modules/profile/profile.route';
import googleAuthRouter from '../modules/auth/google/google.route';
import conJobRouter from '../modules/auth/con-job/con-job.route';
import tokenRouter from '../modules/auth/token/token.route';
import accountTypeRouter from '../modules/account-type/account-type.route';
import kycRouter from '../modules/kyc/kyc.route';
import tenantRouter from '../modules/tenant/tenant.route';
import landlordRouter from '../modules/landlord/landlord.route';
import ReceiptRoute from "../modules/receipt/receipt.route";
import transactionRoute from "../modules/transaction/transaction.route";
const router = express.Router();

interface RoutesInterface {
  path: string;
  route: Router;
}

const routes: RoutesInterface[] = [
  {
    path: '/auth',
    route: loginRouter,
  },
  {
    path: '/auth/forgot-password',
    route: forgotRouter,
  },
  {
    path: '/auth/reset-password',
    route: resetPass,
  },
  {
    path: '/auth/verify-otp',
    route: verifyOTP,
  },
  {
    path: '/user/verify-otp',
    route: verifyOTP,
  },
  {
    path: '/auth/google',
    route: googleAuthRouter,
  },
  {
    path: '/auth/verify-account',
    route: verifyAccount,
  },
  {
    path: '/auth/register',
    route: registerRouter,
  },
  {
    path: '/user/register',
    route: registerRouter,
  },
  {
    path: '/auth/token',
    route: tokenRouter,
  },
  {
    path: '/properties',
    route: propertyRouter,
  },
  { path: '/docs/upload', route: uploadRouter },
  { path: '/docs/filetypes', route: fileTypesRouter },
  {
    path: '/user',
    route: profileRouter,
  },
  {
    path: '/account-type',
    route: accountTypeRouter,
  },
  {
    path: '/kyc',
    route: kycRouter,
  },
  {
    path: '/tenant',
    route: tenantRouter,
  },
  {
    path: '/landlord',
    route: landlordRouter,
  },
  {
    path: '/receipt',
    route: ReceiptRoute,
  },
  {
    path: '/transaction',
    route: transactionRoute,
  },
  {
    path: '/con-job',
    route: conJobRouter,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
