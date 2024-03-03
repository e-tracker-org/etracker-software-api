import { getModelForClass, modelOptions, pre, prop, Ref } from '@typegoose/typegoose';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';

const schemaOptions: IModelOptions = {
  schemaOptions: {
    toJSON: {
      versionKey: false,
      transform: function (doc: DocumentType<AccountType>, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
};

@pre<AccountType>('save', async function (next) {
  if (this.isNew) {
    const lastEntry = await AccountTypeModel.findOne().sort({ typeID: -1 });
    this.typeID = (lastEntry?.typeID ?? 0) + 1;
    return next();
  }
})
@modelOptions(schemaOptions)
export class AccountType {
  @prop()
  public typeID!: number;

  @prop({ required: true })
  public accountType!: string;

  @prop({ required: true, default: '' })
  public description?: string;
}

export const AccountTypeModel = getModelForClass(AccountType, {
  schemaOptions: { timestamps: true },
});
