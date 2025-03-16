import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FamilyMemberNodeType } from "../react-flow-base/types";
import { memo, useState } from "react";
import {
  IconCirclePlus,
  IconDotsVertical,
  IconEditCircle,
  IconEyeSpark,
  IconTrashFilled,
} from "@tabler/icons-react";
import { Menu, MenuItem } from "@mantine/core";
import AddSpouseForm, { type SpouseFormData } from "./AddSpouseForm";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import { usePostApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import AddChildModal, { type ChildFormData } from "./AddChildModal";
import "./styles.css";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import EditDetailMemberModal from "~/infrastructure/common/components/component/EditDetailMemberModal";
import { useNavigate } from "react-router";
function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  // Get day, month, year
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  // Return formatted date
  return `${day}/${month}/${year}`;
}
import DeleteMemberModal from "~/infrastructure/common/components/component/DeleteMemberModal";

type FamilyMemberNodeProps = NodeProps<FamilyMemberNodeType> & {
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<any, any>>;
};
interface ChildFormDataWithBirthOrder extends ChildFormData {
  birthOrder: number;
}
export const FamilyMemberNode: React.FC<FamilyMemberNodeProps> = memo(
  ({ data, refetch }) => {
    // State to handle pop-up visibility
    const [openModalSpouse, setOpenModalSpouse] = useState(false);
    const [openModalChild, setOpenModalChild] = useState(false);
    const [editmodalOpened, setEditModalOpened] = useState(false);
    const [deleteMemberModalOpened, setDeleteMemberModalOpened] =
      useState(false);
    const [editData, setEditData] = useState<any>(null);
    const navigate = useNavigate();
    const addSpouseApi = usePostApi<SpouseFormData, any>({
      endpoint: "members/add-spouse",
    });
    const addChildApi = usePostApi<ChildFormDataWithBirthOrder, any>({
      endpoint: "members/add-child",
    });
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
    const openPopupChild = () => {
      setOpenModalChild(true);
    };

    const handleSpouseSubmit = (values: SpouseFormData) => {
      console.log("Spouse data:", values);

      addSpouseApi.mutate(values, {
        onSuccess: (data) => {
          console.log("Thêm vợ/chồng:", data);
          const message = data?.message || "Thêm vợ/chồng thành công!";
          const title = "Thành công";

          // Hiển thị thông báo thành công
          notifySuccess({
            title: title,
            message: message,
          });
          // Gọi lại API để cập nhật dữ liệu
          refetch();
        },
        onError: (error) => {
          const errorMessage =
            (error as any).response?.data?.message || "Đã xảy ra lỗi!";
          console.error("Lỗi khi thêm vợ/chồng:", error);
          notifyError({
            title: "Lỗi",
            message: errorMessage,
          });
        },
      });
      refetch();

      // Xử lý logic thêm vợ/chồng ở đây
    };
    const handleAddChild = (values: ChildFormData) => {
      const birthOrder = data.children ? data.children.length + 1 : 1;

      // Thêm birthOrder vào dữ liệu gửi lên server
      const childData = {
        ...values,
        birthOrder,
      };
      addChildApi.mutate(childData, {
        onSuccess: (data) => {
          console.log("Thêm con cái thành công: ", data);
          const message = data?.message || "Thêm con cái thành công!";
          notifySuccess({
            title: "Thành công",
            message: message,
          });
          // Gọi lại API để cập nhật dữ liệu
          refetch();
        },
        onError: (error) => {
          console.error("Lỗi khi thêm con cái:", error);
          const errorMessage =
            (error as any).response?.data?.message || "Đã xảy ra lỗi!";
          notifyError({
            title: "Lỗi",
            message: errorMessage,
          });
        },
      });
      refetch();
      console.log("Child data:", childData);
    };

    // Điều kiện xử lý kết nối giữa vợ chồng và cha mẹ con cái

    const isMarried =
      (data.spouse.husbandId !== null && data.spouse.husbandId !== undefined) ||
      (data.spouse.wifeId !== null && data.spouse.wifeId !== undefined);
    const isParentChild = data.parent !== null;

    // Track hover state
    const name = data.firstName + " " + data.middleName + " " + data.lastName;
    return (
      <div
        className={`p-3 w-[200px] h-[220px] ${
          data.isAlive ? " bg-white " : "bg-gray-200"
        } border-2 rounded-lg shadow-lg transition-all duration-300 ${
          data.gender === "male"
            ? "border-blue-500 hover:border-blue-700"
            : "border-pink-500 hover:border-pink-700"
        } hover:shadow-2xl relative `}
      >
        {data.generation === 0 ? (
          <>
            {Object.keys(data.spouse).length === 0 && (
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
            )}
            {data.spouse.wifeId && (
              <>
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
        <div className=" menu-container absolute top-2 right-2">
          <Menu withArrow width={100}>
            <Menu.Target>
              <IconDotsVertical size={30} />
            </Menu.Target>

            <Menu.Dropdown>
              <MenuItem
                leftSection={<IconEyeSpark size={16} />}
                onClick={() =>
                  navigate("/detail-member", {
                    state: {
                      memberId: data.memberId,
                    },
                  })
                }
              >
                View
              </MenuItem>
              <MenuItem
                leftSection={<IconEditCircle size={16} />}
                onClick={() => {
                  setEditModalOpened(true);
                  setEditData(data);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                leftSection={<IconTrashFilled size={16} />}
                onClick={() => {
                  setDeleteMemberModalOpened(true);
                }}
              >
                Delete
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

            {data.dateOfDeath && (
              <p className="text-xs text-gray-500">
                Ngày sinh: {formatDate(data.dateOfDeath)}
              </p>
            )}
            <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
              {!data.isAlive && <span className="text-red-600">Đã mất</span>}
            </div>
          </div>
        </div>
        {editData && (
          <EditDetailMemberModal
            opened={editmodalOpened}
            onClose={() => setEditModalOpened(false)}
            memberData={editData}
            refreshTable={refetch}
          />
        )}

        <DeleteMemberModal
          opened={deleteMemberModalOpened}
          onClose={() => setDeleteMemberModalOpened(false)}
          memberData={data}
          refreshTable={refetch}
        />

        <AddChildModal
          opened={openModalChild}
          onClose={() => setOpenModalChild(false)}
          onSubmit={handleAddChild}
          parentId={data.memberId} // ID của cha/mẹ
        />
        <AddSpouseForm
          opened={openModalSpouse}
          onClose={() => setOpenModalSpouse(false)}
          onSubmit={handleSpouseSubmit}
          currentMemberId={data.memberId}
          gender={data.gender}
          fullName={name}
        />
      </div>
    );
  }
);
