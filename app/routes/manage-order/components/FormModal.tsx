import { Modal, Button, Group, Select, Text } from "@mantine/core";
import { usePutApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import { useEffect, useState } from "react";

const FormModal = ({ opened, onClose, data, refreshTable, title }: any) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    "pending"
  );

  useEffect(() => {
    if (data?.status) {
      setSelectedStatus(data.status);
    }
  }, [data]); // Chạy lại khi `data` thay đổi
  const updateMutation = usePutApi({
    endpoint: data ? `orders/${data._id}/status` : "",
    options: {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: `Cập nhật trạng thái thành công!`,
        });
        refreshTable();
        onClose();
        setSelectedStatus(null);
      },
      onError: () =>
        notifyError({ title: "Lỗi", message: "Cập nhật trạng thái thất bại!" }),
    },
  });

  const handleUpdate = () => {
    if (!selectedStatus) return;

    updateMutation.mutate({ status: selectedStatus });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Cập nhật trạng thái đơn hàng"
      closeOnClickOutside={false}
    >
      <Text>Chọn trạng thái mới cho đơn hàng "{data?.transactionId}"</Text>
      <Select
        data={[
          { value: "pending", label: "Chờ xử lý" },
          { value: "active", label: "Hoạt động" },
          { value: "expired", label: "Hết hạn" },
          { value: "cancelled", label: "Đã hủy" },
        ]}
        value={selectedStatus}
        onChange={(value) => setSelectedStatus(value)}
        mt="md"
        allowDeselect={false}
      />

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          Hủy
        </Button>
        <Button
          color="blue"
          onClick={handleUpdate}
          loading={updateMutation.isPending}
        >
          Cập nhật
        </Button>
      </Group>
    </Modal>
  );
};

export default FormModal;
