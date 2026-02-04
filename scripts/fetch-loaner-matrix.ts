/**
 * Scrape and parse the Star Citizen Loaner Ship Matrix from RSI Support
 * This script fetches the latest loaner data and generates SQL to populate the database
 */

import * as cheerio from 'cheerio';

interface LoanerMapping {
  pledgedShip: string;
  loaners: Array<{
    ship: string;
    type: 'primary' | 'arena_commander' | 'temporary';
    notes?: string;
  }>;
}

const RSI_LOANER_URL = 'https://support.robertsspaceindustries.com/hc/en-us/articles/360003093114-Loaner-Ship-Matrix';

/**
 * Fetch and parse the RSI loaner matrix page
 */
async function fetchLoanerMatrix(): Promise<LoanerMapping[]> {
  console.log('Fetching loaner matrix from RSI...');
  
  const response = await fetch(RSI_LOANER_URL);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const mappings: LoanerMapping[] = [];
  const tableRows: string[][] = [];
  
  // Find the loaner matrix table
  // The table is embedded in the page, look for table rows with ship data
  $('table tr').each((i, row) => {
    const cells: string[] = [];
    $(row).find('td, th').each((j, cell) => {
      const text = $(cell).text().trim();
      if (text) cells.push(text);
    });
    if (cells.length >= 2) {
      tableRows.push(cells);
    }
  });
  
  // If no table found, try parsing from the markdown-style table in the text
  if (tableRows.length === 0) {
    const bodyText = $('article, .article-body, main').text();
    const lines = bodyText.split('\n');
    
    for (const line of lines) {
      // Look for lines with pipe delimiters: | Ship Name | Loaners |
      if (line.includes('|') && !line.includes('---')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        if (parts.length >= 2 && parts[0] && parts[1]) {
          // Skip header rows
          if (!parts[0].toLowerCase().includes('ship') && !parts[0].toLowerCase().includes('name')) {
            tableRows.push(parts);
          }
        }
      }
    }
  }
  
  console.log(`Found ${tableRows.length} loaner mappings`);
  
  // Parse each row
  for (const [pledgedShip, loanersText] of tableRows) {
    if (!pledgedShip || !loanersText) continue;
    
    // Skip header rows
    if (pledgedShip.toLowerCase().includes('ship') || pledgedShip.toLowerCase().includes('name')) {
      continue;
    }
    
    const loaners: LoanerMapping['loaners'] = [];
    
    // Parse the loaners (comma-separated)
    const loanerShips = loanersText.split(',').map(s => s.trim());
    
    for (const loanerShip of loanerShips) {
      if (!loanerShip) continue;
      
      // Determine loaner type from context
      let type: 'primary' | 'arena_commander' | 'temporary' = 'primary';
      let notes: string | undefined;
      
      // Check for special cases mentioned in notes
      if (loanerShip.toLowerCase().includes('arena') || loanerShip.toLowerCase().includes('ac')) {
        type = 'arena_commander';
      }
      
      // Clean ship name (remove parenthetical notes)
      const cleanName = loanerShip.replace(/\s*\([^)]*\)/g, '').trim();
      
      loaners.push({ ship: cleanName, type, notes });
    }
    
    if (loaners.length > 0) {
      mappings.push({ pledgedShip, loaners });
    }
  }
  
  return mappings;
}

/**
 * Generate SQL INSERT statements from loaner mappings
 */
function generateSQL(mappings: LoanerMapping[]): string {
  const sqlStatements: string[] = [
    '-- Auto-generated loaner ship matrix from RSI',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Source: ${RSI_LOANER_URL}`,
    '',
    'BEGIN;',
    '',
    '-- Clear existing loaner matrix',
    'DELETE FROM sc_loaner_matrix;',
    '',
    '-- Insert loaner mappings',
  ];
  
  for (const mapping of mappings) {
    for (const loaner of mapping.loaners) {
      const notes = loaner.notes ? `'${loaner.notes.replace(/'/g, "''")}'` : 'NULL';
      sqlStatements.push(
        `INSERT INTO sc_loaner_matrix (pledged_ship, loaner_ship, loaner_type, notes) ` +
        `VALUES ('${mapping.pledgedShip}', '${loaner.ship}', '${loaner.type}', ${notes});`
      );
    }
  }
  
  sqlStatements.push('', 'COMMIT;');
  
  return sqlStatements.join('\n');
}

/**
 * Generate TypeScript type definitions for ship names
 */
function generateTypes(mappings: LoanerMapping[]): string {
  const allShips = new Set<string>();
  
  for (const mapping of mappings) {
    allShips.add(mapping.pledgedShip);
    for (const loaner of mapping.loaners) {
      allShips.add(loaner.ship);
    }
  }
  
  const sortedShips = Array.from(allShips).sort();
  
  return `// Auto-generated Star Citizen ship names
// Generated: ${new Date().toISOString()}
// Source: ${RSI_LOANER_URL}

export type StarCitizenShipName = 
${sortedShips.map(ship => `  | '${ship}'`).join('\n')};

export const SC_SHIPS: readonly StarCitizenShipName[] = [
${sortedShips.map(ship => `  '${ship}',`).join('\n')}
] as const;
`;
}

/**
 * Main execution
 */
async function main() {
  try {
    const mappings = await fetchLoanerMatrix();
    
    // Generate SQL
    const sql = generateSQL(mappings);
    const sqlPath = './supabase/migrations/070_populate_sc_loaner_matrix.sql';
    await Bun.write(sqlPath, sql);
    console.log(`✓ Generated SQL: ${sqlPath}`);
    
    // Generate types
    const types = generateTypes(mappings);
    const typesPath = './src/types/sc-ships-loaner.ts';
    await Bun.write(typesPath, types);
    console.log(`✓ Generated types: ${typesPath}`);
    
    console.log(`\nProcessed ${mappings.length} pledged ships`);
    const totalLoaners = mappings.reduce((sum, m) => sum + m.loaners.length, 0);
    console.log(`Total loaner mappings: ${totalLoaners}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
