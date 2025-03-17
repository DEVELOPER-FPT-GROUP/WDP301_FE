import React, { useState } from "react";
import {
  Modal,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Select,
  Text,
  Divider,
} from "@mantine/core";
import {
  downloadTreeAsImage,
  downloadTreeAsPDF,
  downloadTreeAsPDFWithSettings,
} from "../utils/exportUtils";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasId: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  canvasId,
}) => {
  const [downloadType, setDownloadType] = useState<"image" | "pdf">("image");
  const [imageFormat, setImageFormat] = useState<string>("png");
  const [paperSize, setPaperSize] = useState<string>("a4");
  const [orientation, setOrientation] = useState<string>("auto");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (downloadType === "image") {
        await downloadTreeAsImage(canvasId, imageFormat);
      } else {
        await downloadTreeAsPDFWithSettings(
          canvasId,
          "family-tree",
          paperSize,
          orientation
        );
      }
      onClose();
    } catch (error) {
      console.error("Lỗi khi tải xuống:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Tránh render lại modal khi không cần thiết
  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Tải xuống cây gia đình"
      centered
    >
      <Stack gap="md">
        <Text size="sm">Chọn định dạng tải xuống:</Text>

        <SegmentedControl
          value={downloadType}
          onChange={(value) => setDownloadType(value as "image" | "pdf")}
          data={[
            { label: "Hình ảnh", value: "image" },
            { label: "PDF", value: "pdf" },
          ]}
          fullWidth
        />

        {downloadType === "image" && (
          <Select
            label="Định dạng hình ảnh"
            placeholder="Chọn định dạng"
            value={imageFormat}
            onChange={(value) => setImageFormat(value || "png")}
            data={[
              { value: "png", label: "PNG" },
              { value: "jpeg", label: "JPEG" },
              { value: "webp", label: "WebP" },
            ]}
            required
          />
        )}

        {downloadType === "pdf" && (
          <>
            <Divider label="Tùy chọn PDF" labelPosition="center" />
            <Group grow>
              <Select
                label="Kích thước giấy"
                placeholder="Chọn kích thước"
                value={paperSize}
                onChange={(value) => setPaperSize(value || "a4")}
                data={[
                  { value: "a4", label: "A4" },
                  { value: "a3", label: "A3" },
                  { value: "a2", label: "A2" },
                  { value: "a1", label: "A1" },
                  { value: "letter", label: "Letter" },
                ]}
              />
              <Select
                label="Hướng trang"
                placeholder="Chọn hướng"
                value={orientation}
                onChange={(value) => setOrientation(value || "auto")}
                data={[
                  { value: "auto", label: "Tự động" },
                  { value: "portrait", label: "Dọc" },
                  { value: "landscape", label: "Ngang" },
                ]}
              />
            </Group>
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            Hủy
          </Button>
          <Button onClick={handleDownload} loading={isDownloading}>
            {isDownloading ? "Đang xử lý..." : "Tải xuống"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DownloadModal;
