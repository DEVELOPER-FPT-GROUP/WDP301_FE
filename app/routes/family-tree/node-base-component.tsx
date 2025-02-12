import React, { useMemo } from "react";
import { Menu, MenuItem, Button } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import { Position, Handle } from "@xyflow/react";

type genderType = "male" | "female" | "other";

interface CustomNodeProps {
  id: string;
  data: {
    imgSrc?: string;
    memberName?: string;
    gender?: genderType;
    relationType?: "spouse" | "child" | "other";
  };
}

// Màu sắc theo giới tính
const genderColors: Record<genderType, string> = {
  male: "#0000FF",
  female: "#AB5765",
  other: "#000000",
};

const CustomNode: React.FC<CustomNodeProps> = ({ id, data }) => {
  const borderColor = useMemo(
    () => genderColors[data.gender || "other"],
    [data.gender]
  );

  return (
    <>
      <div
        style={{
          border: `2px solid ${borderColor}`,
          padding: "10px",
          borderRadius: "8px",
          width: "150px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {/* Nút menu điều khiển */}
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Menu shadow="md" width={200} position="right-start">
            <Menu.Target>
              <Button variant="subtle">
                <IconDotsVertical size={16} />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <MenuItem onClick={() => alert("Edit clicked")}>Edit</MenuItem>
              <MenuItem onClick={() => alert("Move clicked")}>Move</MenuItem>
              <MenuItem onClick={() => alert("Delete clicked")}>
                Delete
              </MenuItem>
            </Menu.Dropdown>
          </Menu>
        </div>

        {/* Ảnh đại diện */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {data.imgSrc && (
            <img
              src={data.imgSrc}
              alt="Family Member"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "50%",
                border: `2px solid ${borderColor}`,
              }}
            />
          )}
        </div>

        {/* Tên thành viên */}
        <div
          style={{ textAlign: "center", marginTop: "5px", fontWeight: "bold" }}
        >
          {data.memberName || "Unknown"}
        </div>
      </div>

      {/* Kết nối */}
      {data.relationType === "spouse" ? (
        <>
          {data.gender === "female" ? (
            <>
              <Handle type="source" position={Position.Left} />
            </>
          ) : (
            <>
              <Handle type="source" position={Position.Right} />
            </>
          )}
        </>
      ) : (
        <>
          <Handle type="target" position={Position.Top} />
        </>
      )}
    </>
  );
};

export default CustomNode;
