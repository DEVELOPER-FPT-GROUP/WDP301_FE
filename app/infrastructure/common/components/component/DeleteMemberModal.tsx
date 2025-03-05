import { Modal, Button, Group, Text } from "@mantine/core";
import { usePutApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

const DeleteModal = ({ opened, onClose, memberData, refreshTable }: any) => {
  const deleteMutation = usePutApi({
    endpoint: `/members/delete/${memberData?.memberId || ""}`,
    options: { onSuccess: refreshTable },
  });

  const handleDelete = () => {
    const isEmptyObject = (obj: object) =>
      obj && typeof obj === "object" && Object.keys(obj).length === 0;

    if (
      (memberData?.spouse && !isEmptyObject(memberData.spouse)) || // Chỉ chặn khi spouse có dữ liệu
      (memberData?.children && memberData.children.length > 0)
    ) {
      notifyError({
        title: "Không thể xóa",
        message: "Chỉ có thể xóa thành viên không có vợ, chồng hoặc con!",
      });
      onClose();
      return;
    }
    deleteMutation.mutate(null, {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: `${fullName} đã bị xóa!`,
        });
        onClose();
      },
      onError: (err) => {
        console.log(err);
        notifyError({ title: "Lỗi", message: "Xóa thất bại!" });
      },
    });
  };
  const fullName = `${memberData?.firstName} ${memberData?.middleName} ${memberData?.lastName}`;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={700} c="brown">
          Xóa thành viên
        </Text>
      }
    >
      <Text>Bạn có chắc chắn muốn xóa "{fullName}" không?</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Hủy
        </Button>
        <Button color="red" onClick={handleDelete}>
          Xóa
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteModal;
