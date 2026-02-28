export default function cbseTemplate(student, marksheet, school) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial; margin: 30px; }
          .header { text-align: center; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #000; padding: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${school.logoUrl}" width="80" />
          <h2>${school.name}</h2>
          <p>${school.address}</p>
          <h3>Report Card - ${marksheet.examName}</h3>
        </div>
        <p><b>Name:</b> ${student.name} | <b>Class:</b> ${student.className} | <b>Roll:</b> ${student.rollNo}</p>
        <table class="table">
          <tr><th>Subject</th><th>Max</th><th>Min</th><th>Obtained</th></tr>
          ${marksheet.subjects.map(s => `
            <tr>
              <td>${s.name}</td>
              <td>${s.maxMarks}</td>
              <td>${s.minMarks}</td>
              <td>${s.obtainedMarks}</td>
            </tr>`).join('')}
        </table>
        <p><b>Total:</b> ${marksheet.totalMarks} | <b>Percentage:</b> ${marksheet.percentage}%</p>
        <p><b>Grade:</b> ${marksheet.grade} | <b>Status:</b> ${marksheet.status}</p>
        <p><b>Remarks:</b> ${marksheet.remarks}</p>
      </body>
    </html>
  `;
}
