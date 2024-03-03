import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { DocumentType, IModelOptions, Ref } from '@typegoose/typegoose/lib/types';

const schemaOptions: IModelOptions = {
  schemaOptions: {
    toJSON: {
      versionKey: false,
      transform: function (doc: DocumentType<FileItem>, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
};

enum Status {
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@modelOptions(schemaOptions)
export class FileItem {
  @prop({ required: true })
  public userId?: string;

  @prop({ required: true })
  public docTypeID?: string;

  @prop()
  public docNo!: string;

  @prop()
  public description!: string;

  @prop({ required: true, type: () => [String] })
  public files!: string[];

  @prop({ required: true, type: () => [String] })
  public urls!: string[];

  @prop({ enum: Status, default: Status.SUBMITTED })
  public status?: Status;
}

export const FileItemModel = getModelForClass(FileItem, {
  schemaOptions: { timestamps: true, collection: 'files' },
});
