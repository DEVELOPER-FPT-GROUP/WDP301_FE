import { useState } from "react";
import {
  Panel,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Modal, Button, Group, Radio, Stack, Text } from "@mantine/core";

const imageWidth = 1024;
const imageHeight = 768;

function DownloadButton() {
  const { getNodes } = useReactFlow();
  const [opened, setOpened] = useState(false);
  const [fileFormat, setFileFormat] = useState("png");

  // Handle modal open
  const handleOpenModal = () => {
    setOpened(true);
  };

  // Function to download image (PNG)
  const downloadAsImage = () => {
    const nodesBounds = getNodesBounds(getNodes());
    // Tính thêm một chút padding nếu cần
    const padding = 20;
    let dynamicWidth = nodesBounds.width + padding * 2;
    let dynamicHeight = nodesBounds.height + padding * 2;

    // Nếu bạn muốn giới hạn tối đa kích thước ảnh, có thể so sánh với kích thước mặc định
    dynamicWidth = dynamicWidth > imageWidth ? imageWidth : dynamicWidth;
    dynamicHeight = dynamicHeight > imageHeight ? imageHeight : dynamicHeight;

    const viewport = getViewportForBounds(
      nodesBounds,
      dynamicWidth,
      dynamicHeight,
      0.5,
      2,
      10
    );

    const viewportElement = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null;

    if (viewportElement) {
      toPng(viewportElement, {
        backgroundColor: "white",
        width: dynamicWidth,
        height: dynamicHeight,
        style: {
          width: `${dynamicWidth}px`,
          height: `${dynamicHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
        fontEmbedCSS: "",
      }).then((dataUrl) => {
        const a = document.createElement("a");
        a.setAttribute("download", "reactflow.png");
        a.setAttribute("href", dataUrl);
        a.click();
      });
    } else {
      console.error("Viewport element not found");
    }
  };
  // Function to download as PDF
  const downloadAsPDF = () => {
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      10
    );

    const viewportElement = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null;

    if (viewportElement) {
      toPng(viewportElement, {
        backgroundColor: "white",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
        fontEmbedCSS: "",
      }).then((dataUrl) => {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [imageWidth, imageHeight],
        });

        pdf.addImage(dataUrl, "PNG", 0, 0, imageWidth, imageHeight);
      });
    } else {
      console.error("Viewport element not found");
    }
  };

  // Handle download based on selected format
  const handleDownload = () => {
    setOpened(false);

    if (fileFormat === "png") {
      downloadAsImage();
    } else if (fileFormat === "pdf") {
      downloadAsPDF();
    }
  };

  return (
    <>
      <Panel position="top-right">
        <button
          className="bg-amber-800 text-white font-bold rounded-2xl py-2 px-4"
          onClick={handleOpenModal}
        >
          Download Tree
        </button>
      </Panel>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Text size="xl" fw={700} c="brown">
            Download Options
          </Text>
        }
        centered
      >
        <Stack gap={16}>
          <Radio.Group
            label="Select file format"
            description="Choose the format you want to download"
            value={fileFormat}
            onChange={setFileFormat}
          >
            <Group mt="xs">
              <Radio value="png" color="brown" label="PNG Image" />
              <Radio value="pdf" color="brown" label="PDF Document" />
            </Group>
          </Radio.Group>

          <Group justify="right" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button color="brown" onClick={handleDownload}>
              Download
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default DownloadButton;
