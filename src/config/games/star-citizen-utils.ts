/**
 * Helper utilities for Star Citizen manufacturer data
 */

import manufacturersData from './star-citizen-manufacturers.json';

export interface Manufacturer {
  name: string;
  code: string | null;
  logoFile?: string | null;
  multicolorFile?: string | null;
}

/**
 * Get manufacturer logo URL by manufacturer name
 */
export function getManufacturerLogo(manufacturerName: string): string | null {
  const manufacturer = manufacturersData.manufacturers.find(
    m => m.name === manufacturerName
  );
  // Prefer monochrome logos for better contrast on dark backgrounds
  const logoFile = manufacturer?.logoFile || manufacturer?.multicolorFile;
  if (!logoFile) return null;

  return `${manufacturersData.localBase}${logoFile}`;
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
