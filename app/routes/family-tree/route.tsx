import React, { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Edge,
} from "@xyflow/react";
import type {
  BaseFamilyMemberData,
  FamilyMemberNodeType,
} from "./react-flow-base/types";
import { createEdges } from "./react-flow-base/edges";
import { initialNode } from "./react-flow-base/nodes";
import { Box } from "@mantine/core";
import "./styles.css";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { FamilyMemberNode } from "./components/FamilyMemberNode";
export const meta = () => {
  return [{ title: "Cây Gia Đình" }];
};

const FamilyTree: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyMemberNodeType>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isInteractive, setIsInteractive] = useState(true);
  const { data, isSuccess, refetch } = useGetApi({
    queryKey: ["family-tree"],
    endpoint: "members/get-members-in-family/:id",
    urlParams: { id: "67b09900dc5227c02b91d823" },
  });
  const nodeTypes = useMemo(
    () => ({
      familyMember: (props: any) => (
        <FamilyMemberNode {...props} refetch={refetch} />
      ),
    }),
    [refetch]
  );

  useEffect(() => {
    if (isSuccess) {
      const dataFormat = data.data.map((node: BaseFamilyMemberData) => {
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
          position: { x: 0, y: 0 }, // Gán giá trị mặc định cho position
        };
        // Chỉ thêm wifeId và husbandId nếu chúng tồn tại
        if (node.spouse?.wifeId) {
          formattedNode.data.spouse.wifeId = node.spouse.wifeId;
        }
        if (node.spouse?.husbandId) {
          formattedNode.data.spouse.husbandId = node.spouse.husbandId;
        }

        return formattedNode;
      });

      // Gọi các hàm helper để xử lý nodes và edges
      const formattedNodes = initialNode(dataFormat);

      const formattedEdges = createEdges(dataFormat).filter(
        (edge) => edge !== undefined
      );

      // Cập nhật state khi dữ liệu thay đổi
      setNodes(formattedNodes);
      setEdges(formattedEdges);
    }
  }, [data, isSuccess, setNodes, setEdges]);
  return (
    <Box style={{ width: "100%", height: "100vh" }}>
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
        <Background />
        <Controls
          onInteractiveChange={(value) => {
            setIsInteractive(value);
          }}
        ></Controls>
        <MiniMap />
      </ReactFlow>
    </Box>
  );
};

export default FamilyTree;
