import type { Node } from "@xyflow/react";
import type { FamilyMemberData } from "./types";

import { data } from "./data";
// Hàm tính toán vị trí cho các thế hệ

function calculatePositions(nodes: Node<FamilyMemberData>[]) {
  const generationLevels: { [key: number]: Node<FamilyMemberData>[] } = {};

  // Nhóm các node theo thế hệ
  nodes.forEach((node) => {
    if (!generationLevels[node.data.generation]) {
      generationLevels[node.data.generation] = [];
    }
    generationLevels[node.data.generation].push(node);
  });

  const positions: { [key: string]: { x: number; y: number } } = {};
  let previousGenerationY = 100;
  const offsetX = 250;
  const spouseOffsetX = 200;

  // Xử lý thế hệ đầu tiên (chỉ có 2 node: vợ - chồng)
  const firstGenNodes = generationLevels[1];
  if (firstGenNodes && firstGenNodes.length === 2) {
    const wifeNode = firstGenNodes.find((node) => node.data.wifeId);
    const husbandNode = firstGenNodes.find((node) => node.data.husbandId);

    if (wifeNode && husbandNode) {
      positions[wifeNode.id] = { x: 500, y: previousGenerationY };
      positions[husbandNode.id] = { x: 700, y: previousGenerationY };
    }
  }

  previousGenerationY += 300;

  // Xử lý các thế hệ tiếp theo
  Object.keys(generationLevels)
    .map(Number)
    .sort((a, b) => a - b) // Sắp xếp theo thứ tự thế hệ
    .forEach((generationKey) => {
      if (generationKey === 1) return; // Đã xử lý thế hệ đầu tiên

      const prevGenerationNodes = generationLevels[generationKey - 1];
      const nodesInGeneration = generationLevels[generationKey] || [];
      const sortedNodes: Node<FamilyMemberData>[] = [];

      // Duyệt theo thứ tự cha/mẹ đã được xếp trước đó trong `positions`
      const sortedParents = prevGenerationNodes.sort((a, b) => {
        return (positions[a.id]?.x || 0) - (positions[b.id]?.x || 0);
      });

      sortedParents.forEach((parentNode) => {
        if (!parentNode.data.childId) return;
        parentNode.data.childId.forEach((childId) => {
          const childNode = nodesInGeneration.find((n) => n.id === childId);
          if (childNode && !sortedNodes.includes(childNode)) {
            sortedNodes.push(childNode);

            // Tìm vợ/chồng của childNode
            const spouseNode = nodesInGeneration.find(
              (n) =>
                n.id === childNode.data.husbandId ||
                n.id === childNode.data.wifeId
            );
            if (spouseNode && !sortedNodes.includes(spouseNode)) {
              sortedNodes.push(spouseNode);
            }
          }
        });
      });

      // Tính toán vị trí cho thế hệ này
      const totalWidth = sortedNodes.length * offsetX;
      const startX = 600 - totalWidth / 2;
      let previousNode: Node<FamilyMemberData> | null = null;

      sortedNodes.forEach((node, index) => {
        if (
          node.id === previousNode?.data.husbandId ||
          node.id === previousNode?.data.wifeId
        ) {
          positions[node.id] = {
            x: startX + (index - 1) * offsetX + spouseOffsetX,
            y: previousGenerationY,
          };
        } else {
          positions[node.id] = {
            x: startX + index * offsetX,
            y: previousGenerationY,
          };
        }
        previousNode = node;
      });

      previousGenerationY += 300;
    });

  return positions;
}

// Tính toán vị trí cho các node
const positions = calculatePositions(data);

// Gán vị trí cho từng node
data.forEach((node) => {
  node.position = positions[node.id];
});
export const initialNode = data;
