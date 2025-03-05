import { useState } from "react";
import { TableComponent } from "./components/Table";
import { AppShell, Group, Stack, Title } from "@mantine/core";
import DeleteMemberModal from "../../infrastructure/common/components/component/DeleteMemberModal";
import EditDetailMemberModal from "../../infrastructure/common/components/component/EditDetailMemberModal";
import RestoreMemberModal from "./components/RestoreMemberDeleted";
export const meta = () => [{ title: "Quản lý thành viên " }];
const route = () => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [editmodalOpened, setEditModalOpened] = useState(false);
  const [deleteMemberModalOpened, setDeleteMemberModalOpened] = useState(false);
  const [RestoreMemberModalOpened, setRestoreMemberModalOpened] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (data: any) => {
    setSelectedData(data);
    setDeleteMemberModalOpened(true);
  };

  const handleEdit = (data: any) => {
    setSelectedData(data);
    setEditModalOpened(true);
  };

  const handleRestore = (data: any) => {
    setSelectedData(data);
    setRestoreMemberModalOpened(true);
  };

  const refreshTable = () => setRefreshKey((prev) => prev + 1);

  const columns = [
    { key: "firstName", label: "Họ " },
    { key: "middleName", label: "Tên đệm" },
    { key: "lastName", label: "Tên" },
  ];

  return (
    <AppShell padding="xl" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} c="brown">
            Quản lý thành viên dòng họ
          </Title>
        </Group>
      </Stack>
      <TableComponent
        key={refreshKey}
        columns={columns}
        endpoint="members/get-members-in-family/67b09900dc5227c02b91d823"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />
      <EditDetailMemberModal
        opened={editmodalOpened}
        onClose={() => setEditModalOpened(false)}
        memberData={selectedData}
        refreshTable={refreshTable}
      />
      <DeleteMemberModal
        opened={deleteMemberModalOpened}
        onClose={() => setDeleteMemberModalOpened(false)}
        memberData={selectedData}
        refreshTable={refreshTable}
      />
      <RestoreMemberModal
        opened={RestoreMemberModalOpened}
        onClose={() => setRestoreMemberModalOpened(false)}
        memberData={selectedData}
        refreshTable={refreshTable}
      />
    </AppShell>
  );
};

export default route;
