import type { Node } from "@xyflow/react";
import type { BaseFamilyMemberData } from "./types";

// Hàm tạo edges từ danh sách nodes
export const createEdges = (nodes: Node<BaseFamilyMemberData>[]) => {
  return nodes
    .filter((node) => node.data.children && node.data.children.length > 0) // Lọc các node có children
    .flatMap((parentNode) =>
      parentNode.data.children?.map((children) => {
        // Kiểm tra độ dài của children và thay đổi type tương ứng
        const edgeType =
          parentNode.data.children?.length === 1 ? "straight" : "smoothstep";

        return {
          id: `e${parentNode.id}-${children}`, // Tạo id cho edge
          source: parentNode.id, // Node cha
          target: children, // Node con
          type: edgeType, // Loại edge
        };
      })
    );
};
