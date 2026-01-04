import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';




const schemaOptions: IModelOptions = {
    schemaOptions: {
        toJSON: {
            versionKey: false,
            transform: function (doc: DocumentType<Receipt>, ret: any) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    },
};

@modelOptions(schemaOptions)
export class Receipt {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public description!: string;

    @prop({ default: new Date() })
    public createdAt?: Date;

    @prop({ default: new Date() })
    public updatedAt?: Date;
}

export interface IReceiptHistory {
    transactionId: string;
    recipientId: string;
    recipientEmail: string;
    category: string;
    amount: number;
    dueDate: Date;
    pdfUrl: string;
    status: 'SENT' | 'DELIVERED' | 'FAILED';
    sentAt: Date;
    createdBy: string;
}

@modelOptions(schemaOptions)
export class ReceiptHistory {
    @prop({ required: true })
    public transactionId!: string;

    @prop({ required: true })
    public recipientId!: string;

    @prop({ required: true })
    public recipientEmail!: string;

    @prop({ required: true })
    public category!: string;

    @prop({ required: true })
    public amount!: number;

    @prop({ required: true })
    public dueDate!: Date;

    @prop({ required: true })
    public pdfUrl!: string;

    @prop({ default: 'SENT', enum: ['SENT', 'DELIVERED', 'FAILED'] })
    public status?: string;

    @prop({ default: new Date() })
    public sentAt?: Date;

    @prop({ required: true })
    public createdBy!: string;

    @prop({ default: new Date() })
    public createdAt?: Date;

    @prop({ default: new Date() })
    public updatedAt?: Date;
}

export const ReceiptModel = getModelForClass(Receipt, { schemaOptions: { timestamps: true } });
export const ReceiptHistoryModel = getModelForClass(ReceiptHistory, { schemaOptions: { timestamps: true } });
