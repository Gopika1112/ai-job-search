import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

console.log('pdf export type:', typeof pdf);
console.log('pdf export keys:', Object.keys(pdf));

async function test() {
  const dummyBuffer = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Contents 4 0 R>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 72 712 Td (Hello World) Tj ET\nendstream\nendobj\ntrailer<</Root 1 0 R>>\n%%EOF');
  try {
    const parseFn = typeof pdf === 'function' ? pdf : pdf.default;
    console.log('Using parseFn type:', typeof parseFn);
    
    const data = await parseFn(dummyBuffer);
    console.log('Successfully parsed PDF text:', data.text);
    if (data.text.includes('Hello World')) {
      console.log('Verification passed!');
    } else {
      console.log('Verification failed: Text not found in output.');
    }
  } catch (error) {
    console.error('Extraction failed:', error);
    console.error(error.stack);
  }
}

test();
