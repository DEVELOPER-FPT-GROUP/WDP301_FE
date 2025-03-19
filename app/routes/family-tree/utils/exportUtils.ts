import jsPDF from "jspdf";
import { fabric } from "fabric";

// Mở rộng type để TypeScript không báo lỗi
interface ExtendedCanvas extends fabric.Canvas {
  upperCanvasEl: HTMLCanvasElement;
  lowerCanvasEl: HTMLCanvasElement;
  contextContainer: CanvasRenderingContext2D;
  contextTop: CanvasRenderingContext2D;
  _objects: fabric.Object[];
}

// Hàm lấy Fabric canvas thông qua window global
const getFabricCanvas = (canvasId: string): ExtendedCanvas | null => {
  if (typeof window !== "undefined" && (window as any).__canvases) {
    return (window as any).__canvases[canvasId] as ExtendedCanvas;
  }

  // Fallback: tìm kiếm trong DOM
  try {
    const canvasElement = document.getElementById(
      canvasId
    ) as HTMLCanvasElement;
    if (!canvasElement) return null;

    // Tìm container của canvas
    const container = canvasElement.parentElement;
    if (!container) return null;

    // Tìm upper-canvas (thường chứa tham chiếu đến fabric.Canvas)
    const upperCanvasElements =
      container.getElementsByClassName("upper-canvas");
    if (upperCanvasElements.length > 0) {
      const upperCanvas = upperCanvasElements[0] as any;
      if (upperCanvas && upperCanvas.__canvas) {
        return upperCanvas.__canvas as ExtendedCanvas;
      }
    }
  } catch (error) {
    console.error("Lỗi khi tìm Fabric canvas:", error);
  }

  return null;
};

// Hàm tạo một canvas độc lập chứa toàn bộ cây gia đình
const createFullCanvasImage = async (
  canvas: ExtendedCanvas
): Promise<string> => {
  try {
    // Lưu lại trạng thái hiện tại của canvas
    const originalZoom = canvas.getZoom();
    const originalViewportTransform = [
      ...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0]),
    ];
    canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
    // Tìm tất cả các objects để tính toán kích thước cần thiết
    const objects = canvas.getObjects();
    if (!objects.length) {
      throw new Error("Không có đối tượng nào trong canvas");
    }

    // Tính toán kích thước của toàn bộ cây
    let minX = Number.MAX_VALUE,
      minY = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE,
      maxY = -Number.MAX_VALUE;

    objects.forEach((obj) => {
      const boundingRect = obj.getBoundingRect(true, true);
      minX = Math.min(minX, boundingRect.left);
      minY = Math.min(minY, boundingRect.top);
      maxX = Math.max(maxX, boundingRect.left + boundingRect.width);
      maxY = Math.max(maxY, boundingRect.top + boundingRect.height);
    });

    // Thêm padding để không cắt mất nội dung
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Tính toán kích thước cần thiết
    const width = maxX - minX;
    const height = maxY - minY;

    // Tạo canvas mới với kích thước phù hợp
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("Không thể tạo context cho canvas");
    }

    // Đặt nền trắng
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // *** Phương pháp mới: Sử dụng toDataURL để chụp từng đối tượng ***

    // Đặt canvas về zoom = 1 và di chuyển đến vị trí mới
    canvas.setZoom(1);
    canvas.absolutePan({ x: minX, y: minY } as fabric.Point);
    canvas.renderAll();

    // Chụp canvas ở vị trí mới
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1.0,
      multiplier: 1.0,
      width: width,
      height: height,
      left: 0,
      top: 0,
    });

    // Khôi phục trạng thái ban đầu của canvas
    canvas.setViewportTransform(originalViewportTransform);
    canvas.setZoom(originalZoom);
    canvas.renderAll();

    return dataURL;
  } catch (error) {
    console.error("Lỗi khi tạo ảnh canvas:", error);
    throw error;
  }
};

// Phương pháp backup nếu phương pháp trên không hoạt động
const captureFullCanvas = async (canvas: ExtendedCanvas): Promise<string> => {
  try {
    // Lưu trạng thái hiện tại
    const originalVPT = [...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0])];
    const originalZoom = canvas.getZoom();

    // Tính toán viewport mới để hiển thị toàn bộ cây
    const objects = canvas._objects;

    // Tìm xem có bao nhiêu đối tượng mỗi loại
    const countByType: Record<string, number> = {};
    objects.forEach((obj) => {
      const type = obj.type || "unknown";
      countByType[type] = (countByType[type] || 0) + 1;
    });
    console.log("Số lượng đối tượng theo loại:", countByType);

    // Xác định kích thước thực tế của cây
    const allBounds = objects.map((obj) => obj.getBoundingRect(true, true));

    // Tìm kích thước tối đa
    let left = Math.min(...allBounds.map((b) => b.left));
    let top = Math.min(...allBounds.map((b) => b.top));
    let right = Math.max(...allBounds.map((b) => b.left + b.width));
    let bottom = Math.max(...allBounds.map((b) => b.top + b.height));

    // Thêm padding
    const padding = 100;
    left -= padding;
    top -= padding;
    right += padding;
    bottom += padding;

    // Kích thước cần thiết
    const width = right - left;
    const height = bottom - top;
    console.log(
      `Kích thước cần thiết: ${width}x${height} (left=${left}, top=${top})`
    );

    // Zoom out để hiển thị toàn bộ nội dung
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const zoomX = canvasWidth / width;
    const zoomY = canvasHeight / height;
    const zoom = Math.min(zoomX, zoomY) * 0.95; // 95% để đảm bảo không bị cắt

    // Tạo viewport mới
    canvas.setZoom(zoom);
    canvas.absolutePan({ x: left, y: top } as fabric.Point);
    canvas.renderAll();

    // Chụp canvas
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1.0,
    });

    // Khôi phục trạng thái ban đầu
    canvas.setViewportTransform(originalVPT);
    canvas.setZoom(originalZoom);
    canvas.renderAll();

    return dataURL;
  } catch (error) {
    console.error("Lỗi khi chụp canvas:", error);
    throw error;
  }
};

// Xuất canvas thành ảnh
export const downloadTreeAsImage = async (
  canvasId: string,
  format: string = "png",
  fileName: string = "family-tree"
) => {
  try {
    // Tìm Fabric canvas
    const fabricCanvas = getFabricCanvas(canvasId);
    if (!fabricCanvas) {
      throw new Error("Không tìm thấy canvas");
    }

    console.log("Bắt đầu xuất ảnh...");
    console.log(
      "Số lượng đối tượng trong canvas:",
      fabricCanvas.getObjects().length
    );

    // Thử phương pháp đầu tiên
    let dataURL;
    try {
      dataURL = await createFullCanvasImage(fabricCanvas);
    } catch (err) {
      console.warn("Phương pháp 1 thất bại, thử phương pháp 2:", err);
      dataURL = await captureFullCanvas(fabricCanvas);
    }

    // Chuyển đổi định dạng nếu không phải PNG
    if (format !== "png") {
      // Tạo canvas tạm để chuyển đổi định dạng
      const img = new Image();
      img.src = dataURL;

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      const ctx = tempCanvas.getContext("2d");
      if (!ctx) throw new Error("Không thể tạo context");

      // Đặt nền trắng
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(img, 0, 0);

      // Chuyển đổi định dạng
      const mimeType =
        format === "jpeg"
          ? "image/jpeg"
          : format === "webp"
          ? "image/webp"
          : "image/png";
      const quality = format === "jpeg" ? 0.9 : 1.0;
      dataURL = tempCanvas.toDataURL(mimeType, quality);
    }

    // Tạo link tải xuống
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${fileName}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Xuất ảnh thành công!");
  } catch (error) {
    console.error("Lỗi khi xuất ảnh:", error);
    alert("Không thể xuất ảnh. Vui lòng thử lại.");
  }
};

// Xuất canvas thành PDF với các tùy chọn
export const downloadTreeAsPDF = async (
  canvasId: string,
  fileName: string = "family-tree"
) => {
  await downloadTreeAsPDFWithSettings(canvasId, fileName, "a4", "auto");
};

export const downloadTreeAsPDFWithSettings = async (
  canvasId: string,
  fileName: string = "family-tree",
  paperSize: string = "a4",
  orientation: string = "auto"
) => {
  try {
    // Tìm Fabric canvas
    const fabricCanvas = getFabricCanvas(canvasId);
    if (!fabricCanvas) {
      throw new Error("Không tìm thấy canvas");
    }

    console.log("Bắt đầu xuất PDF...");

    // Lấy hình ảnh canvas
    let imageData;
    try {
      imageData = await createFullCanvasImage(fabricCanvas);
    } catch (err) {
      console.warn("Phương pháp 1 thất bại, thử phương pháp 2:", err);
      imageData = await captureFullCanvas(fabricCanvas);
    }

    // Tạo ảnh để lấy kích thước
    const img = new Image();
    img.src = imageData;

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    const imageWidth = img.width;
    const imageHeight = img.height;

    // Xác định hướng giấy
    let pdfOrientation: "p" | "l";
    if (orientation === "auto") {
      pdfOrientation = imageWidth > imageHeight ? "l" : "p";
    } else {
      pdfOrientation = orientation === "landscape" ? "l" : "p";
    }

    // Tạo PDF
    const pdf = new jsPDF(pdfOrientation, "mm", paperSize);

    // Lấy kích thước trang PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Tính toán tỷ lệ để vừa với trang PDF
    const ratio =
      Math.min(pdfWidth / imageWidth, pdfHeight / imageHeight) * 0.95;
    const pdfImgWidth = imageWidth * ratio;
    const pdfImgHeight = imageHeight * ratio;

    // Căn giữa hình trong trang
    const x = (pdfWidth - pdfImgWidth) / 2;
    const y = (pdfHeight - pdfImgHeight) / 2;

    // Thêm hình ảnh vào PDF
    pdf.addImage(imageData, "PNG", x, y, pdfImgWidth, pdfImgHeight);

    // Tải xuống PDF
    pdf.save(`${fileName}.pdf`);

    console.log("Xuất PDF thành công!");
  } catch (error) {
    console.error("Lỗi khi tạo PDF:", error);
    alert("Không thể tạo PDF. Vui lòng thử lại.");
  }
};
