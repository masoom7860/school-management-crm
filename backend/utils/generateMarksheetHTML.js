import cbseTemplate from "../templates/cbseTemplate.js";
import nurseryTemplate from "../templates/nurseryTemplate.js";
import defaultTemplate from "../templates/defaultTemplate.js";

const templates = { cbse: cbseTemplate, nursery: nurseryTemplate, default: defaultTemplate };

export const generateMarksheetHTML = (school, student, marksheet) => {
  if (school.marksheetTemplate === "custom" && school.customTemplateHtml) {
    return school.customTemplateHtml
      .replace(/{{studentName}}/g, student.name)
      .replace(/{{className}}/g, student.className)
      .replace(/{{examName}}/g, marksheet.examName);
  }

  const template = templates[school.marksheetTemplate] || defaultTemplate;
  return template(student, marksheet, school);
};
