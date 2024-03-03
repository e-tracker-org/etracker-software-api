import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User } from '../auth/register/register.model';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';
import { FileItem } from '../uploads/upload.model';

enum Status {
  RENT = 'RENT',
  BUY = 'BUY',
  SELL = 'SELL',
}

enum ApartmentType {
  FLAT = 'Flat',
  DUPLEX = 'Duplex',
}

export enum PropertyStatus {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETE = 'COMPLETE'
}

export interface Tenant{
  tenantId: string;
  status: PropertyStatus;
  isActive: boolean
}


const schemaOptions: IModelOptions = {
  schemaOptions: {
    toJSON: {
      versionKey: false,
      transform: function (doc: DocumentType<Property>, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
};

@modelOptions(schemaOptions)
export class Property {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public description!: string;

  @prop({ required: true })
  public price!: number;

  @prop({ required: true })
  public year_built!: number;

  @prop({ required: true })
  public number_of_bedrooms!: number;

  @prop({ required: true })
  public number_of_bath!: number;

  @prop({ required: true })
  public location!: {
    city: string;
    state: string;
  };

  @prop({ required: true })
  public address!: string;

  @prop({ default: false })
  public is_active?: boolean;

  @prop({ required: true, enum: Status })
  public status!: Status;

  @prop({ required: true, enum: ApartmentType })
  public apartmentType!: ApartmentType;

  @prop({ ref: () => FileItem, default: [] })
  public image_list!: Ref<FileItem>[];

  @prop({ type: () => Object, default: () => ({ isActive: true }) })
  public tenant?: Tenant[];

  @prop()
  public category?: string;

  @prop({ ref: () => User })
  public created_by!: Ref<User>;

  @prop({ ref: () => User })
  public current_owner!: Ref<User>;
}

export const PropertyModel = getModelForClass(Property, { schemaOptions: { timestamps: true } });
