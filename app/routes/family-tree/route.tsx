import React, { memo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import type { FamilyMemberNodeType } from "./react-flow/types";
import {
  Menu,
  MenuItem,
  Modal,
  Button,
  TextInput,
  Checkbox,
} from "@mantine/core";
// import { DateInput } from "@mantine/dates";
import {
  IconEditCircle,
  IconTrashFilled,
  IconHandMove,
  IconDotsVertical,
} from "@tabler/icons-react";
import { IconCirclePlus } from "@tabler/icons-react";
import { initialEdges } from "./react-flow/edges";
import { initialNode } from "./react-flow/nodes";
import { Box } from "@mantine/core";
import "./styles.css";
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

    // Điều kiện xử lý kết nối giữa vợ chồng và cha mẹ con cái
    const isMarried =
      (data.husbandId !== null && data.husbandId !== undefined) ||
      (data.wifeId !== null && data.wifeId !== undefined);
    const isParentChild = data.parentId !== null;

    // State to handle pop-up visibility
    const [openModal, setOpenModal] = useState(false);
    const openPopup = () => {
      setOpenModal(true);
    };

    const closePopup = () => {
      setOpenModal(false);
    };
    // Track hover state

    return (
      <div
        className={`p-4 min-w-[200px] bg-white border-2 rounded-lg shadow-lg transition-all duration-300 ${
          data.gender === "male"
            ? "border-blue-500 hover:border-blue-700"
            : "border-pink-500 hover:border-pink-700"
        } hover:shadow-2xl relative`}
      >
        {data.generation === 1 ? (
          <>
            {data.wifeId && <Handle type="source" position={Position.Bottom} />}
          </>
        ) : (
          <>
            {isMarried && isParentChild && (
              <>
                <Handle type="source" position={Position.Bottom} />
                <Handle type="target" position={Position.Top} />
              </>
            )}
            {!isMarried && (
              <>
                <Handle
                  type="source"
                  position={Position.Right}
                  style={{
                    width: "25px",
                    height: "25px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCirclePlus
                    size={25}
                    onClick={openPopup}
                    className="icon-plus-hover"
                    color="black"
                  />
                </Handle>
                <Handle
                  type="source"
                  position={Position.Bottom}
                  style={{
                    width: "25px",
                    height: "25px",
                    cursor: "pointer",
                    backgroundColor: "white",
                  }}
                >
                  <IconCirclePlus
                    size={25}
                    onClick={openPopup}
                    className="icon-plus-hover"
                    color="#296452"
                  />
                </Handle>
                <Handle type="target" position={Position.Top} />
              </>
            )}
          </>
        )}

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
        <Modal opened={openModal} onClose={closePopup} title="Add Connection">
          <div className="flex justify-center items-center">
            <Button onClick={closePopup}>Close</Button>
          </div>
        </Modal>
      </div>
    );
  }
);

const nodeTypes: NodeTypes = {
  familyMember: FamilyMemberNode,
};

const FamilyTree: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNode);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.filter((edge) => edge !== undefined)
  );

  return (
    <Box style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
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
