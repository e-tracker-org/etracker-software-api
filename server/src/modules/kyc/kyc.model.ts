import { getModelForClass, modelOptions, pre, prop, Ref } from '@typegoose/typegoose';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';

export enum KycStatus {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETE = 'COMPLETE',
  PENDING = 'PENDING',
  APRROVED = 'APRROVED',
  REJECTED = 'REJECTED',
}

export const KycStages: { [key: number]: number[] } = {
  1: [1, 2],
  2: [1, 2, 3],
  3: [1, 2, 3],
  4: [1, 2, 3],
  5: [1, 2, 3],
};

const schemaOptions: IModelOptions = {
  schemaOptions: {
    toJSON: {
      versionKey: false,
      transform: function (doc: DocumentType<KYC>, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
};

@modelOptions(schemaOptions)
export class KYC {
  @prop({ required: true })
  public accountType!: number;

  @prop({ required: true, enum: KycStatus })
  public status!: KycStatus;

  @prop({ required: true, type: () => [Number] })
  public filledStages!: number[];

  @prop()
  public reviewedBy?: string;

  @prop()
  public reviewerComment?: string;

  @prop({ required: true })
  public userId!: string;
}

export const KYCModel = getModelForClass(KYC, {
  schemaOptions: { timestamps: true },
});
