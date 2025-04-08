
// Simple PDF export utility for MEREF statistics
// In a real application, you would use a library like jsPDF, pdfmake, etc.

interface PdfData {
  title: string;
  subtitle: string;
  date: string;
  sections: PdfSection[];
}

interface PdfSection {
  title: string;
  data?: { label: string; value: string | number }[];
  table?: PdfTable;
  alerts?: PdfAlert[];
}

interface PdfTable {
  headers: string[];
  rows: string[][];
}

interface PdfAlert {
  title: string;
  message: string;
  detail?: string;
}

// This is a placeholder function. In a real application, you would use a 
// proper PDF generation library to create the actual PDF.
export const generatePdf = (data: PdfData, filename: string): void => {
  console.log('Generating PDF with data:', data);
  
  // For now, we'll just create a simple HTML representation and print it
  // In a real application, use a proper PDF library
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les popups pour imprimer le PDF');
    return;
  }
  
  // Basic styling for the print window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        h1 {
          color: #0D6A51;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
        }
        .date {
          font-size: 12px;
          color: #888;
          margin-top: 5px;
        }
        .section {
          margin-bottom: 30px;
        }
        h2 {
          color: #0D6A51;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .data-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .data-label {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .alert {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .alert-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .alert-detail {
          font-size: 12px;
          color: #666;
        }
        @media print {
          body {
            font-size: 12px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button onclick="window.print()">Imprimer le PDF</button>
      </div>
      
      <div class="header">
        <h1>${data.title}</h1>
        <div class="subtitle">${data.subtitle}</div>
        <div class="date">Généré le: ${data.date}</div>
      </div>
  `);
  
  // Add each section
  data.sections.forEach(section => {
    printWindow.document.write(`
      <div class="section">
        <h2>${section.title}</h2>
    `);
    
    // Add data items if present
    if (section.data) {
      section.data.forEach(item => {
        printWindow.document.write(`
          <div class="data-item">
            <span class="data-label">${item.label}:</span>
            <span>${item.value}</span>
          </div>
        `);
      });
    }
    
    // Add table if present
    if (section.table) {
      printWindow.document.write('<table>');
      
      // Table headers
      printWindow.document.write('<thead><tr>');
      section.table.headers.forEach(header => {
        printWindow.document.write(`<th>${header}</th>`);
      });
      printWindow.document.write('</tr></thead>');
      
      // Table rows
      printWindow.document.write('<tbody>');
      section.table.rows.forEach(row => {
        printWindow.document.write('<tr>');
        row.forEach(cell => {
          printWindow.document.write(`<td>${cell}</td>`);
        });
        printWindow.document.write('</tr>');
      });
      printWindow.document.write('</tbody></table>');
    }
    
    // Add alerts if present
    if (section.alerts) {
      section.alerts.forEach(alert => {
        printWindow.document.write(`
          <div class="alert">
            <div class="alert-title">${alert.title}</div>
            <div>${alert.message}</div>
            ${alert.detail ? `<div class="alert-detail">${alert.detail}</div>` : ''}
          </div>
        `);
      });
    }
    
    printWindow.document.write('</div>');
  });
  
  printWindow.document.write(`
      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <p>Pour télécharger en PDF, utilisez l'option "Imprimer en PDF" de votre navigateur</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};

// Function to download the PDF (placeholder for now)
export const downloadPdf = (data: PdfData, filename: string): void => {
  generatePdf(data, filename);
};
