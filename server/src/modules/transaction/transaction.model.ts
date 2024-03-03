import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';
import {User} from "../auth/register/register.model";
import {Receipt} from "../receipt/receipt.model";




const schemaOptions: IModelOptions = {
    schemaOptions: {
        toJSON: {
            versionKey: false,
            transform: function (doc: DocumentType<Transaction>, ret: any) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    },
};

@modelOptions(schemaOptions)
export class Transaction {
    @prop({ ref: () => User })
    public category!: Ref<Receipt>;

    @prop({ required: true })
    public amount!: string;

    @prop({ required: true, default: new Date() })
    public dueDate!: Date;

    @prop({ required: true })
    public status?: string;

    @prop({ ref: () => User })
    public created_by!: Ref<User>;

    @prop({ ref: () => User })
    public received_by!: Ref<User>;

    @prop()
    public transactionId?: string;

    @prop()
    public receiptFile?: string;
}



export const TransactionModel = getModelForClass(Transaction, { schemaOptions: { timestamps: true } });
