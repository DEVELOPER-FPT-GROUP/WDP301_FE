import { useEffect, useState } from "react";
import { Modal, TextInput, Button, Stack } from "@mantine/core";
import {
  usePostApi,
  usePutApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

const UserFormModal = ({ opened, onClose, user, refreshTable }: any) => {
  const [formData, setFormData] = useState({ firstName: "", middleName: "" });

  useEffect(() => {
    setFormData(
      user
        ? { firstName: user.firstName, middleName: user.middleName }
        : { firstName: "", middleName: "" }
    );
  }, [user]);

  const createMutation = usePostApi({
    endpoint: "users",
    options: { onSuccess: refreshTable },
  });
  const updateMutation = usePutApi({
    endpoint: user ? `users/${user.id}` : "",
    options: { onSuccess: refreshTable },
  });

  const handleSubmit = () => {
    const mutation = user ? updateMutation : createMutation;
    mutation.mutate(formData, {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: user ? "User đã được cập nhật!" : "User đã được thêm!",
        });
        onClose();
      },
      onError: () => notifyError({ title: "Lỗi", message: "Có lỗi xảy ra!" }),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={user ? "Sửa User" : "Thêm User"}
    >
      <Stack>
        <TextInput
          label="Tên"
          name="firstName"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
        />
        <TextInput
          label="Email"
          name="middleName"
          value={formData.middleName}
          onChange={(e) =>
            setFormData({ ...formData, middleName: e.target.value })
          }
        />
        <Button onClick={handleSubmit}>{user ? "Cập nhật" : "Thêm"}</Button>
      </Stack>
    </Modal>
  );
};

export default UserFormModal;
