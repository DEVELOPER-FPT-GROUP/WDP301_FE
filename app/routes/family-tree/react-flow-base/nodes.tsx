import type { Node } from "@xyflow/react";
import type { BaseFamilyMemberData } from "./types";

function calculatePositions(nodes: Node<BaseFamilyMemberData>[]) {
  const generationLevels: { [key: number]: Node<BaseFamilyMemberData>[] } = {};

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
  const firstGenNodes = generationLevels[0];
  if (firstGenNodes && firstGenNodes.length === 2) {
    const wifeNode = firstGenNodes.find((node) => node.data?.spouse?.wifeId);
    const husbandNode = firstGenNodes.find(
      (node) => node.data?.spouse?.husbandId
    );

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
      if (generationKey === 0) return; // Đã xử lý thế hệ đầu tiên

      const prevGenerationNodes = generationLevels[generationKey - 1];
      const nodesInGeneration = generationLevels[generationKey] || [];
      const sortedNodes: Node<BaseFamilyMemberData>[] = [];

      // Duyệt theo thứ tự cha/mẹ đã được xếp trước đó trong `positions`
      const sortedParents = (prevGenerationNodes || []).sort((a, b) => {
        return (positions[a.id]?.x || 0) - (positions[b.id]?.x || 0);
      });

      sortedParents.forEach((parentNode) => {
        if (!parentNode.data.children) return;
        parentNode.data.children.forEach((children) => {
          const childNode = nodesInGeneration.find((n) => n.id === children);
          if (childNode && !sortedNodes.includes(childNode)) {
            sortedNodes.push(childNode);

            // Tìm vợ/chồng của childNode
            const spouseNode = nodesInGeneration.find(
              (n) =>
                n.id === childNode.data?.spouse?.husbandId ||
                n.id === childNode.data?.spouse?.wifeId
            );
            if (spouseNode && !sortedNodes.includes(spouseNode)) {
              sortedNodes.push(spouseNode);
            }
          }
        });
      });

      // Tính toán vị trí cho thế hệ này
      // const totalWidth = sortedNodes.length * offsetX;
      // const startX = 600 - totalWidth / 2;
      let previousNode: Node<BaseFamilyMemberData> | null = null;
      // console.log("sortedNodes", sortedNodes);
      sortedNodes.forEach((node, index) => {
        if (
          node.id === previousNode?.data.spouse?.husbandId ||
          node.id === previousNode?.data.spouse?.wifeId
        ) {
          positions[node.id] = {
            // x: startX + (index - 1) * offsetX + spouseOffsetX,
            x: (index - 1) * offsetX + spouseOffsetX,
            y: previousGenerationY,
          };
        } else {
          positions[node.id] = {
            // x: startX + index * offsetX,
            x: index * offsetX,
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
export function initialNode(data: Node<BaseFamilyMemberData>[]) {
  const positions = calculatePositions(data);
  data.forEach((node) => {
    node.position = positions[node.id] || { x: 0, y: 0 };
  });
  return data;
}
