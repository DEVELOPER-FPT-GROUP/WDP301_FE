import { useState } from "react";
import { TableComponent } from "~/infrastructure/common/components/component/Table";
import UserFormModal from "./components/UserFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import {
  ActionIcon,
  AppShell,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (user: any) => {
    setSelectedUser(user);
    setDeleteModalOpened(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setModalOpened(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalOpened(true);
  };

  const refreshTable = () => setRefreshKey((prev) => prev + 1);

  return (
    <AppShell padding="xl" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} c="blue">
            Quản lý người dùng
          </Title>
          <Tooltip label="Thêm User" position="bottom">
            <ActionIcon
              color="blue"
              size="lg"
              radius="xl"
              variant="filled"
              onClick={handleAddUser}
            >
              <IconPlus size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
      <TableComponent
        key={refreshKey}
        columns={[
          { key: "id", label: "ID" },
          { key: "firstName", label: "Tên" },
          { key: "middleName", label: "Email" },
        ]}
        endpoint="http://localhost:8080/users"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <UserFormModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        user={selectedUser}
        refreshTable={refreshTable}
      />
      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        user={selectedUser}
        refreshTable={refreshTable}
      />
    </AppShell>
  );
};

export default UserManagement;
