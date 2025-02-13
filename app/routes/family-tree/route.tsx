import React, { memo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  type EdgeProps,
  type NodeTypes,
  type NodeProps,
  Position,
} from "@xyflow/react";
import type { FamilyMemberNodeType } from "./types";
import { Menu, MenuItem } from "@mantine/core";
import {
  IconEditCircle,
  IconTrashFilled,
  IconHandMove,
  IconDotsVertical,
} from "@tabler/icons-react";

import { initialEdges } from "./edges";
import { initialNodes } from "./nodes";
import { Box } from "@mantine/core";

// Sửa lại kiểu dữ liệu để sử dụng NodeProps từ React Flow
const FamilyMemberNode: React.FC<NodeProps<FamilyMemberNodeType>> = memo(
  ({ data }) => {
    const imageUrl =
      data.gender === "male"
        ? "/app/assets/image/male.png"
        : "/app/assets/image/female.png";

    const getGenerationLabel = (generation: number): string => {
      switch (generation) {
        case 1:
          return "Thế hệ thứ nhất";
        case 2:
          return "Thế hệ thứ hai";
        case 3:
          return "Thế hệ thứ ba";
        case 4:
          return "Thế hệ thứ tư";
        default:
          return `Thế hệ thứ ${generation}`;
      }
    };

    const handleEdit = () => {
      console.log("Edit", data);
    };

    const handleDelete = () => {
      console.log("Delete", data);
    };

    const handleMove = () => {
      console.log("Move", data);
    };

    return (
      <div
        className={`p-4 min-w-[200px] bg-white border-2 rounded-lg shadow-lg transition-all duration-300 ${
          data.gender === "male"
            ? "border-blue-500 hover:border-blue-700"
            : "border-pink-500 hover:border-pink-700"
        } hover:shadow-2xl relative`}
      >
        {(data.husbandId !== null || data.wifeId !== null) &&
          data.parentId !== null && (
            <>
              <Handle
                type="source"
                position={Position.Right}
                id={`source-right-${data.id}`}
              />
              <Handle
                type="target"
                position={Position.Left}
                id={`target-left-${data.id}`}
              />
            </>
          )}

        <Handle
          type="source"
          position={Position.Right}
          id={`source-left-${data.id}`}
        />
        <Handle
          type="target"
          position={Position.Left}
          id={`target-right-${data.id}`}
        />

        <Handle
          type="source"
          position={Position.Bottom}
          id={`source-parent-${data.id}`}
        />
        <Handle
          type="target"
          position={Position.Top}
          id={`target-child-${data.id}`}
        />
        {/* Mantine Menu Dropdown */}
        <div className="absolute top-2 right-2">
          <Menu withArrow width={100}>
            <Menu.Target>
              <IconDotsVertical size={30} />
            </Menu.Target>

            <Menu.Dropdown>
              <MenuItem
                leftSection={<IconEditCircle size={16} />}
                onClick={handleEdit}
              >
                Edit
              </MenuItem>
              <MenuItem
                leftSection={<IconTrashFilled size={16} />}
                onClick={handleDelete}
              >
                Delete
              </MenuItem>
              <MenuItem
                leftSection={<IconHandMove size={16} />}
                onClick={handleMove}
              >
                Move
              </MenuItem>
            </Menu.Dropdown>
          </Menu>
        </div>

        <div className="flex flex-col items-center gap-2">
          <img
            src={imageUrl}
            alt={data.name}
            className="w-16 h-16 rounded-full border-2 border-gray-200"
          />
          <div className="text-center">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
              <span>{data.age} tuổi</span>
            </div>
            {data.birthDate && (
              <p className="text-xs text-gray-500">
                Ngày sinh: {data.birthDate}
              </p>
            )}
            <p className="text-sm font-medium text-blue-600">
              {getGenerationLabel(data.generation)}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

interface FamilyEdgeProps extends EdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: {
    relation: string;
  };
}

const FamilyEdge: React.FC<FamilyEdgeProps> = memo(
  ({ sourceX, sourceY, targetX, targetY, data }) => {
    const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

    return (
      <>
        <path d={edgePath} className="stroke-[2] stroke-gray-300" fill="none" />
        {data?.relation && (
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 10}
            className="text-xs fill-gray-500"
            textAnchor="middle"
          >
            {data.relation}
          </text>
        )}
      </>
    );
  }
);

const nodeTypes: NodeTypes = {
  familyMember: FamilyMemberNode,
};

const edgeTypes = {
  family: FamilyEdge,
};

const FamilyTree: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <Box style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </Box>
  );
};

export default FamilyTree;
