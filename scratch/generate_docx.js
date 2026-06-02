const fs = require('fs');
const path = require('path');
const HTMLtoDOCX = require('html-to-docx');

async function createDocx() {
  const htmlFilePath = path.join(__dirname, 'DormEase_Abstract.html');
  const docxFilePath = path.join(__dirname, '..', 'DormEase_Abstract.docx');

  const htmlString = fs.readFileSync(htmlFilePath, 'utf-8');

  // html-to-docx conversion
  const fileBuffer = await HTMLtoDOCX(htmlString, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });

  fs.writeFileSync(docxFilePath, fileBuffer);
  console.log('Successfully created DormEase_Abstract.docx');
}

createDocx().catch(console.error);
