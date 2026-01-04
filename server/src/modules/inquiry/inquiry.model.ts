import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';

export enum InquiryStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED'
}

const schemaOptions: IModelOptions = {
  schemaOptions: {
    toJSON: {
      versionKey: false,
      transform: function (doc: DocumentType<Inquiry>, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
};

@modelOptions(schemaOptions)
export class Inquiry {
  @prop({ required: true })
  public propertyId!: string;

  @prop({ required: true })
  public propertyName!: string;

  @prop({ required: true })
  public landlordId!: string;

  @prop({ required: true })
  public inquirerEmail!: string;

  @prop({ required: true })
  public inquirerName!: string;

  @prop({ required: true })
  public inquirerPhone!: string;

  @prop({ required: true })
  public message!: string;

  @prop({ default: InquiryStatus.PENDING, enum: InquiryStatus })
  public status?: InquiryStatus;

  @prop({ default: null })
  public landlordResponse?: string;

  @prop({ default: null })
  public respondedAt?: Date;

  @prop({ default: new Date() })
  public createdAt?: Date;

  @prop({ default: new Date() })
  public updatedAt?: Date;
}

export const InquiryModel = getModelForClass(Inquiry, { schemaOptions: { timestamps: true } });
