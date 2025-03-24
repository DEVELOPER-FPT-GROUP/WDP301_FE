import { Modal, Button, Group, Text } from "@mantine/core";
import { useDeleteApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

const DeleteConfirmModal = ({ opened, onClose, user, refreshTable }: any) => {
  const deleteMutation = useDeleteApi({
    endpoint: user ? `users/${user.id}` : "",
    options: { onSuccess: refreshTable },
  });

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        notifySuccess({ title: "Thành công", message: "User đã bị xóa!" });
        onClose();
      },
      onError: () => notifyError({ title: "Lỗi", message: "Xóa thất bại!" }),
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Xác nhận xóa">
      <Text>Bạn có chắc chắn muốn xóa user "{user?.firstName}" không?</Text>
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

export default DeleteConfirmModal;
