import { Modal, Button, Group, Text } from "@mantine/core";
import { useDeleteApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

const DeleteModal = ({ opened, onClose, data, refreshTable, title }: any) => {
  const deleteMutation = useDeleteApi({
    endpoint: data ? `accounts/${data.accountId}` : "",
    options: { onSuccess: refreshTable },
  });

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        notifySuccess({ title: "Thành công", message: `${title} đã bị xóa!` });
        onClose();
      },
      onError: () => notifyError({ title: "Lỗi", message: "Xóa thất bại!" }),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Xác nhận xóa"
      closeOnClickOutside={false}
    >
      <Text>
        Bạn có chắc chắn muốn xóa {title} "{data?.username}" không?
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Hủy
        </Button>
        <Button
          color="red"
          onClick={handleDelete}
          loading={deleteMutation.isPending}
        >
          Xóa
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteModal;
