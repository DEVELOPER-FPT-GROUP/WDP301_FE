import type { Node } from "@xyflow/react";
import type { FamilyMemberData } from "./types";

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

export const initialNodes: Node<FamilyMemberData>[] = [
  // Thế hệ 1 - Ông bà cố
  {
    id: "1",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Thọ",
      generation: 1,
      gender: "male",
      age: 95,
      birthDate: "1929-05-15",
      wifeId: "2",
      parentId: null,
      childId: ["3", "5"],
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    type: "familyMember",
    data: {
      name: "Trần Thị Mai",
      generation: 1,
      gender: "female",
      age: 92,
      birthDate: "1932-08-20",
      husbandId: "1",
      parentId: null,
    },
    position: { x: 0, y: 0 },
  },

  // Thế hệ 2 - Ông bà nội/ngoại
  {
    id: "3",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Dũng",
      generation: 2,
      gender: "male",
      age: 70,
      birthDate: "1954-03-10",
      wifeId: "4",
      parentId: { fatherId: "1", motherId: "2" },
      childId: ["7", "9"],
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "4",
    type: "familyMember",
    data: {
      name: "Mai Thị Hoa",
      generation: 2,
      gender: "female",
      age: 68,
      birthDate: "1956-12-25",
      husbandId: "3",
      parentId: null,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "5",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Hùng",
      generation: 2,
      gender: "male",
      age: 65,
      birthDate: "1959-06-30",
      wifeId: null,
      parentId: { fatherId: "1", motherId: "2" },
    },
    position: { x: 0, y: 0 },
  },

  // Thế hệ 3 - Bố mẹ, cô chú
  {
    id: "6",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Minh",
      generation: 3,
      gender: "male",
      age: 45,
      birthDate: "1979-04-15",
      wifeId: "7",
      parentId: null,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "7",
    type: "familyMember",
    data: {
      name: "Nguyễn Thị Hương",
      generation: 3,
      gender: "female",
      age: 43,
      birthDate: "1981-09-22",
      husbandId: "6",
      parentId: { fatherId: "3", motherId: "4" },
      childId: ["13", "14", "15"],
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "8",
    type: "familyMember",
    data: {
      name: "Mai Văn Tùng",
      generation: 3,
      gender: "male",
      age: 42,
      birthDate: "1982-11-05",
      wifeId: "9",
      parentId: null,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "9",
    type: "familyMember",
    data: {
      name: "Nguyễn Thị Lan",
      generation: 3,
      gender: "female",
      age: 40,
      birthDate: "1984-07-18",
      husbandId: "8",
      childId: ["12"],
      parentId: { fatherId: "3", motherId: "4" },
    },
    position: { x: 0, y: 0 },
  },

  // Thế hệ 4 - Anh chị em họ
  {
    id: "10",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn An",
      generation: 4,
      gender: "male",
      age: 20,
      birthDate: "2004-02-28",
      wifeId: "13",
      parentId: null,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "11",
    type: "familyMember",
    data: {
      name: "Lương Thị Bình",
      generation: 4,
      gender: "female",
      age: 18,
      birthDate: "2006-05-12",
      husbandId: "12",
      parentId: null,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "12",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Cường",
      generation: 4,
      gender: "male",
      age: 19,
      wifeId: "11",
      birthDate: "2005-08-30",
      childId: ["17", "18"],
      parentId: { fatherId: "8", motherId: "9" },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "13",
    type: "familyMember",
    data: {
      name: "Nguyễn Thị Dung",
      generation: 4,
      gender: "female",
      age: 17,
      birthDate: "2007-03-25",
      husbandId: "10",
      childId: ["16", "19", "20"],
      parentId: { fatherId: "6", motherId: "7" },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "14",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Đức",
      generation: 4,
      gender: "male",
      age: 16,
      birthDate: "2008-10-15",
      wifeId: null,
      parentId: { fatherId: "6", motherId: "7" },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "15",
    type: "familyMember",
    data: {
      name: "Nguyễn Thị Em",
      generation: 4,
      gender: "female",
      age: 15,
      birthDate: "2009-12-20",
      husbandId: null,
      parentId: { fatherId: "6", motherId: "7" },
    },
    position: { x: 0, y: 0 },
  },

  // Thế hệ 5 - Con cháu
  {
    id: "16",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Phú",
      generation: 5,
      gender: "male",
      age: 5,
      birthDate: "2019-01-10",
      wifeId: null,
      parentId: { fatherId: "10", motherId: "13" },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "17",
    type: "familyMember",
    data: {
      name: "Nguyễn Thị Quỳnh",
      generation: 5,
      gender: "female",
      age: 4,
      birthDate: "2020-04-05",
      husbandId: null,
      parentId: { fatherId: "12", motherId: "11" },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "18",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Sơn",
      generation: 5,
      gender: "male",
      age: 3,
      birthDate: "2021-07-22",
      wifeId: null,
      parentId: { fatherId: "12", motherId: "11" },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "19",
    type: "familyMember",
    data: {
      name: "Nguyễn Thị Thảo",
      generation: 5,
      gender: "female",
      age: 2,
      birthDate: "2022-09-15",
      husbandId: null,
      parentId: { fatherId: "10", motherId: "13" },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "20",
    type: "familyMember",
    data: {
      name: "Nguyễn Văn Uy",
      generation: 5,
      gender: "male",
      age: 1,
      birthDate: "2023-11-30",
      wifeId: null,
      parentId: { fatherId: "10", motherId: "13" },
    },
    position: { x: 0, y: 0 },
  },
];

// Tính toán vị trí cho các node
const positions = calculatePositions(initialNodes);

// Gán vị trí cho từng node
initialNodes.forEach((node) => {
  node.position = positions[node.id];
});
