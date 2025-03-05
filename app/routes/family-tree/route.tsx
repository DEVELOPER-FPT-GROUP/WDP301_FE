import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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
import { CreateFamilyNode } from "./components/CreateFamilyNode";

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

  // Lấy familyId từ localStorage
  // const familyId = localStorage.getItem("familyId") || "";
  const familyId =
    localStorage.getItem("familyId") || "67b09900dc5227c02b91d823";

  // State để kiểm tra xem có familyId hợp lệ không
  const [hasFamilyId, setHasFamilyId] = useState(!!familyId);

  const { data, isSuccess, refetch } = useGetApi({
    queryKey: ["family-tree", familyId],
    endpoint: "members/get-members-in-family/:id",
    urlParams: { id: familyId },
    // Không sử dụng thuộc tính enabled vì hook không hỗ trợ
  });

  const handleFamilyCreated = useCallback(
    (newFamilyId: string) => {
      localStorage.setItem("familyId", newFamilyId);
      setHasFamilyId(true);
      refetch();
    },
    [refetch]
  );
  const nodeTypes = useMemo(
    () => ({
      familyMember: (props: any) => (
        <FamilyMemberNode {...props} refetch={refetch} />
      ),
      createFamily: (props: any) => (
        <CreateFamilyNode {...props} onFamilyCreated={handleFamilyCreated} />
      ),
    }),
    [refetch, handleFamilyCreated]
  );

  // Khởi tạo nút "Tạo cây gia đình" nếu không có familyId
  useEffect(() => {
    if (!hasFamilyId) {
      setNodes([
        {
          id: "create-family-node",
          type: "createFamily",
          data: {
            label: "Tạo cây gia đình mới",
          },
          position: { x: 0, y: 0 },
        } as Node<CreateFamilyNodeData>,
      ]);
      setEdges([]);
    }
  }, [hasFamilyId, setNodes, setEdges]);

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
              generation: node.generation,
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
      // Cho phép tương tác với node createFamily ngay cả khi isInteractive = true
      elementsSelectable={
        nodes.some((n) => n.type === "createFamily") ? true : !isInteractive
      }
      nodesDraggable={!isInteractive}
      nodesConnectable={!isInteractive}
      zoomOnDoubleClick={false}
      fitView
    >
      {hasFamilyId && (
        <>
          <Background />
          <Controls showInteractive={isInteractive} />
          <MiniMap />
        </>
      )}
    </ReactFlow>
  );
};

export default FamilyTree;
