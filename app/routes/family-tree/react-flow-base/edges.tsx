import type { Node } from "@xyflow/react";
import type { BaseFamilyMemberData } from "./types";

export const createEdges = (nodes: Node<BaseFamilyMemberData>[]) => {
  let validChildIds = new Set<string>(); // Lưu các childId hợp lệ của thế hệ trước
  return nodes
    .sort((a, b) => a.data.generation - b.data.generation) // Sắp xếp theo thế hệ tăng dần
    .flatMap((parentNode) => {
      // Nếu là thế hệ đầu tiên (0), chỉ tạo nếu có spouse.wifeId
      if (parentNode.data.generation === 0) {
        if (!parentNode.data.spouse?.wifeId) return [];
      } else {
        // Nếu không phải thế hệ đầu, chỉ tạo nếu node thuộc danh sách validChildIds
        if (!validChildIds.has(parentNode.id)) return [];
      }

      const currentValidChildIds: string[] = [];

      const edges =
        parentNode.data.children
          ?.filter((childId) => {
            const childNode = nodes.find((node) => node.id === childId);
            return (
              childNode &&
              childNode.data.generation > 0 &&
              (childNode.data.parent?.fatherId ||
                childNode.data.parent?.motherId)
            );
          })
          .map((childId) => {
            currentValidChildIds.push(childId); // Lưu childId hợp lệ của thế hệ này
            return {
              id: `e${parentNode.id}-${childId}`,
              source: parentNode.id,
              target: childId,
              type:
                (parentNode.data.children?.length ?? 0) === 1
                  ? "straight"
                  : "smoothstep",
            };
          }) || [];

      // Cập nhật danh sách validChildIds cho thế hệ sau ngay lập tức
      validChildIds = new Set([...validChildIds, ...currentValidChildIds]);

      return edges;
    });
};
