
interface CsvData {
  [sheetName: string]: Record<string, any>[];
}

export const generateCsv = (data: CsvData): string => {
  let csvContent = '';
  
  // Process each sheet in the data
  Object.keys(data).forEach((sheetName, index) => {
    const sheetData = data[sheetName];
    
    // Add sheet header if there's more than one sheet
    if (Object.keys(data).length > 1) {
      if (index > 0) csvContent += '\n\n';
      csvContent += `${sheetName}\n`;
    }
    
    if (sheetData.length > 0) {
      // Get headers from first row
      const headers = Object.keys(sheetData[0]);
      csvContent += headers.join(',') + '\n';
      
      // Add rows
      sheetData.forEach(row => {
        const rowValues = headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvContent += rowValues.join(',') + '\n';
      });
    } else {
      csvContent += 'Aucune donnée\n';
    }
  });
  
  return csvContent;
};

export const downloadCsv = (csvContent: string, filename: string): void => {
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add to document, trigger download and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
