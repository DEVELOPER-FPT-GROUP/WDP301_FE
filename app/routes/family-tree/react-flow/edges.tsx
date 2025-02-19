import type { Node } from "@xyflow/react";
import type { FamilyMemberData } from "./types";
import { data } from "./data";

// Hàm tạo edges từ danh sách nodes
export const createEdges = (nodes: Node<FamilyMemberData>[]) => {
  return nodes
    .filter((node) => node.data.childId && node.data.childId.length > 0) // Lọc các node có childId
    .flatMap((parentNode) =>
      parentNode.data.childId?.map((childId) => ({
        id: `e${parentNode.id}-${childId}`, // Tạo id cho edge
        source: parentNode.id, // Node cha
        target: childId, // Node con
        type: "smoothstep", // Loại edge
        handleSource: `source-bottom-${parentNode.id}`, // Điểm nối của source
        handleTarget: `target-top-${childId}`, // Điểm nối của target
      }))
    );
};

export const initialEdges = createEdges(data);
