import { useState, useEffect, useCallback } from "react";
import { TableComponent } from "./components/Table";
import {
  AppShell,
  Group,
  Stack,
  Title,
  Loader,
  Center,
  Tabs,
  Text,
} from "@mantine/core";
import { IconUserCheck, IconUserX } from "@tabler/icons-react";
import DeleteMemberModal from "../../infrastructure/common/components/component/DeleteMemberModal";
import EditDetailMemberModal from "../../infrastructure/common/components/component/EditDetailMemberModal";
import RestoreMemberModal from "./components/RestoreMemberDeleted";
import CreateFamilyLeaderForm from "../../infrastructure/common/components/component/CreateFamilyLeaderForm";
import ExportAccountsButton from "./components/ExportAccountsButton";
import { getDataFromToken } from "~/infrastructure/utils/common";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";

export const meta = () => [{ title: "Quản lý thành viên" }];

const Route = () => {
  const [activeTab, setActiveTab] = useState<string>("active"); // "active" or "deleted"
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(
    null
  );
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteMemberModalOpened, setDeleteMemberModalOpened] = useState(false);
  const [restoreMemberModalOpened, setRestoreMemberModalOpened] =
    useState(false);
  const [refreshKeyActive, setRefreshKeyActive] = useState(0);
  const [refreshKeyDeleted, setRefreshKeyDeleted] = useState(0);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<any[]>([]);
  const [totalActiveItems, setTotalActiveItems] = useState(0);
  const [totalDeletedItems, setTotalDeletedItems] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy familyId từ token
  useEffect(() => {
    const token = getDataFromToken();
    if (token?.familyId) {
      setFamilyId(token.familyId);
    } else {
      console.error("Không lấy được familyId từ token!");
    }
  }, []);

  // Fetch active members (isDeleted = false)
  const endpointActive = familyId ? `members/family/${familyId}/search` : "";
  const {
    data: activeData,
    isLoading: isLoadingActive,
    isFetching: isFetchingActive,
  } = useGetApi({
    queryKey: [
      "activeMembers",
      currentPage,
      perPage,
      refreshKeyActive,
      familyId,
      searchTerm,
    ],
    endpoint: endpointActive,
    queryParams: {
      page: currentPage,
      limit: perPage,
      isDeleted: false,
      search: searchTerm || undefined, // Only add search param if it has a value
    },
  });

  // Fetch deleted members (isDeleted = true)
  const endpointDeleted = familyId ? `members/family/${familyId}/search` : "";
  const {
    data: deletedData,
    isLoading: isLoadingDeleted,
    isFetching: isFetchingDeleted,
  } = useGetApi({
    queryKey: [
      "deletedMembers",
      currentPage,
      perPage,
      refreshKeyDeleted,
      familyId,
      searchTerm,
    ],
    endpoint: endpointDeleted,
    queryParams: {
      page: currentPage,
      limit: perPage,
      isDeleted: true,
      search: searchTerm || undefined, // Only add search param if it has a value
    },
  });

  // Update local state when active data changes
  useEffect(() => {
    if (activeData?.data) {
      setActiveMembers(activeData.data.items || []);
      setTotalActiveItems(activeData.data.totalItems || 0);
      setDataLoaded(true);
    }
  }, [activeData]);

  // Update local state when deleted data changes
  useEffect(() => {
    if (deletedData?.data) {
      setDeletedMembers(deletedData.data.items || []);
      setTotalDeletedItems(deletedData.data.totalItems || 0);
    }
  }, [deletedData]);

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

  const refreshActiveTable = useCallback(() => {
    setRefreshKeyActive((prev) => prev + 1);
  }, []);

  const refreshDeletedTable = useCallback(() => {
    setRefreshKeyDeleted((prev) => prev + 1);
  }, []);

  // Refresh both tables - useful after operations that affect both lists
  const refreshAllTables = useCallback(() => {
    refreshActiveTable();
    refreshDeletedTable();
  }, [refreshActiveTable, refreshDeletedTable]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleFamilyLeaderCreated = () => {
    refreshAllTables(); // Refresh the data after creating a family leader
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  };

  const columns = [
    { key: "firstName", label: "Họ" },
    { key: "middleName", label: "Tên đệm" },
    { key: "lastName", label: "Tên" },
  ];

  // Get current members data based on active tab
  const currentMembers =
    activeTab === "active" ? activeMembers : deletedMembers;
  const totalItems =
    activeTab === "active" ? totalActiveItems : totalDeletedItems;
  const isLoading = activeTab === "active" ? isLoadingActive : isLoadingDeleted;
  const isFetching =
    activeTab === "active" ? isFetchingActive : isFetchingDeleted;

  return (
    <AppShell padding="xl" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Stack>
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} c="brown">
            Quản lý thành viên dòng họ
          </Title>

          {/* Show export button only when there is member data */}
          {dataLoaded && activeMembers.length > 0 && (
            <ExportAccountsButton memberData={activeMembers} />
          )}
        </Group>
      </Stack>

      {/* Check for familyId before rendering content */}
      {!familyId ? (
        <p style={{ color: "red", textAlign: "center" }}>
          Không tìm thấy ID dòng họ! Vui lòng đăng nhập lại.
        </p>
      ) : isLoadingActive && isLoadingDeleted ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : dataLoaded && totalActiveItems === 0 && totalDeletedItems === 0 ? (
        /* Only show Create Family Leader Form when there are no members at all */
        <Center style={{ width: "100%", height: "70vh" }}>
          <div
            style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}
            className="mt-20"
          >
            <CreateFamilyLeaderForm
              onSuccess={handleFamilyLeaderCreated}
              familyId={familyId}
            />
          </div>
        </Center>
      ) : (
        /* Show tabs and table when there are members */
        <>
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value as string)}
          >
            <Tabs.List>
              <Tabs.Tab
                value="active"
                leftSection={<IconUserCheck size={16} />}
              >
                Thành viên (
                <Text span c="red" fw={700}>
                  {totalActiveItems}
                </Text>
                )
              </Tabs.Tab>
              <Tabs.Tab value="deleted" leftSection={<IconUserX size={16} />}>
                Đã xóa (
                <Text span c="red" fw={700}>
                  {totalDeletedItems}
                </Text>
                )
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <TableComponent
            key={activeTab === "active" ? refreshKeyActive : refreshKeyDeleted}
            columns={columns}
            data={currentMembers || []}
            isLoading={isLoading || isFetching}
            totalItems={totalItems}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            onSearch={handleSearch}
            searchValue={searchTerm}
            onEdit={activeTab === "active" ? handleEdit : undefined} // Only allow editing active members
            onDelete={activeTab === "active" ? handleDelete : undefined} // Only allow deleting active members
            onRestore={activeTab === "deleted" ? handleRestore : undefined} // Only allow restoring deleted members
          />
        </>
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
          refreshState={refreshAllTables}
        />
      )}

      <DeleteMemberModal
        opened={deleteMemberModalOpened}
        onClose={() => setDeleteMemberModalOpened(false)}
        memberId={selectedMemberId || ""}
        memberName={selectedMemberName || ""}
        onSuccess={refreshAllTables}
      />

      <RestoreMemberModal
        opened={restoreMemberModalOpened}
        onClose={() => setRestoreMemberModalOpened(false)}
        memberData={selectedData}
        refreshTable={refreshAllTables}
      />
    </AppShell>
  );
};

export default Route;
