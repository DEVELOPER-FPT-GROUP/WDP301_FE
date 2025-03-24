import React from "react";
import { Modal, Text, Group, Button, Alert } from "@mantine/core";
import { usePutApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

interface DeleteMemberModalProps {
  opened: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  onSuccess: () => void;
}

const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  opened,
  onClose,
  memberId,
  memberName,
  onSuccess,
}) => {
  const deleteMutation = usePutApi({
    endpoint: `/members/delete/${memberId}`,
    options: {
      onSuccess: onSuccess,
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(null, {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: `Đã xóa thành viên ${memberName} thành công!`,
        });
        onSuccess();
        onClose();
      },
      onError: (error: any) => {
        notifyError({
          title: "Thất bại",
          message:
            error?.response?.data?.message ||
            "Có lỗi xảy ra khi xóa thành viên.",
        });
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Xác nhận xóa"
      centered
      size="sm"
    >
      <Alert color="red" mb="md">
        Việc xóa thành viên này sẽ ảnh hưởng đến các thành viên có mối quan hệ
        với thành viên này. Hãy cân nhắc kỹ trước khi xóa.
      </Alert>
      <Text mb="xl">
        Bạn có chắc chắn muốn xóa thành viên <strong>{memberName}</strong> khỏi
        cây gia phả?
      </Text>
      <Group justify="space-between">
        <Button variant="light" onClick={onClose}>
          Hủy
        </Button>
        <Button color="red" onClick={handleDelete}>
          Xóa
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteMemberModal;
