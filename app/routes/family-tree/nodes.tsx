import type { Node } from "@xyflow/react";
import type { FamilyMemberData } from "./types";

// Hàm tính toán vị trí cho các thế hệ

// function generateEdges(nodes: Node<FamilyMemberData>[]) {
//   const edges: {
//     id: string;
//     source: string;
//     target: string;
//     type: string;
//     handleSource?: string;
//     handleTarget?: string;
//   }[] = [];

//   // Duyệt qua tất cả các nodes để tạo các edge
//   nodes.forEach((node) => {
//     if (node.data.generation > 0) {
//       const fatherId = node.data.parentId?.fatherId;
//       if (fatherId) {
//         edges.push({
//           id: `e${fatherId}-${node.id}`,
//           source: fatherId,
//           target: node.id,
//           type: "smoothstep",
//           handleSource: `source-parent-${fatherId}-${node.id}`,
//           handleTarget: `source-child-${node.id}`,
//         });
//       }
//     }

//     if (
//       (node.data.husbandId !== null || node.data.wifeId !== null) &&
//       node.parentId !== null
//     ) {
//       const nodeId =
//         (node.data.husbandId as string) || (node.data.wifeId as string);
//       edges.push({
//         id: `e${node.id}`,
//         source: node.id,
//         target: nodeId,
//         type: "smoothstep",
//         //nghĩa là handleSource là chỉ id của một handle đến từ node khác
//         handleSource: `source-left-${nodeId}`, // Thêm handleSource
//         handleTarget: `source-right-${node.id}`, // Thêm handleTarget
//       });
//     }
//   });

//   return edges;
// }

// Sử dụng hàm tạo các edges tự động

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

  // Duyệt qua từng thế hệ
  Object.keys(generationLevels).forEach((generationKey, genIndex) => {
    let nodesInGeneration = generationLevels[Number(generationKey)];

    // Nếu không phải thế hệ đầu tiên, sắp xếp lại các node

    if (genIndex > 0) {
      const sortedNodes = []; // Mảng chứa các node đã sắp xếp

      while (nodesInGeneration.length > 0) {
        // Lấy phần tử đầu tiên trong nodesInGeneration
        const currentNode = nodesInGeneration[0];

        // Tìm vợ/chồng của currentNode
        const spouseNode = nodesInGeneration.find((node) => {
          return (
            node.id === currentNode.data.husbandId ||
            node.id === currentNode.data.wifeId
          );
        });

        // So sánh để quyết định thứ tự push vào sortedNodes
        if (spouseNode) {
          if (currentNode.data.parentId && !spouseNode.data.parentId) {
            sortedNodes.push(currentNode, spouseNode);
          } else if (!currentNode.data.parentId && spouseNode.data.parentId) {
            sortedNodes.push(spouseNode, currentNode);
          } else {
            // Nếu cả hai đều có/không có parentId, giữ nguyên thứ tự
            sortedNodes.push(currentNode, spouseNode);
          }

          // Xóa cả currentNode và spouseNode khỏi nodesInGeneration
          nodesInGeneration = nodesInGeneration.filter(
            (node) => node.id !== currentNode.id && node.id !== spouseNode.id
          );
        } else {
          // Nếu currentNode không có vợ/chồng, push vào sortedNodes và xóa khỏi nodesInGeneration
          sortedNodes.push(currentNode);
          nodesInGeneration = nodesInGeneration.filter(
            (node) => node.id !== currentNode.id
          );
        }
      }

      // Gán lại nodesInGeneration bằng sortedNodes sau khi sắp xếp xong
      nodesInGeneration = sortedNodes;
    }

    // Tính toán vị trí cho các node trong thế hệ này
    const totalWidth = nodesInGeneration.length * offsetX;
    const startX = 600 - totalWidth / 2;

    nodesInGeneration.forEach((node, index) => {
      positions[node.id] = {
        x: startX + index * offsetX,
        y: previousGenerationY,
      };
    });

    // Tăng khoảng cách dọc giữa các thế hệ
    previousGenerationY += 300;
  });

  // Trả về vị trí đã tính toán
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
      parentId: null,
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

// export const initialEdges = generateEdges(initialNodes);
