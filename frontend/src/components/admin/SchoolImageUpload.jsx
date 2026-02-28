import React, { useEffect, useState } from "react";
import { Upload, Button, message, Card, Row, Col, Popconfirm, Select, Space, Spin, Empty } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosInstance from "../../api/axiosInstance";

const { Option } = Select;

const imageTypes = [
  "organizationLogo",
  "profilePhoto",
  "certificateBackground",
  "mohar",
  "boardLogo",
  "staffCard",
  "studentCard",
  "marksheetBackground",
];

// Define display dimensions per image type so cards match the intended aspect ratios
// These are UI display sizes (in px), not original file requirements
const TYPE_DIMENSIONS = {
  organizationLogo: { width: 240, height: 240 }, // square
  profilePhoto: { width: 180, height: 240 }, // 3:4 portrait
  certificateBackground: { width: 420, height: 297 }, // A4 landscape ratio ~1.414
  mohar: { width: 180, height: 180 }, // square stamp
  boardLogo: { width: 240, height: 240 }, // square board logo
  staffCard: { width: 336, height: 212 }, // ID card ratio ~1.586
  studentCard: { width: 336, height: 212 }, // ID card ratio ~1.586
  marksheetBackground: { width: 297, height: 420 }, // A4 portrait ratio ~0.707
};

// Fallback dimensions if type not recognized
const DEFAULT_DIMENSIONS = { width: 320, height: 200 };

const SchoolImageManagement = ({ schoolId }) => {
  const [images, setImages] = useState([]);
  const [selectedType, setSelectedType] = useState(imageTypes[0]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Vite environment variable
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch images
  const fetchImages = async () => {
    try {
      setListLoading(true);
      const res = await axiosInstance.get(`/api/school-images/${schoolId}`);
      setImages(res.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch images");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [schoolId]);

  // Handle file selection
  const handleFileChange = (file) => {
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // ✅ Create preview URL
    return false; // prevent auto-upload
  };

  // Upload / Update image
  const handleUpload = async () => {
    if (!file) return message.warning("Please select a file to upload");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosInstance.post(
        `/api/school-images/${schoolId}/${selectedType}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      message.success(res.data.message);
      setFile(null);
      setPreviewUrl(null); // clear preview
      fetchImages(); // Auto-refresh after upload
    } catch (err) {
      console.error(err);
      message.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview size based on selected image type
  const previewDims = TYPE_DIMENSIONS[selectedType] || DEFAULT_DIMENSIONS;

  // Delete image
  const handleDelete = async (type) => {
    setLoading(true);
    try {
      const res = await axiosInstance.delete(`/api/school-images/${schoolId}/${type}`);
      message.success(res.data.message);
      fetchImages(); // Auto-refresh after delete
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="Upload / Update School Image" style={{ marginBottom: 20 }}>
        <Space wrap size="middle" style={{ width: "100%" }}>
          <Select
            value={selectedType}
            onChange={setSelectedType}
            style={{ minWidth: 220, width: "100%", maxWidth: 280 }}
          >
            {imageTypes.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
          <Upload
            beforeUpload={handleFileChange}
            maxCount={1}
            onRemove={() => { setFile(null); setPreviewUrl(null); }}
            accept="image/*"
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleUpload}
            loading={loading}
            disabled={!file}
          >
            Upload / Update
          </Button>
        </Space>

        {/* ✅ Preview of selected file */}
        {previewUrl && (
          <div style={{ marginTop: 16, width: "100%" }}>
            <p className="text-gray-600">Preview:</p>
            <div
              style={{
                width: "100%",
                maxWidth: 520,
                aspectRatio: `${previewDims.width} / ${previewDims.height}`,
                background: "#fafafa",
                borderRadius: 8,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        )}
      </Card>

      <Spin spinning={listLoading}>
        {images.length === 0 ? (
          <Empty description="No images uploaded yet" />
        ) : (
          <Row gutter={[16, 16]}>
            {images.map((img) => {
              const dims = TYPE_DIMENSIONS[img.type] || DEFAULT_DIMENSIONS;
              const ratio = `${dims.width} / ${dims.height}`;
              const src = img.imageUrl && img.imageUrl.startsWith("http") ? img.imageUrl : `${BASE_URL}/${img.imageUrl}`;
              return (
                <Col key={img._id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    hoverable
                    style={{ width: "100%", height: "100%" }}
                    cover={
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: ratio,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#fafafa",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={src}
                          alt={img.type}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/default-logo.png"; }}
                        />
                      </div>
                    }
                    actions={[
                      <Popconfirm
                        title="Are you sure you want to delete this image?"
                        onConfirm={() => handleDelete(img.type)}
                      >
                        <DeleteOutlined key="delete" />
                      </Popconfirm>,
                    ]}
                  >
                    <Card.Meta
                      title={img.type}
                      description={`Uploaded: ${new Date(img.createdAt).toLocaleString()}`}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default SchoolImageManagement;
 