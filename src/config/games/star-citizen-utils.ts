/**
 * Helper utilities for Star Citizen manufacturer data
 */

import manufacturersData from './star-citizen-manufacturers.json';

export interface Manufacturer {
  name: string;
  code: string | null;
  logoFile?: string | null;
}

/**
 * Get manufacturer logo URL by manufacturer name
 */
export function getManufacturerLogo(manufacturerName: string): string | null {
  const manufacturer = manufacturersData.manufacturers.find(
    m => m.name === manufacturerName
  );
  if (!manufacturer?.logoFile) return null;

  return `${manufacturersData.localBase}${manufacturer.logoFile}`;
}

/**
 * Get all manufacturers
 */
export function getAllManufacturers(): Manufacturer[] {
  return manufacturersData.manufacturers;
}

/**
 * Get manufacturer by name
 */
export function getManufacturer(manufacturerName: string): Manufacturer | null {
  return manufacturersData.manufacturers.find(
    m => m.name === manufacturerName
  ) || null;
}
