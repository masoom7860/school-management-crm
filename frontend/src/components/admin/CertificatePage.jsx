import { useEffect, useState } from "react";
import { fetchCertificatesBySchool, deleteCertificate } from "../../api/certificateApi";
import CertificateForm from "./CertificateForm";
import toast from "react-hot-toast";
import { getSchoolImageByType } from "../../api/schoolImageApi";
import AwardCertificateLayout from "./AwardCertificateLayout";
import axiosInstance from "../../api/axiosInstance";
import CertificateDownload from "./CertificateDownload";

export default function CertificatePage() {
  const schoolId = localStorage.getItem("schoolId");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activePreviewCert, setActivePreviewCert] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [moharUrl, setMoharUrl] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetchCertificatesBySchool(schoolId);
      const list = res?.success ? res.data : Array.isArray(res) ? res : [];
      setCertificates(list);
    } catch (error) {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteCertificate(id);
      toast.success("Certificate deleted");
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // Load School Images
  useEffect(() => {
    const loadImages = async () => {
      if (!schoolId) return;
      const [logo, mohar] = await Promise.all([
        getSchoolImageByType(schoolId, "organizationLogo"),
        getSchoolImageByType(schoolId, "mohar"),
      ]);

      setLogoUrl(logo?.imageUrl ? `${BASE_URL}/${logo.imageUrl}` : "");
      setMoharUrl(mohar?.imageUrl ? `${BASE_URL}/${mohar.imageUrl}` : "");
    };

    loadImages();
  }, [schoolId]);

  // Load School Info
  useEffect(() => {
    const loadSchool = async () => {
      try {
        const res = await axiosInstance.get(`/registerSchool/get/${schoolId}`);
        setSchoolInfo(res?.data?.school || null);
      } catch (e) {
        setSchoolInfo(null);
      }
    };
    loadSchool();
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) fetchCertificates();
  }, [schoolId]);

  if (!schoolId)
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border p-4 rounded">School ID missing</div>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">🎓 Certificate Management</h2>

      <CertificateForm schoolId={schoolId} onSuccess={fetchCertificates} />

      <hr className="my-6" />

      {/* On-Screen Preview Modal */}
      {activePreviewCert && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="relative bg-white rounded shadow-xl max-w-full" style={{ width: 1120 }}>
            <button
              onClick={() => setActivePreviewCert(null)}
              className="absolute -top-3 -right-3 bg-white shadow rounded-full p-2"
            >
              ✕
            </button>

            <div style={{ width: 1120, height: 794, padding: 32 }} className="font-serif">
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
                  logoUrl: logoUrl,
                }}
                student={{
                  name:
                    activePreviewCert?.studentId?.name ||
                    `${activePreviewCert?.studentId?.firstName || ""} ${
                      activePreviewCert?.studentId?.lastName || ""
                    }`.trim(),
                  className:
                    activePreviewCert?.studentId?.classId?.className ||
                    activePreviewCert?.className,
                  sectionName:
                    activePreviewCert?.studentId?.sectionId?.name ||
                    activePreviewCert?.studentId?.sectionName,
                  house: activePreviewCert?.colorHouse,
                }}
                certificateData={{
                  year:
                    activePreviewCert?.year ||
                    activePreviewCert?.sessionId?.yearRange ||
                    new Date(activePreviewCert?.issueDate).getFullYear(),
                  eventName:
                    activePreviewCert?.eventName ||
                    activePreviewCert?.reason ||
                    activePreviewCert?.description,
                  awardTitle: activePreviewCert?.awardTitle,
                  eventCoordinator: activePreviewCert?.eventCoordinator,
                  date: new Date(activePreviewCert?.issueDate).toLocaleDateString(),
                  certificateNumber: activePreviewCert?.certificateNumber,
                  principal: schoolInfo?.principalName,
                }}
                images={{ moharUrl }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Certificate List */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">All Certificates</h3>

        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Certificate No.</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3">Section</th>
                  <th className="px-6 py-3">Session</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {certificates.map((cert) => (
                  <tr key={cert._id}>
                    <td className="px-6 py-4">{cert.certificateNumber}</td>
                    <td className="px-6 py-4">{cert.type}</td>
                    <td className="px-6 py-4">
                      {cert.studentId?.name ||
                        `${cert.studentId?.firstName || ""} ${
                          cert.studentId?.lastName || ""
                        }`.trim()}
                    </td>
                    <td className="px-6 py-4">{cert.studentId?.classId?.className}</td>
                    <td className="px-6 py-4">{cert.studentId?.sectionId?.name}</td>
                    <td className="px-6 py-4">
                      {cert.sessionId?.yearRange ||
                        new Date(cert.issueDate).getFullYear()}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => setActivePreviewCert(cert)}
                        className="text-blue-600"
                      >
                        👁 Preview
                      </button>

                      {/* Download is now separate component */}
                      <CertificateDownload
                        cert={cert}
                        schoolInfo={schoolInfo}
                        logoUrl={logoUrl}
                        moharUrl={moharUrl}
                      />

                      <button
                        onClick={() => handleDelete(cert._id)}
                        className="text-red-600"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
