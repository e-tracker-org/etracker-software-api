import { getModelForClass, prop } from '@typegoose/typegoose';

export class OTP {
  @prop({ required: true })
  public userEmail!: string;

  @prop({ required: true })
  public otpType!: string;

  @prop({ required: true })
  public otpCode!: string;

  @prop({ required: true })
  public secret!: string;

  @prop({ required: true })
  public expiresAt!: Date;
}

export const OTPModel = getModelForClass(OTP, {
  schemaOptions: {
    timestamps: true,
  },
});
