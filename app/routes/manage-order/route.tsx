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
export const meta = () => [{ title: "Lịch sử dòng họ" }];

const route = () => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (data: any) => {
    console.log("hello world");
  };

  const handleEdit = (data: any) => {
    setSelectedData(data);
    setModalOpened(true);
  };

  const refreshTable = () => setRefreshKey((prev) => prev + 1);

  const columns = [
    { key: "transactionId", label: "Mã giao dịch" },
    { key: "fullName", label: "Họ và tên" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Số điện thoại" },
    { key: "subscription", label: "Gói dịch vụ" },
    { key: "price", label: "Tống tiền" },
    { key: "createdAt", label: "Ngày mua" },
    { key: "status", label: "Trạng thái" },
  ];

  return (
    <AppShell padding="xl" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} c="brown">
            Quản lý đơn hàng
          </Title>
        </Group>
      </Stack>
      <TableComponent
        key={refreshKey}
        columns={columns}
        endpoint={`/orders/search`}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showDelete={false}
      />
      <FormModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        data={selectedData}
        refreshTable={refreshTable}
      />
    </AppShell>
  );
};

export default route;
