import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";

export default function TemplateBuilder({ schoolId }) {
  const [templates] = useState([
    { id: "default", name: "Default" },
    { id: "cbse-modern", name: "CBSE Modern" },
    { id: "fancy", name: "Fancy" },
    { id: "bordered", name: "Bordered" },
    { id: "simple", name: "Simple" },
    { id: "custom", name: "Custom (HTML + CSS)" }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [assets, setAssets] = useState({
    headerImage: "",
    footerImage: "",
    signaturePrincipal: "",
    signatureDirector: "",
    backgroundFrame: "",
    stampImage: ""
  });

  const [school, setSchool] = useState(null);

  // Fetch school data
  useEffect(() => {
    api.get(`/api/schoolS/${schoolId}`).then((res) => {
      setSchool(res.data.data);
      setSelectedTemplate(res.data.data.marksheetTemplate);
      setHtml(res.data.data.customTemplateHtml || "");
      setCss(res.data.data.customStyles || "");
      setAssets({
        headerImage: "",
        footerImage: "",
        signaturePrincipal: "",
        signatureDirector: "",
        backgroundFrame: "",
        stampImage: "",
        ...(res.data.data.assets || {})
      });
    });
  }, [schoolId]);

  const updateTemplate = async () => {
    await api.patch(`/api/schoolS/${schoolId}/template`, {
      marksheetTemplate: selectedTemplate,
      customTemplateHtml: html,
      customStyles: css,
      assets
    });

    alert("Template updated successfully!");
  };

  const handleAssetChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await api.post(`/api/upload/image`, formData);
    const url = uploadRes.data.url;

    setAssets({ ...assets, [field]: url });
  };

  return (
    <div className="p-5 grid grid-cols-2 gap-5">
      
      {/* LEFT SIDE — Editor Panel */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Template Builder</h2>

        {/* Template selector */}
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="border p-2 rounded w-full"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Show HTML + CSS only for custom template */}
        {selectedTemplate === "custom" && (
          <>
            <div>
              <label className="font-semibold">Custom HTML</label>
              <textarea
                className="border p-2 rounded w-full h-60"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Custom CSS</label>
              <textarea
                className="border p-2 rounded w-full h-40"
                value={css}
                onChange={(e) => setCss(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Image upload fields */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Template Assets</h3>

          {Object.keys(assets).map((key) => (
            <div key={key}>
              <label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="file"
                className="block"
                onChange={(e) => handleAssetChange(e, key)}
              />
              {assets[key] && (
                <img src={assets[key]} alt="" className="h-20 mt-1 rounded border" />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={updateTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Save Template
        </button>
      </div>

      
      {/* RIGHT SIDE — LIVE PREVIEW */}
      <div>
        <h2 className="text-xl font-bold mb-3">Live Preview</h2>

        <div className="border shadow-lg p-5 bg-white min-h-[500px] overflow-auto">
          <style>{css}</style>
          <div dangerouslySetInnerHTML={{ __html: html }}></div>
        </div>
      </div>

    </div>
  );
}
