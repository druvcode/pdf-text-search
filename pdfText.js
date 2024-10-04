import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pdf } from 'pdf-to-img';
import Tesseract from 'tesseract.js';

const pdfDir = './pdfs';
const searchTerm = 'dhruv'; // Change this to the term you're searching for

async function convertPdfToImages(pdfPath) {
  const images = [];
  const document = await pdf(pdfPath, { scale: 3 });
  let counter = 1;
  for await (const image of document) {
    const imagePath = path.join(pdfDir, `page${counter}.png`);
    await fs.writeFile(imagePath, image);
    images.push(imagePath);
    counter++;
  }
  return images;
}

async function extractTextFromImage(imagePath) {
  const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
  return text;
}

async function searchInPdf(pdfPath) {
  const imagePaths = await convertPdfToImages(pdfPath);
  for (const imagePath of imagePaths) {
    const text = await extractTextFromImage(imagePath);
    if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
  }
  return false;
}

async function searchInAllPdfs() {
    const files = await fs.readdir(pdfDir);

    // Filter PDF files
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
  
    // Filter image files (add more extensions as needed)
    const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));
  
  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(pdfDir, pdfFile);
    const found = await searchInPdf(pdfPath);
    if (found) {
      console.log(`The term "${searchTerm}" was found in ${pdfFile}`);
    }
  }

  //function for search in image
  async function searchInImage(imagePath) {
    const text = await extractTextFromImage(imagePath);
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  }


    // Search in Images
    for (const imageFile of imageFiles) {
        const imagePath = path.join(pdfDir, imageFile);
        const found = await searchInImage(imagePath);
        if (found) {
          console.log(`The term "${searchTerm}" was found in Image: ${imageFile}`);
        }
      }
}

searchInAllPdfs().catch(console.error);
