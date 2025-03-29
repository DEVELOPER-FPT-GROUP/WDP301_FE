// components/EventDeleteModal.tsx
import { Button, Group, Modal, Text } from "@mantine/core";
import { useDeleteApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

export function EventDeleteModal({
  opened,
  onClose,
  eventId,
  eventName,
  onDeleted,
}: {
  opened: boolean;
  onClose: () => void;
  eventId: string | null;
  eventName: string;
  onDeleted: () => void;
}) {
  const deleteMutation = useDeleteApi({
    endpoint: `events/${eventId || ""}`, // endpoint cần cố định theo hook logic
  });

  const handleDelete = () => {
    if (!eventId) return;

    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        notifySuccess({ title: "Thành công", message: "Sự kiện đã bị xóa!" });
        onClose();
        onDeleted();
      },
      onError: () =>
        notifyError({ title: "Lỗi", message: "Xóa sự kiện thất bại!" }),
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
        Bạn có chắc chắn muốn xóa sự kiện "<b>{eventName}</b>" không?
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
}
