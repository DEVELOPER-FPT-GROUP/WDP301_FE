import { useState, useEffect, useCallback } from "react";
import { TableComponent } from "./components/Table";
import {
  AppShell,
  Group,
  Stack,
  Title,
  Loader,
  Center,
  Text,
} from "@mantine/core";
import DeleteMemberModal from "../../infrastructure/common/components/component/DeleteMemberModal";
import EditDetailMemberModal from "../../infrastructure/common/components/component/EditDetailMemberModal";
import RestoreMemberModal from "./components/RestoreMemberDeleted";
import CreateFamilyLeaderForm from "../../infrastructure/common/components/component/CreateFamilyLeaderForm";
import ExportAccountsButton from "./components/ExportAccountsButton";
import { getDataFromToken } from "~/infrastructure/utils/common";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";

export const meta = () => [{ title: "Quản lý thành viên" }];

const Route = () => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(
    null
  );
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteMemberModalOpened, setDeleteMemberModalOpened] = useState(false);
  const [restoreMemberModalOpened, setRestoreMemberModalOpened] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [memberData, setMemberData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Lấy familyId từ token
  useEffect(() => {
    const token = getDataFromToken();
    if (token?.familyId) {
      setFamilyId(token.familyId);
    } else {
      console.error("Không lấy được familyId từ token!");
    }
  }, []);

  // Fetch data with pagination
  const endpoint = familyId ? `members/family/${familyId}/search` : "";
  const { data, isLoading, isFetching } = useGetApi({
    queryKey: ["member", currentPage, perPage, refreshKey, familyId],
    endpoint: endpoint,
    // Fixed limit to 10 items per page as requested
    queryParams: { page: currentPage, limit: perPage },
  });

  // Update local state when data changes
  useEffect(() => {
    if (data?.data) {
      setMemberData(data.data.items || []);
      setTotalItems(data.data.totalItems || 0);
      setDataLoaded(true);
    }
  }, [data]);

  const handleDelete = useCallback((data: any) => {
    setSelectedMemberId(data.memberId);
    setSelectedMemberName(
      `${data.firstName || ""} ${data.middleName || ""} ${
        data.lastName || ""
      }`.trim()
    );
    setDeleteMemberModalOpened(true);
  }, []);

  const handleEdit = useCallback((data: any) => {
    setSelectedMemberId(data.memberId);
    setEditModalOpened(true);
  }, []);

  const handleRestore = useCallback((data: any) => {
    setSelectedData(data);
    setRestoreMemberModalOpened(true);
  }, []);

  const refreshTable = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleFamilyLeaderCreated = () => {
    refreshTable(); // Refresh the data after creating a family leader
  };

  const columns = [
    { key: "firstName", label: "Họ" },
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

          {/* Show export button only when there is member data */}
          {dataLoaded && memberData.length > 0 && (
            <ExportAccountsButton memberData={memberData} />
          )}
        </Group>
      </Stack>

      {/* Check for familyId before rendering content */}
      {!familyId ? (
        <p style={{ color: "red", textAlign: "center" }}>
          Không tìm thấy ID dòng họ! Vui lòng đăng nhập lại.
        </p>
      ) : isLoading || isFetching ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : dataLoaded && totalItems === 0 ? (
        /* Only show Create Family Leader Form when there are no members */
        <Center style={{ width: "100%", height: "70vh" }}>
          <div
            style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}
            className="mt-20"
          >
            <Text mt="xl" mb="xl" size="xl" c="red" fw={500}>
              Bạn cần tạo thông tin trưởng họ để bắt đầu quản lý thành viên dòng
              họ
            </Text>
            <CreateFamilyLeaderForm
              onSuccess={handleFamilyLeaderCreated}
              familyId={familyId}
            />
          </div>
        </Center>
      ) : (
        /* Show table when there are members */
        <TableComponent
          key={refreshKey}
          columns={columns}
          data={memberData || []}
          isLoading={isLoading || isFetching}
          totalItems={totalItems}
          currentPage={currentPage}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      )}

      {/* Only render the EditDetailMemberModal when selectedMemberId exists */}
      {selectedMemberId && (
        <EditDetailMemberModal
          opened={editModalOpened}
          onClose={() => {
            setEditModalOpened(false);
            setSelectedMemberId(null);
          }}
          memberId={selectedMemberId}
          refreshState={refreshTable}
        />
      )}

      <DeleteMemberModal
        opened={deleteMemberModalOpened}
        onClose={() => setDeleteMemberModalOpened(false)}
        memberId={selectedMemberId || ""}
        memberName={selectedMemberName || ""}
        onSuccess={refreshTable}
      />

      <RestoreMemberModal
        opened={restoreMemberModalOpened}
        onClose={() => setRestoreMemberModalOpened(false)}
        memberData={selectedData}
        refreshTable={refreshTable}
      />
    </AppShell>
  );
};

export default Route;
