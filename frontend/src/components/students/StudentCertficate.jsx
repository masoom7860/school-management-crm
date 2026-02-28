import { useRef } from "react";
    
const SchoolCertificate = () => {
    const certificateRef = useRef();

    const student = {
        name: "Aryan Sharma",
        class: "10th",
        year: "2024-2025",
        date: "08 April 2025",
        headMaster: "Howard Ong",
        mentor: "Neil Tran",
    };

    const handleDownload = async () => {
        const element = certificateRef.current;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("certificate.pdf");
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-6 space-y-4">

            {/* Certificate */}
            <div
                id="certificate"
                ref={certificateRef}
                className="relative bg-white text-center font-serif max-w-4xl w-full border-[12px] border-yellow-400 p-10 shadow-xl mx-auto overflow-hidden"
            >
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-10 h-10 bg-yellow-400 rotate-45" style={{ transform: "translate(-50%, -50%)" }} />
                <div className="absolute top-0 right-0 w-10 h-10 bg-yellow-400 rotate-45" style={{ transform: "translate(50%, -50%)" }} />
                <div className="absolute bottom-0 left-0 w-10 h-10 bg-yellow-400 rotate-45" style={{ transform: "translate(-50%, 50%)" }} />
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-400 rotate-45" style={{ transform: "translate(50%, 50%)" }} />

                {/* Certificate Content */}
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-black tracking-widest">CERTIFICATE</h1>
                    <h2 className="text-xl text-yellow-700 font-semibold mt-2 tracking-widest">OF PASSING OUT</h2>
                    <p className="mt-6 text-gray-800 text-sm tracking-widest uppercase">
                        The following certificate is presented to
                    </p>
                    <h3 className="text-3xl font-bold text-yellow-700 my-4 italic">{student.name}</h3>
                    <p className="text-md max-w-2xl mx-auto text-gray-700 leading-relaxed">
                        This is to certify that <span className="font-bold">{student.name}</span> has successfully passed{" "}
                        <span className="font-bold">Class {student.class}</span> during the academic year{" "}
                        <span className="font-bold">{student.year}</span>. This certificate is awarded in recognition of their
                        academic achievement and completion of school education.
                    </p>

                    <div className="flex justify-between items-center mt-16 px-10">
                        <div className="text-center">
                            <p className="text-sm font-bold">{student.headMaster}</p>
                            <p className="text-xs text-gray-600">HEAD MASTER</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-1 rounded-full border-4 border-yellow-500 bg-yellow-200" />
                            <p className="text-sm font-bold text-black">{student.date}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold">{student.mentor}</p>
                            <p className="text-xs text-gray-600">MENTOR</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Buttons - Hidden during print */}
            <div className="space-x-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                >
                    Print Certificate
                </button>
                <button
                    onClick={handleDownload}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default SchoolCertificate;
