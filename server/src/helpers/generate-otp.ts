import crypto from "crypto";
import { OTP_EXPIRY_DATE_IN_MINUTES } from "../constants";
import { generateRandomInteger } from "./random-integer";

// Generate OTP
const generateOtp = () => {
  const date = new Date();

  const otp = generateRandomInteger()
  const secret = crypto.createHmac("sha256", otp).digest("hex");
  const expires = new Date(date.setMinutes(date.getMinutes() + Number(OTP_EXPIRY_DATE_IN_MINUTES))); // OTP expires after specified minutes

  return { otp, secret, expires };
};

export default generateOtp;
