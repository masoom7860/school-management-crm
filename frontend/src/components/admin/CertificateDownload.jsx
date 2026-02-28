import { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import AwardCertificateLayout from "./AwardCertificateLayout";

export default function CertificateDownload({ cert, schoolInfo, logoUrl, moharUrl }) {
  const hiddenRef = useRef(null);

  const generatePDF = async () => {
    try {
      await new Promise((r) => setTimeout(r, 100));
      const element = hiddenRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });

      const imgData = canvas.toDataURL("image/jpeg", 1);
      const pdf = new jsPDF({
        unit: "px",
        format: [canvas.width, canvas.height],
        orientation: "landscape",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${cert.certificateNumber}.pdf`);
    } catch (e) {
      console.error("PDF ERROR:", e);
    }
  };

  return (
    <>
      <button onClick={generatePDF} className="text-green-600">
        ⬇️ Download
      </button>

      {/* Hidden Layout */}
      <div
        ref={hiddenRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "1120px",
          height: "794px",
          padding: "32px",
          background: "#fff",
        }}
      >
        <AwardCertificateLayout
          schoolData={{
            name: schoolInfo?.schoolName,
            address: [
              schoolInfo?.address,
              schoolInfo?.city,
              schoolInfo?.state,
              schoolInfo?.postalCode,
            ]
              .filter(Boolean)
              .join(", "),
            regNo: schoolInfo?.businessDetails?.licenseNumber,
            schoolCode: schoolInfo?.schoolCode,
            principal: schoolInfo?.principalName,
            logoUrl,
          }}
          student={{
            name:
              cert?.studentId?.name ||
              `${cert?.studentId?.firstName || ""} ${
                cert?.studentId?.lastName || ""
              }`.trim(),
            className: cert?.studentId?.classId?.className,
            sectionName: cert?.studentId?.sectionId?.name,
            house: cert?.colorHouse,
          }}
          certificateData={{
            year:
              cert?.year ||
              cert?.sessionId?.yearRange ||
              new Date(cert?.issueDate).getFullYear(),
            eventName: cert?.eventName || cert?.reason || cert?.description,
            awardTitle: cert?.awardTitle,
            eventCoordinator: cert?.eventCoordinator,
            date: new Date(cert?.issueDate).toLocaleDateString(),
            certificateNumber: cert?.certificateNumber,
            principal: schoolInfo?.principalName,
          }}
          images={{ moharUrl }}
        />
      </div>
    </>
  );
}
