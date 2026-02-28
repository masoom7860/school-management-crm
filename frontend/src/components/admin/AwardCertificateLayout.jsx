
// The TrophySVG is retained but slightly adjusted for the sidebar
const TrophySVG = ({ size = 28, fill = "#ffffff", opacity = 0.6 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill={fill} style={{ opacity }}>
    <path d="M52 8h-6V6a2 2 0 0 0-2-2H20a2 2 0 0 0-2 2v2h-6a2 2 0 0 0-2 2v6c0 7.18 5.82 13 13 13h1.43A14.97 14.97 0 0 0 30 35.7V42h-6a2 2 0 0 0-2 2v4h20v-4a2 2 0 0 0-2-2h-6v-6.3A14.97 14.97 0 0 0 39.57 29H41c7.18 0 13-5.82 13-13v-6a2 2 0 0 0-2-2ZM13 16v-4h5v7c0 2.53.77 4.88 2.09 6.82C16.07 25.04 13 20.9 13 16Zm38 0c0 4.9-3.07 9.04-7.09 9.82A10.98 10.98 0 0 0 46 19v-7h5v4Z" />
  </svg>
);

export default function AwardCertificateLayout({ schoolData = {}, student = {}, certificateData = {}, images = {} }) {
  // Color variables based on the image provided
  const primaryBlue = "#0b53b0"; // The color for text and borders
  const sidebarBlue = "#004787"; // A slightly darker, richer blue for the sidebar background

  const toOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const formatClassName = (raw) => {
    if (raw === undefined || raw === null) return "";
    const m = String(raw).match(/\d+/);
    if (m) {
      const num = parseInt(m[0], 10);
      if (!isNaN(num)) return toOrdinal(num);
    }
    return String(raw);
  };

  // Helper for safe data display (using an empty string or a dash for blanks)
  const safe = (v, dash = "") => (v !== undefined && v !== null && String(v).trim() !== "" ? v : dash);

  // --- Components for the Design ---

  // Watermark Trophy - Now includes space for a logo or a simple text.
  const WatermarkTrophy = () => (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      zIndex: 1, // Ensure watermark is behind text
    }}>
      <div style={{ position: "relative", width: "70%", height: "70%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", opacity: 0.15 }}>
          <path fill={primaryBlue} d="M52 8h-6V6a2 2 0 0 0-2-2H20a2 2 0 0 0-2 2v2h-6a2 2 0 0 0-2 2v6c0 7.18 5.82 13 13 13h1.43A14.97 14.97 0 0 0 30 35.7V42h-6a2 2 0 0 0-2 2v4h20v-4a2 2 0 0 0-2-2h-6v-6.3A14.97 14.97 0 0 0 39.57 29H41c7.18 0 13-5.82 13-13v-6a2 2 0 0 0-2-2ZM13 16v-4h5v7c0 2.53.77 4.88 2.09 6.82C16.07 25.04 13 20.9 13 16Zm38 0c0 4.9-3.07 9.04-7.09 9.82A10.98 10.98 0 0 0 46 19v-7h5v4Z" />
        </svg>
      </div>
    </div>
  );

  // Helper component for the fill-in lines
  const Underline = ({ text, width = "120px", fontWeight = 800, textTransform = "uppercase" }) => (
    <span style={{
      display: "inline-block",
      textAlign: "center",
      minWidth: width,
      borderBottom: `1px solid ${primaryBlue}`,
      lineHeight: "1.2em",
      fontWeight: fontWeight,
      textTransform: textTransform,
      color: primaryBlue,
      padding: "0 4px",
    }}>
      {text}
    </span>
  );

  // --- Main Layout ---

  return (
    <div style={{
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      background: "#ffffff",
      // Changed font to one closer to a classic serif certificate
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: primaryBlue,
      position: "relative",
      overflow: "hidden",
      padding: "20px", // Add some overall padding
    }}>

      {/* 1. Left Sidebar (Dark Blue) */}
      <div style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: "12%", // Wider sidebar
        background: sidebarBlue,
        zIndex: 2, // Ensure it's on top of any border lines
      }}>
        <div style={{ position: "absolute", top: "4%", bottom: "4%", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          {Array.from({ length: 12 }).map((_, idx) => (
            <TrophySVG key={idx} size={32} opacity={0.8} />
          ))}
        </div>
      </div>

      {/* 2. Right Sidebar (Same as left, but slightly lighter blue to mimic the gradient/shadow in the image) */}
      <div style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        width: "3%", // Much smaller right-side decoration
        background: primaryBlue,
        zIndex: 2,
      }}>
        <div style={{ position: "absolute", top: "4%", bottom: "4%", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          {Array.from({ length: 12 }).map((_, idx) => (
            <TrophySVG key={idx} size={18} opacity={0.7} />
          ))}
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div style={{
        position: "absolute",
        left: "14%", // Pushed right by the sidebar
        right: "5%",
        top: "3%",
        bottom: "3%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        zIndex: 3, // Ensure content is above sidebars and watermark
      }}>
        <WatermarkTrophy />

        {/* School Header */}
        <div style={{ width: "100%" }}>
          {/* Logo (Optional) - Placed outside the watermark area */}
          {/* {schoolData.logoUrl && (
            <img src={schoolData.logoUrl} alt="School Logo" style={{ width: "60px", height: "60px", objectFit: "contain", marginBottom: "5px" }} />
          )} */}

          {/* School Name (Largest font) */}
          <div style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {safe(schoolData.name, "FAIZABAD PUBLIC SCHOOL")}
          </div>
          {/* Address Line (Slightly smaller, centered) */}
          <div style={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "0.08em", marginTop: "0.2rem" }}>
            {safe(schoolData.address, "Darabganj, Mumtaznagar, Lko. Road, Ayodhya (Faizabad) 224001")}
          </div>

          {/* Registration/Code Info (Split to left/right on one line) */}
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "1rem", fontSize: "0.9rem", fontWeight: 600, padding: "0 10%" }}>
            <div>School Reg. No: <span style={{ fontWeight: 700 }}>{safe(schoolData.regNo, "2130468")}</span></div>
            <div>School Code: <span style={{ fontWeight: 700 }}>{safe(schoolData.schoolCode, "070366")}</span></div>
          </div>
        </div>

        {/* Certificate Title (Stylized) */}
        <div style={{
          marginTop: "1.2rem",
          fontSize: "3.2rem",
          fontWeight: 400, // Use a lighter weight or specific font for a script-like look
          letterSpacing: "0.05em",
          color: "#8b0000", // A soft reddish/maroon color for accent
          fontFamily: "'Times New Roman', serif", // Keep it a classic serif
          zIndex: 4,
        }}>
          Certificate of Award
        </div>

        {schoolData.logoUrl && (
          <img crossOrigin="anonymous" src={schoolData.logoUrl} alt="School Logo" style={{ width: "80px", height: "80px", objectFit: "contain", marginTop: "0.8rem" }} />
        )}

        {/* Introductory Text */}
        <div style={{ marginTop: "1.5rem", fontSize: "1.5rem", letterSpacing: "0.02em", lineHeight: "1.6" }}>
          The Certificate of
          <br /> Award is proudly Presented to:
        </div>

        {/* Student Name */}
        <div style={{
          marginTop: "1.5rem",
          fontSize: "1.1rem",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          borderBottom: `1px solid ${primaryBlue}`, // Underline the name
          paddingBottom: "5px",
          width: "50%",
        }}>
          {safe(student.name || [student.firstName, student.lastName].filter(Boolean).join(" "), "STUDENT NAME")}
        </div>

        {/* Dynamic Text / Fill-in Blanks */}
        <div style={{
          marginTop: "0.8rem",
          fontSize: "1rem",
          fontWeight: 500,
          lineHeight: "2.5rem",
          maxWidth: "80%",
          textAlign: "center",
          whiteSpace: "nowrap",
          paddingBottom: "5px",
          // padding:"0px"
        }}>
          Class: <Underline text={safe(formatClassName(student.className), "10th")} width="90px" />
          &nbsp;&nbsp;&nbsp;Section: <Underline text={safe(student.sectionName, "A")} width="70px" />
          &nbsp;&nbsp;&nbsp;House: <Underline text={safe(student.house, "HOUSE")} width="130px" />
          <br />
          in the year: <Underline text={safe(certificateData.year, "2024")} width="90px" />
          &nbsp;&nbsp;&nbsp;for: <Underline text={safe(certificateData.awardTitle, "Academics Excellence")} width="320px" />
          <br />
          in: <Underline text={safe(certificateData.eventName, "Annual Day Competition")} width="420px" />
          {/* Event Co-ordinator: <Underline text={safe(certificateData.eventCoordinator, "Coordinator Name")} width="320px" /> */}
        </div>

        {/* Footer Signatures */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "1%", padding: "0 2%" }}>
          <div style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            alignItems: "end",
            gap: "1rem",
            fontSize: "1.0rem",
            fontWeight: 600,
          }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 800, marginBottom: "0.2rem" }}>{safe(certificateData.eventCoordinator)}</div>
              {/* <div style={{ borderTop: `1px solid ${primaryBlue}`, height: "1px", width: "80%", margin: "0 auto 0.2rem 0" }}></div> */}
              <div style={{ letterSpacing: "0.05em" }}>Event Co-ordinator</div>
            </div>

            <div style={{ textAlign: "center" }}>
              {/* Signature Line */}
              {/* <div style={{ borderTop: `1px solid ${primaryBlue}`, height: "1px", width: "80%", margin: "0 auto 0.2rem auto" }}></div> */}
              <div style={{ letterSpacing: "0.05em" }}>Date: <span style={{ fontWeight: 800 }}>{safe(certificateData.date)}</span></div>
            </div>

            <div style={{ position: "relative", textAlign: "right" }}>
              {/* Stamp/Seal - Placed above the line */}
              {images.moharUrl ? (
                <img
                  crossOrigin="anonymous"
                  src={images.moharUrl}
                  alt="Stamp"
                  style={{ position: "absolute", right: 0, bottom: "1.5rem", width: "70px", height: "70px", objectFit: "contain", opacity: 0.8, pointerEvents: "none" }}
                />
              ) : null}
              {/* <div style={{ fontWeight: 800, marginBottom: "0.2rem" }}>{safe(schoolData.principal)}</div> */}
              {/* <div style={{ borderTop: `1px solid ${primaryBlue}`, height: "1px", width: "80%", margin: "0 0 0.2rem auto" }}></div> */}
              <div style={{ letterSpacing: "0.05em" }}>Principal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}