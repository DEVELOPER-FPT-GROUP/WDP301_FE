import { useState } from "react";
import { TableComponent } from "~/infrastructure/common/components/component/Table";
import {
  ActionIcon,
  AppShell,
  Group,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import DeleteModal from "./components/DeleteModal";
export const meta = () => [{ title: "Quản lý tài khoản" }];

const route = () => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (data: any) => {
    setSelectedData(data);
    setDeleteModalOpened(true);
  };
  const handleEdit = (data: any) => {
    console.log("hello world");
  };

  const refreshTable = () => setRefreshKey((prev) => prev + 1);

  const columns = [
    { key: "username", label: "Tên người dùng" },
    { key: "email", label: "Email" },
  ];

  return (
    <AppShell padding="xl" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} c="brown">
            Quản lý tài khoản
          </Title>
        </Group>
      </Stack>
      <TableComponent
        key={refreshKey}
        columns={columns}
        endpoint={`accounts`}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showEdit={false}
      />
      <DeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        data={selectedData}
        refreshTable={refreshTable}
        title="tài khoản"
      />
    </AppShell>
  );
};

export default route;
