import { Modal, Button, Group, Text } from "@mantine/core";
import {
  useDeleteApi,
  usePutApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

const DeleteModal = ({ opened, onClose, data, refreshTable, title }: any) => {
  const putMutation = usePutApi({
    endpoint: `members/${data?.memberId}`,
    options: {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: "Ngày giỗ đã được xóa",
        });
        refreshTable();
        onClose();
      },
      onError: () => {
        notifyError({
          title: "Thất bại",
          message: "Có lỗi xảy ra khi lưu ngày giỗ dòng họ.",
        });
      },
    },
  });

  const handleDelete = () => {
    const payload = {
      isAlive: true,
      dateOfDeath: null,
      placeOfDeath: "",
      worship: "",
    };
    putMutation.mutate(payload);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Xác nhận xóa"
      closeOnClickOutside={false}
    >
      <Text>
        Bạn có chắc chắn muốn xóa {title} "{data?.historicalRecordTitle}" không?
      </Text>
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
