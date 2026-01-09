import z, { object, string, number, boolean } from 'zod';
import { processRequestBody } from 'zod-express-middleware';

export default { create, update };

function create() {
  const body = object({
    name: string({ required_error: 'name of property is required' }).trim(),
    description: string({ required_error: 'description of property is required' }).trim(),
    price: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
    agreement_estimate: z.union([string(), number()]).transform(val => {
      if (!val || val === '') return undefined;
      return typeof val === 'string' ? parseFloat(val) : val;
    }).optional(),
    year_built: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseInt(val) : val)
      .refine(val => val <= new Date().getFullYear() && val >= 1960, {
        message: 'Year must be between 1960 and current year'
      }),
    number_of_bedrooms: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseInt(val) : val)
      .refine(val => val >= 0 && val <= 10, {
        message: 'Number of bedrooms must be between 0 and 10'
      }).optional(),
    number_of_bath: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseInt(val) : val)
      .refine(val => val >= 0 && val <= 10, {
        message: 'Number of bathrooms must be between 0 and 10'
      }).optional(),
    land_size: z.union([
      object({
        value: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        unit: z.enum(['sqft', 'sqm', 'acres', 'hectares'])
      }),
      string().transform(val => {
        if (val === '' || !val) return undefined;
        try {
          // Handle stringified JSON from frontend
          const parsed = JSON.parse(val);
          return {
            value: typeof parsed.value === 'string' ? parseFloat(parsed.value) : parsed.value,
            unit: parsed.unit
          };
        } catch {
          // If not valid JSON, return undefined
          return undefined;
        }
      })
    ]).optional(),
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
    ]).optional(),
    apartmentType: z.enum(['Flat', 'Duplex']).optional(),
    id: string().optional(),
  }).transform((data) => {
    // Use apartmentType as fallback if propertyType is not provided
    if (!data.propertyType && data.apartmentType) {
      data.propertyType = data.apartmentType;
    }
    return data;
  });

  return processRequestBody(body);
}
function update() {
  const body = object({
    name: string({ required_error: 'name of property is required' }).trim(),
    description: string({ required_error: 'description of property is required' }).trim(),
    price: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
    agreement_estimate: z.union([string(), number()]).transform(val => {
      if (!val || val === '') return undefined;
      return typeof val === 'string' ? parseFloat(val) : val;
    }).optional(),
    year_built: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseInt(val) : val)
        .refine(val => val <= new Date().getFullYear() && val >= 1960, {
          message: 'Year must be between 1960 and current year'
        }).optional(),
    number_of_bedrooms: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseInt(val) : val)
      .refine(val => val >= 0 && val <= 10, {
        message: 'Number of bedrooms must be between 0 and 10'
      }).optional(),
    number_of_bath: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseInt(val) : val)
      .refine(val => val >= 0 && val <= 10, {
        message: 'Number of bathrooms must be between 0 and 10'
      }).optional(),
    land_size: z.union([
      object({
        value: z.union([string(), number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        unit: z.enum(['sqft', 'sqm', 'acres', 'hectares'])
      }),
      string().transform(val => {
        if (val === '' || !val) return undefined;
        try {
          // Handle stringified JSON from frontend
          const parsed = JSON.parse(val);
          return {
            value: typeof parsed.value === 'string' ? parseFloat(parsed.value) : parsed.value,
            unit: parsed.unit
          };
        } catch {
          // If not valid JSON, return undefined
          return undefined;
        }
      })
    ]).optional(),
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
    ]).optional(),
    apartmentType: z.enum(['Flat', 'Duplex']).optional(),
    id: string().optional(),
  }).transform((data) => {
    // Use apartmentType as fallback if propertyType is not provided
    if (!data.propertyType && data.apartmentType) {
      data.propertyType = data.apartmentType;
    }
    return data;
  });

  return processRequestBody(body);
}
