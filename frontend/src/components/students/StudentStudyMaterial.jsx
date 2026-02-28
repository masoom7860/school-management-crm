import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Video, Download, BookOpen } from 'lucide-react';
import { getStudentMaterials } from '../../api/studyMaterialApi';

const iconForPath = (path) => {
  const ext = (path?.split('.').pop() || '').toLowerCase();
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return <FileText className="w-6 h-6 text-red-500" />;
  if (["mp4", "mov", "avi", "mkv"].includes(ext)) return <Video className="w-6 h-6 text-red-500" />;
  return <BookOpen className="w-6 h-6 text-gray-500" />;
};

const StudentStudyMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || '', []);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getStudentMaterials();
        setMaterials(list);
      } catch (e) {
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const absUrl = (p) => {
    if (!p) return '#';
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith('/')) return `${baseUrl}${p}`;
    return `${baseUrl}/${p}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">📚 Study Materials</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {materials.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition duration-300 border-t-4 border-red-500"
            >
              <div className="flex items-center gap-3 mb-4">
                {iconForPath(m.file)}
                <h2 className="text-xl font-semibold text-gray-800">{m.subject || 'Subject'}</h2>
              </div>
              <div className="space-y-1 mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">Title:</span> {m.title}
                </p>
                {m.type && (
                  <p className="text-gray-700">
                    <span className="font-medium">Type:</span> {m.type}
                  </p>
                )}
                {m.dueDate && (
                  <p className="text-gray-700">
                    <span className="font-medium">Due by:</span> {new Date(m.dueDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Description:</span> {m.description || '-'}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-medium">Uploaded On:</span> {new Date(m.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={absUrl(m.file)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 mt-auto w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                <Download className="w-4 h-4" /> Download
              </a>
            </div>
          ))}
          {materials.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No study materials yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentStudyMaterial;
