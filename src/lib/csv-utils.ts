import Papa from 'papaparse';

// Generic CSV export function
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) => {
  let csvData: any[] = data;
  
  if (columns) {
    csvData = data.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        row[col.label] = item[col.key];
      });
      return row;
    });
  }

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Generic CSV import function
export const importFromCSV = <T>(
  file: File,
  onComplete: (data: T[]) => void,
  onError?: (error: string) => void
) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        onError?.(results.errors[0].message);
        return;
      }
      onComplete(results.data as T[]);
    },
    error: (error) => {
      onError?.(error.message);
    }
  });
};

// Validate CSV data structure
export const validateCSVData = <T>(
  data: any[],
  requiredFields: (keyof T)[],
  validator?: (item: any) => T | null
): { valid: T[]; invalid: any[] } => {
  const valid: T[] = [];
  const invalid: any[] = [];

  data.forEach((item, index) => {
    // Check required fields
    const missingFields = requiredFields.filter(field => 
      !item.hasOwnProperty(field) || item[field] === null || item[field] === undefined || item[field] === ''
    );

    if (missingFields.length > 0) {
      invalid.push({ ...item, _error: `Missing required fields: ${missingFields.join(', ')}`, _row: index + 1 });
      return;
    }

    // Run custom validator if provided
    if (validator) {
      const validatedItem = validator(item);
      if (validatedItem) {
        valid.push(validatedItem);
      } else {
        invalid.push({ ...item, _error: 'Failed validation', _row: index + 1 });
      }
    } else {
      valid.push(item as T);
    }
  });

  return { valid, invalid };
};
