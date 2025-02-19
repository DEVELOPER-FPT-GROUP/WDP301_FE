import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FamilyMemberNodeType } from "../react-flow-base/types";
import { memo, useState } from "react";
import {
  IconCirclePlus,
  IconDotsVertical,
  IconEditCircle,
  IconHandMove,
  IconTrashFilled,
} from "@tabler/icons-react";
import { Menu, MenuItem, Modal, Button } from "@mantine/core";
import AddSpouseForm, { type SpouseFormData } from "./AddSpouseForm";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import {
  useGetApi,
  usePostApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
function formatDate(isoDate: string) {
  const date = new Date(isoDate);

  // Get day, month, year
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  // Return formatted date
  return `${day}/${month}/${year}`;
}

type FamilyMemberNodeProps = NodeProps<FamilyMemberNodeType> & {
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<any, any>>;
};
export const FamilyMemberNode: React.FC<FamilyMemberNodeProps> = memo(
  ({ data, refetch }) => {
    const imageUrl =
      data.gender === "male"
        ? "/app/assets/image/male.png"
        : "/app/assets/image/female.png";

    const getGenerationLabel = (generation: number): string => {
      switch (generation) {
        case 0:
          return "Thế hệ thứ nhất";
        case 1:
          return "Thế hệ thứ hai";
        case 2:
          return "Thế hệ thứ ba";
        case 3:
          return "Thế hệ thứ tư";
        default:
          return `Thế hệ thứ ${generation + 1}`;
      }
    };
    const { mutate, isError, error } = usePostApi<SpouseFormData, any>({
      endpoint: "members/add-spouse",
    });
    const handleSpouseSubmit = (values: SpouseFormData) => {
      console.log("Spouse data:", values);

      mutate(values, {
        onSuccess: () => {
          console.log("Thêm vợ/chồng thành công!");
          // Gọi lại API để cập nhật dữ liệu
          refetch();
        },
        onError: (error) => {
          console.error("Lỗi khi thêm vợ/chồng:", error);
        },
      });
      refetch();

      // Xử lý logic thêm vợ/chồng ở đây
    };

    // Điều kiện xử lý kết nối giữa vợ chồng và cha mẹ con cái
    const isMarried =
      (data.spouse.husbandId !== null && data.spouse.husbandId !== undefined) ||
      (data.spouse.wifeId !== null && data.spouse.wifeId !== undefined);
    const isParentChild = data.parent !== null;

    // State to handle pop-up visibility
    const [openModalSpouse, setOpenModalSpouse] = useState(false);
    const [openModalChild, setOpenModalChild] = useState(false);
    const openPopupChild = () => {
      setOpenModalChild(true);
    };

    const closePopupChild = () => {
      setOpenModalChild(false);
    };
    const closePopupSpouse = () => {
      setOpenModalSpouse(false);
    };

    // Track hover state
    const name = data.firstName + " " + data.middleName + " " + data.lastName;
    return (
      <div
        className={`p-4 min-w-[200px] min-h-[200px] ${
          data.isAlive ? " bg-white " : "bg-gray-200"
        } border-2 rounded-lg shadow-lg transition-all duration-300 ${
          data.gender === "male"
            ? "border-blue-500 hover:border-blue-700"
            : "border-pink-500 hover:border-pink-700"
        } hover:shadow-2xl relative `}
      >
        {data.generation === 0 ? (
          <>
            {data.spouse.wifeId && (
              <>
                <Handle type="source" position={Position.Bottom} />
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
                    onClick={openPopupChild}
                    className="icon-plus-hover"
                    color="#296452"
                  />
                </Handle>
              </>
            )}
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
                    onClick={() => setOpenModalSpouse(true)}
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
                    onClick={openPopupChild}
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
                onClick={() => {
                  alert("Edit");
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                leftSection={
                  <IconTrashFilled
                    size={16}
                    onClick={() => {
                      alert("Delete");
                    }}
                  />
                }
              >
                Delete
              </MenuItem>
              <MenuItem
                leftSection={
                  <IconHandMove
                    size={16}
                    onClick={() => {
                      alert("Move");
                    }}
                  />
                }
              >
                Move
              </MenuItem>
            </Menu.Dropdown>
          </Menu>
        </div>

        <div className="flex flex-col items-center gap-2">
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 rounded-full border-2 border-gray-200"
          />
          <div className="text-center">
            <h3 className="font-semibold text-lg">{name}</h3>

            {data.dateOfBirth && (
              <p className="text-xs text-gray-500">
                Ngày sinh: {formatDate(data.dateOfBirth)}
              </p>
            )}
            <p className="text-sm font-medium text-blue-600">
              {getGenerationLabel(data.generation)}
            </p>
            <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
              {!data.isAlive && <span className="text-red-600">Đã chết</span>}
            </div>
          </div>
        </div>
        <Modal
          opened={openModalChild}
          onClose={closePopupChild}
          title="Add Connection Child"
        >
          <div className="flex justify-center items-center">
            <Button onClick={closePopupChild}>Close</Button>
          </div>
        </Modal>
        <AddSpouseForm
          opened={openModalSpouse}
          onClose={closePopupSpouse}
          onSubmit={handleSpouseSubmit}
          currentMemberId={data.memberId}
        />
      </div>
    );
  }
);
