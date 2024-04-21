import { getModelForClass, modelOptions, pre, prop, Ref } from '@typegoose/typegoose';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';
import argon2 from 'argon2';
import { AccountType } from '../../account-type/account-type.model';
import { KycStatus } from '../../kyc/kyc.model';

interface KycInfo {
  status: KycStatus;
  kycStage: number;
  accountType: number;
  kycId: string;
  currentStage: number;
}

const schemaOptions: IModelOptions = {
  schemaOptions: {
    toJSON: {
      versionKey: false,
      transform: function (doc: DocumentType<User>, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  },
};

@pre<User>('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await argon2.hash(this.password);
    return next();
  }

  if (this.isModified('currentKyc')) {
    delete this.currentKyc;
  }

  return next();
})
@modelOptions(schemaOptions)
export class User {
  @prop({ required: true })
  public firstname!: string;

  @prop({ required: true })
  public lastname!: string;

  @prop({ required: true })
  public email!: string;

  @prop({ default: '' })
  public state?: string;

  @prop({ default: false })
  public isEmailVerified?: boolean;

  @prop({ required: true })
  public password!: string;

  @prop({ default: '' })
  public phone!: string;

  @prop({ default: '' })
  public gender?: string;

  @prop({ default: new Date() })
  public dob?: Date;

  @prop({ default: '' })
  public country?: string;

  @prop({ default: '' })
  public area?: string;

  @prop({ default: '' })
  public fullAddress?: string;

  @prop({ default: '' })
  public landmark?: string;

  @prop({ ref: () => User })
  public updatedBy?: Ref<User>;

  @prop({ default: false })
  public isUserVerified?: boolean;

  @prop({ default: [] })
  public accountTypes?: number[];

  @prop({ type: () => Object })
  public currentKyc?: KycInfo;

  @prop({ default: '' })
  public profileImage?: string;
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
});
