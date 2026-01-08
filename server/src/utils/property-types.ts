/**
 * Property type utilities and configurations
 */

export const PropertyTypeCategories = {
  APARTMENTS: {
    label: 'Apartments',
    types: ['Flat', 'Studio', 'Penthouse', 'Loft']
  },
  LANDED_PROPERTIES: {
    label: 'Landed Properties',
    types: ['Bungalow', 'Duplex', 'Detached House', 'Semi-Detached', 'Terraced House', 'Mansion', 'Villa', 'Land']
  },
  COMMERCIAL: {
    label: 'Commercial Properties',
    types: ['Office', 'Shop', 'Warehouse']
  }
};

export const AllPropertyTypes = [
  ...PropertyTypeCategories.APARTMENTS.types,
  ...PropertyTypeCategories.LANDED_PROPERTIES.types,
  ...PropertyTypeCategories.COMMERCIAL.types
];

export const LandSizeUnits = [
  { value: 'sqft', label: 'Square Feet' },
  { value: 'sqm', label: 'Square Meters' },
  { value: 'acres', label: 'Acres' },
  { value: 'hectares', label: 'Hectares' }
];

/**
 * Check if a property type requires land size information
 */
export function requiresLandSize(propertyType: string): boolean {
  return PropertyTypeCategories.LANDED_PROPERTIES.types.includes(propertyType);
}

/**
 * Get the category of a property type
 */
export function getPropertyTypeCategory(propertyType: string): string {
  for (const [categoryKey, category] of Object.entries(PropertyTypeCategories)) {
    if (category.types.includes(propertyType)) {
      return category.label;
    }
  }
  return 'Unknown';
}