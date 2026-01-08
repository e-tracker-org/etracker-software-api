import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User } from '../auth/register/register.model';
import { DocumentType, IModelOptions } from '@typegoose/typegoose/lib/types';
import { FileItem } from '../uploads/upload.model';

enum Status {
  RENT = 'RENT',
  BUY = 'BUY',
  SELL = 'SELL',
}

enum PropertyType {
  // Apartment Types
  FLAT = 'Flat',
  STUDIO = 'Studio',
  PENTHOUSE = 'Penthouse',
  LOFT = 'Loft',
  
  // Landed Properties
  BUNGALOW = 'Bungalow',
  DUPLEX = 'Duplex',
  DETACHED_HOUSE = 'Detached House',
  SEMI_DETACHED = 'Semi-Detached',
  TERRACED_HOUSE = 'Terraced House',
  MANSION = 'Mansion',
  VILLA = 'Villa',
  LAND = 'Land',
  
  // Commercial
  OFFICE = 'Office',
  SHOP = 'Shop',
  WAREHOUSE = 'Warehouse',
}

export enum PropertyStatus {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETE = 'COMPLETE'
}

export enum PropertyAvailability {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  SOLD = 'SOLD',
  MAINTENANCE = 'MAINTENANCE'
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

  @prop() // Agreement estimate for rental/lease properties
  public agreement_estimate?: number;

  @prop({ required: true })
  public year_built!: number;

  @prop({ required: true })
  public number_of_bedrooms!: number;

  @prop({ required: true })
  public number_of_bath!: number;

  @prop() // Optional for apartments, required for landed properties
  public land_size?: {
    value: number;
    unit: string; // 'sqft', 'sqm', 'acres', 'hectares'
  };

  @prop({ required: true })
  public location!: {
    city: string;
    state: string;
  };

  @prop({ required: true })
  public address!: string;

  @prop({ default: true })
  public is_active?: boolean;

  @prop({ required: true, enum: Status })
  public status!: Status;

  @prop({ required: true, enum: PropertyType })
  public propertyType!: PropertyType;

  @prop({ required: true, enum: PropertyAvailability, default: PropertyAvailability.AVAILABLE })
  public availability!: PropertyAvailability; // AVAILABLE, RENTED, SOLD, MAINTENANCE

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
