import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User } from '../auth/register/register.model';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';
import { FileItem } from '../uploads/upload.model';


export enum PropertyStatus {
    INCOMPLETE = 'INCOMPLETE',
    COMPLETE = 'COMPLETE'
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
}

export const TenantModel = getModelForClass(Tenant, { schemaOptions: { timestamps: true } });
