import pdf from "html-pdf";

export const generatePDF = (html, filename) => {
  return new Promise((resolve, reject) => {
    pdf.create(html, { format: "A4" }).toFile(`./uploads/${filename}.pdf`, (err, res) => {
      if (err) reject(err);
      else resolve(res.filename);
    });
  });
};
