import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User } from '../auth/register/register.model';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';
import { FileItem } from '../uploads/upload.model';


export enum PropertyStatus {
    INCOMPLETE = 'INCOMPLETE',
    COMPLETE = 'COMPLETE'
}

export enum LeaseStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    COMPLETED = 'COMPLETED'
}

const schemaOptions: IModelOptions = {
    schemaOptions: {
        toJSON: {
            versionKey: false,
            transform: function (doc: DocumentType<Tenant>, ret: any) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    },
};

@modelOptions(schemaOptions)
export class Tenant {
    @prop({ required: true })
    public tenantId!: string;

    @prop({ required: true })
    public propertyId!: string;

    @prop({ required: false, default: null, index: true })
    public bookingId?: string; // ✅ FIX #7: Link to original application

    @prop({ required: false })
    public moveInDate?: Date;

    @prop({ required: false })
    public moveOutDate?: Date;

    @prop({ required: false })
    public rentAmount?: number;

    @prop({ required: false, enum: LeaseStatus, default: LeaseStatus.ACTIVE })
    public status?: LeaseStatus;

    @prop({ required: false })
    public landlordId?: string;
}

export const TenantModel = getModelForClass(Tenant, { schemaOptions: { timestamps: true } });
