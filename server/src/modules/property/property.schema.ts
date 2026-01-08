import z, { object, string, number, boolean } from 'zod';
import { processRequestBody } from 'zod-express-middleware';

export default { create, update };

function create() {
  const body = object({
    name: string({ required_error: 'name of property is required' }).trim(),
    description: string({ required_error: 'description of property is required' }).trim(),
    price: number({ required_error: 'price of property is required' }),
    agreement_estimate: number().optional(),
    year_built: number({ required_error: 'year when property was built is required' })
      .lte(new Date().getFullYear())
      .gte(1960),
    number_of_bedrooms: number({ required_error: 'number of bedrooms in property is required' }).gte(1).lte(10),
    number_of_bath: number({ required_error: 'number of bathrooms in property is required' }).gte(1).lte(10),
    land_size: object({
      value: number().positive(),
      unit: z.enum(['sqft', 'sqm', 'acres', 'hectares'])
    }).optional(),
    location: object({
      city: string({ required_error: 'city of property is required' }).trim(),
      state: string({ required_error: 'state of property is required' }).trim(),
    }),
    address: string({ required_error: 'property address is required' }).trim(),
    is_active: boolean().optional(),
    status: z.enum(['RENT', 'BUY', 'SELL']),
    propertyType: z.enum([
      'Flat', 'Studio', 'Penthouse', 'Loft',
      'Bungalow', 'Duplex', 'Detached House', 'Semi-Detached', 
      'Terraced House', 'Mansion', 'Villa', 'Land',
      'Office', 'Shop', 'Warehouse'
    ]),
    id: string().optional(),
  });

  return processRequestBody(body);
}
function update() {
  const body = object({
    name: string({ required_error: 'name of property is required' }).trim(),
    description: string({ required_error: 'description of property is required' }).trim(),
    price: number({ required_error: 'price of property is required' }),
    agreement_estimate: number().optional(),
    year_built: number()
        .lte(new Date().getFullYear())
        .gte(1960).optional(),
    number_of_bedrooms: number({ required_error: 'number of bedrooms in property is required' }).gte(1).lte(10),
    number_of_bath: number({ required_error: 'number of bathrooms in property is required' }).gte(1).lte(10),
    land_size: object({
      value: number().positive(),
      unit: z.enum(['sqft', 'sqm', 'acres', 'hectares'])
    }).optional(),
    location: object({
      city: string({ required_error: 'city of property is required' }).trim(),
      state: string({ required_error: 'state of property is required' }).trim(),
    }),
    address: string({ required_error: 'property address is required' }).trim(),
    is_active: boolean().optional(),
    status: z.enum(['RENT', 'BUY', 'SELL']),
    propertyType: z.enum([
      'Flat', 'Studio', 'Penthouse', 'Loft',
      'Bungalow', 'Duplex', 'Detached House', 'Semi-Detached', 
      'Terraced House', 'Mansion', 'Villa', 'Land',
      'Office', 'Shop', 'Warehouse'
    ]),
    id: string().optional(),
  });

  return processRequestBody(body);
}
