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
import { IconPlus } from "@tabler/icons-react";
import FormModal from "./components/FormModal";
import DeleteModal from "./components/DeleteModal";
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";

export const meta = () => [{ title: "Ngày giỗ các cụ" }];
const getMemberIdFromToken = () => {
  const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);

  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.familyId;
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};
const route = () => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (data: any) => {
    setSelectedData(data);
    setDeleteModalOpened(true);
  };

  const handleEdit = (data: any) => {
    setSelectedData(data);
    setModalOpened(true);
  };

  const handleAddData = () => {
    setSelectedData(null);
    setModalOpened(true);
  };
  const memberId = getMemberIdFromToken();
  const refreshTable = () => setRefreshKey((prev) => prev + 1);

  const columns = [
    { key: "firstName", label: "Họ và tên" },
    { key: "dateOfDeath", label: "Ngày giỗ" },
    { key: "placeOfDeath", label: "An táng" },
    { key: "worship", label: "Thờ cúng tại" },
  ];

  return (
    <AppShell padding="xl" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} c="brown">
            Quản lý ngày giỗ các cụ
          </Title>
          {/* <Tooltip label="Thêm lịch sử" position="bottom">
            <ActionIcon
              color="brown"
              size="lg"
              radius="xl"
              variant="filled"
              onClick={handleAddData}
            >
              <IconPlus size={20} />
            </ActionIcon>
          </Tooltip> */}
        </Group>
      </Stack>
      <TableComponent
        key={refreshKey}
        columns={columns}
        endpoint={`members/family/${memberId}/search?isAlive=false`}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <FormModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        data={selectedData}
        refreshTable={refreshTable}
      />
      <DeleteModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        data={selectedData}
        refreshTable={refreshTable}
        title="Lịch sử"
      />
    </AppShell>
  );
};

export default route;
