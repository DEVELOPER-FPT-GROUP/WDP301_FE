import React, { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import type {
  BaseFamilyMemberData,
  FamilyMemberNodeType,
} from "./react-flow-base/types";
import { createEdges } from "./react-flow-base/edges";
import { initialNodes } from "./react-flow-base/nodes";
import "./styles.css";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { FamilyMemberNode } from "./components/FamilyMemberNode";
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";
import DownloadButton from "./components/DownloadButton";
export const meta = () => {
  return [{ title: "Cây Gia Đình" }];
};

// Định nghĩa kiểu dữ liệu cho node tạo gia đình
type CreateFamilyNodeData = {
  label: string;
  onFamilyCreated?: (newFamilyId: string) => void;
};

// Đưa kiểu node vào Union type
type NodeTypes = FamilyMemberNodeType | Node<CreateFamilyNodeData>;

const FamilyTree: React.FC = () => {
  // Sử dụng generic types rộng hơn để chứa cả hai loại node
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeTypes>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isInteractive, setIsInteractive] = useState(true);
  const getFamilyIdFromToken = () => {
    const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);

    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      // console.log(decoded);
      return decoded.familyId; // 🛠️ Trích xuất memberId từ payload
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      return null;
    }
  };
  // Lấy familyId từ localStorage
  const familyId = getFamilyIdFromToken();
  // State để kiểm tra xem có familyId hợp lệ không

  const { data, isSuccess, refetch } = useGetApi({
    queryKey: ["family-tree", familyId],
    endpoint: "members/get-members-in-family/:id",
    urlParams: { id: familyId },
    // Không sử dụng thuộc tính enabled vì hook không hỗ trợ
  });

  const nodeTypes = useMemo(
    () => ({
      familyMember: (props: any) => (
        <FamilyMemberNode {...props} refetch={refetch} />
      ),
    }),
    [refetch]
  );

  // Chỉ gọi API khi có familyId
  useEffect(() => {
    // Kiểm tra familyId trước khi xử lý dữ liệu
    if (!familyId) {
      return;
    }

    if (isSuccess && data?.data) {
      const dataFormat = data.data
        .filter((node: BaseFamilyMemberData) => !node.isDeleted) // Lọc chỉ lấy những node chưa bị xóa
        .map((node: BaseFamilyMemberData) => {
          const formattedNode = {
            id: node.memberId,
            type: "familyMember",
            data: {
              memberId: node.memberId,
              familyId: node.familyId,
              firstName: node.firstName,
              middleName: node.middleName,
              lastName: node.lastName,
              dateOfBirth: node.dateOfBirth,
              dateOfDeath: node.dateOfDeath,
              placeOfBirth: node.placeOfBirth,
              placeOfDeath: node.placeOfDeath,
              isAlive: node.isAlive,
              generation: node.generation || 0,
              shortSummary: node.shortSummary,
              gender: node.gender,
              spouse: {} as { wifeId?: string; husbandId?: string },
              parent: node.parent
                ? {
                    fatherId: node.parent.fatherId,
                    motherId: node.parent.motherId,
                  }
                : null,
              children: node.children,
            },
            position: { x: 0, y: 0 },
          };

          if (node.spouse?.wifeId) {
            formattedNode.data.spouse.wifeId = node.spouse.wifeId;
          }
          if (node.spouse?.husbandId) {
            formattedNode.data.spouse.husbandId = node.spouse.husbandId;
          }

          return formattedNode;
        });

      const formattedNodes = initialNodes(dataFormat);
      const formattedEdges = createEdges(dataFormat).filter(
        (edge) => edge !== undefined
      );

      setNodes(formattedNodes as NodeTypes[]);
      setEdges(formattedEdges);
    }
  }, [data, isSuccess, familyId, setNodes, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      elementsSelectable={!isInteractive}
      nodesDraggable={!isInteractive}
      nodesConnectable={!isInteractive}
      zoomOnDoubleClick={false}
      fitView
    >
      <>
        <Background />
        <Controls showInteractive={isInteractive} />
        <DownloadButton />
      </>
    </ReactFlow>
  );
};

export default FamilyTree;
