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
}



export const ReceiptModel = getModelForClass(Receipt, { schemaOptions: { timestamps: true } });
