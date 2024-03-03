import { pre, prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';
import { generateNextId } from '../../../helpers/generate-next-id';

const schemaOptions: IModelOptions = {
  schemaOptions: {
    toJSON: {
      versionKey: false,
      transform: function (doc: DocumentType<FileType>, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
};

@pre<FileType>('save', async function (next) {
  if (this.isNew) {
    const lastDoc = await FileTypeModel.findOne().sort({ typeID: -1 });
    this.typeID = (lastDoc?.typeID ?? 0) + 1;
    return next();
  }
})
@modelOptions(schemaOptions)
export class FileType {
  @prop()
  public typeID!: number;

  @prop({ required: true })
  public category?: string;

  @prop({ required: true })
  public type?: string;

  @prop({ required: true })
  public name!: string;

  @prop()
  public description!: string;

  @prop({ type: () => [String] })
  public expectedMimes!: string[];

  @prop()
  public askForDocID!: number;

  /* ids of userTypes it should be required for.
     It will not show up for userTypes not listed in either of required or optional
  */
  @prop({ type: () => [Number] })
  public requiredFor!: number[];

  // ids of userTypes it should be optional for
  @prop({ type: () => [Number] })
  public optionalFor!: number[];
}

export const FileTypeModel = getModelForClass(FileType, {
  schemaOptions: { timestamps: true, collection: 'fileTypes' },
});
