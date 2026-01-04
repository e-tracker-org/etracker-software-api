import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

const schemaOptions: IModelOptions = {
  schemaOptions: {
    toJSON: {
      versionKey: false,
      transform: function (doc: DocumentType<Booking>, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
};

@modelOptions(schemaOptions)
export class Booking {
  @prop({ required: true })
  public propertyId!: string;

  @prop({ required: true })
  public propertyName!: string;

  @prop({ required: true })
  public landlordId!: string;

  @prop({ default: null, required: false })
  public tenantId?: string; // Only set after approval and account creation

  @prop({ required: true })
  public tenantEmail!: string;

  @prop({ required: true })
  public tenantName!: string;

  @prop({ required: true })
  public tenantPhone!: string;

  @prop({ required: true })
  public requestedMonth!: string; // Format: "2026-02" (YYYY-MM)

  @prop({ default: '', required: false })
  public specialRequests?: string;

  @prop({ default: null })
  public moveInDate?: Date; // Set by landlord after approval

  @prop({ default: null })
  public noOfMonths?: number; // Set by landlord after approval

  @prop({ default: BookingStatus.PENDING, enum: BookingStatus })
  public status?: BookingStatus;

  @prop({ default: null })
  public landlordApprovalDate?: Date;

  @prop({ default: null })
  public landlordRejectionReason?: string;

  @prop({ default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
  public expiresAt?: Date; // Auto-reject if not approved within 30 days

  @prop({ default: null })
  public applicantAcceptedAt?: Date; // When applicant accepts approved offer

  @prop({ default: new Date() })
  public createdAt?: Date;

  @prop({ default: new Date() })
  public updatedAt?: Date;
}

export const BookingModel = getModelForClass(Booking, { schemaOptions: { timestamps: true } });
