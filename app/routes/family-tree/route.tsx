import { ReactFlow, Controls, useEdges } from "@xyflow/react";
import { Box } from "@mantine/core";
import CustomNode from "./node-base-component";
// import { IconCircle } from "@tabler/icons-react";
const PARENT_Y = 100; // Vị trí Y của cha mẹ
const CHILD_Y = 500; // Vị trí Y của con
const X_GAP = 300; // Khoảng cách ngang giữa các node

// Danh sách các thành viên
const familyMembers = [
  {
    id: "1",
    memberName: "Father",
    gender: "male",
    relationType: "spouse",
    spouseId: "2",
    parentId: null,
  },
  {
    id: "2",
    memberName: "Mother",
    gender: "female",
    relationType: "spouse",
    spouseId: "1",
    parentId: null,
  },
  {
    id: "3",
    memberName: "Child1",
    gender: "male",
    relationType: "child",
    parentId: "1",
  },
  {
    id: "4",
    memberName: "Child2",
    gender: "male",
    relationType: "child",
    parentId: "1",
  },
  {
    id: "5",
    memberName: "Child3",
    gender: "male",
    relationType: "child",
    parentId: "1",
  },
  {
    id: "6",
    memberName: "Child4",
    gender: "female",
    relationType: "child",
    parentId: "1",
  },
  {
    id: "7",
    memberName: "Child5",
    gender: "male",
    relationType: "child",
    parentId: "1",
  },
];

// Tạo nodes tự động
const middleNodeId = "middle"; // ID của node trung gian

const defaultNodes = [
  ...familyMembers.map((member, index) => ({
    id: member.id,
    type: "customNode",
    data: {
      imgSrc: `/app/assets/image/${member.gender}.png`,
      memberName: member.memberName,
      gender: member.gender,
      relationType: member.relationType,
    },
    position: {
      x:
        member.relationType === "spouse"
          ? 300 + index * X_GAP
          : 200 + (index - 2) * X_GAP, // Vợ chồng ở hàng trên
      y: member.relationType === "spouse" ? PARENT_Y : CHILD_Y, // Cha mẹ trên, con cái dưới
    },
  })),
  {
    id: middleNodeId,
    type: "default",
    data: {
      // label: <IconCircle size={20} />
    },
    position: { x: 500, y: 200 },
    style: { borderRadius: 50, width: 1, height: 1 },
  },
];

// const defaultEdges = [
//   // Kết nối cha mẹ với node trung gian
//   { id: "e1-middle", source: "1", target: middleNodeId, type: "step" },
//   { id: "e2-middle", source: "2", target: middleNodeId, type: "step" },

//   // Kết nối node trung gian với tất cả các con
//   ...familyMembers
//     .filter((member) => member.relationType === "child")
//     .map((child) => ({
//       id: `e${middleNodeId}-${child.id}`,
//       source: middleNodeId,
//       target: child.id,
//       type: "step",
//     })),
// ];
// Tạo edges tự động với logic sửa đổi
const defaultEdges = [
  // Kết nối cha mẹ với node trung gian
  {
    id: "e1-middle",
    source: "1",
    target: middleNodeId,
    type: "step",
    sourceHandle: "right",
    targetHandle: "left",
  },
  {
    id: "e2-middle",
    source: "2",
    target: middleNodeId,
    type: "step",
    sourceHandle: "left",
    targetHandle: "right",
  },

  // Kết nối node trung gian với tất cả các con
  ...familyMembers
    .filter((member) => member.relationType === "child")
    .map((child, index) => {
      const isEven = index % 2 === 0; // Phân biệt các node để xác định vị trí handle
      return {
        id: `e${middleNodeId}-${child.id}`,
        source: middleNodeId,
        target: child.id,
        type: "step",
        sourceHandle: isEven ? "right" : "left", // Nếu index chẵn thì source là "right", lẻ thì "left"
        targetHandle: isEven ? "left" : "right", // Ngược lại với source
      };
    }),
];

const FamilyTree = () => {
  return (
    <Box style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        nodeTypes={{ customNode: CustomNode }}
      >
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default FamilyTree;
