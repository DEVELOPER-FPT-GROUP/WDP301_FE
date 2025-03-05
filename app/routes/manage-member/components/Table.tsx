import { useState, useEffect } from "react";
import React from "react";
import {
  Table,
  Pagination,
  TextInput,
  Select,
  Group,
  Loader,
  ActionIcon,
  Center,
  Tabs,
  Badge,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconRestore,
  IconUsers,
  IconUserOff,
  IconSearch,
  IconEyeglass,
} from "@tabler/icons-react";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import type { BaseFamilyMemberData } from "~/routes/family-tree/react-flow-base/types";
import { useNavigate } from "react-router";
interface TableProps<T> {
  columns: { key: keyof T; label: string }[];
  endpoint: string;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  onRestore: (row: T) => void;
}

export function TableComponent<T extends BaseFamilyMemberData>({
  columns,
  endpoint,
  onEdit,
  onDelete,
  onRestore,
}: TableProps<T>) {
  const perPageOptions = [10, 20, 50];
  const [search, setSearch] = useState("");
  // const [debouncedSearch, setDebouncedSearch] = useState(""); // Commented out as requested
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageOptions[0]);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useGetApi({
    queryKey: ["member", currentPage, perPage],
    endpoint,
    queryParams: { page: currentPage, limit: perPage },
    // Removed debouncedSearch from queryParams
  });

  // Count deleted members
  const deletedMembersCount =
    data?.data.filter((row: T) => row.isDeleted).length || 0;

  useEffect(() => {
    if (data?.data) {
      // Filter the data based on the active tab
      const tabData = data.data
        .filter((row: T) =>
          activeTab === "active" ? !row.isDeleted : row.isDeleted
        )
        .reverse(); // Đảo ngược danh sách sau khi lọc

      // Apply name search if search term exists
      if (search) {
        const searchLower = search.toLowerCase();
        setFilteredData(
          tabData.filter((row: T) => {
            const name = String(
              `${row.firstName} ${row.middleName} ${row.lastName}` || ""
            ).toLowerCase();
            return name.includes(searchLower);
          })
        );
      } else {
        setFilteredData(tabData);
      }
    }
  }, [data?.data, activeTab, search]);

  // Updated to accept string | null
  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value);
      setSearch(""); // Clear search when changing tabs
      setCurrentPage(1); // Reset to first page when changing tabs
    }
  };

  const handleSearch = () => {
    // The filtering is now handled in the useEffect
    setCurrentPage(1); // Reset to first page when searching
  };

  const renderTable = (filteredData: T[], isDeletedTab: boolean) => (
    <Table striped highlightOnHover withTableBorder horizontalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>STT</Table.Th>
          {columns.map((col) => (
            <Table.Th key={col.key as string}>{col.label}</Table.Th>
          ))}
          <Table.Th>Ảnh</Table.Th>
          <Table.Th>Hành động</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {filteredData.length > 0 ? (
          filteredData.map((row: T, index: number) => (
            <Table.Tr key={row.memberId}>
              <Table.Td>{index + 1}</Table.Td>
              {columns.map((col) => (
                <Table.Td key={`${row.memberId}-${col.key as string}`}>
                  {String(row[col.key])}
                </Table.Td>
              ))}
              <Table.Td>
                <img
                  src={
                    row.gender === "male"
                      ? "/app/assets/image/male.png"
                      : "/app/assets/image/female.png"
                  }
                  alt="error-loading-image"
                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                />
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {isDeletedTab ? (
                    // Show only restore icon for deleted members
                    <ActionIcon color="green" onClick={() => onRestore(row)}>
                      <IconRestore size={18} />
                    </ActionIcon>
                  ) : (
                    // Show edit and delete icons for active members
                    <>
                      <ActionIcon
                        color="blue"
                        // onClick={() => navigate(`/detail-member`)}
                        onClick={() =>
                          navigate("/detail-member", {
                            state: {
                              memberId: row.memberId,
                            },
                          })
                        }
                      >
                        <IconEyeglass size={18} />
                      </ActionIcon>
                      <ActionIcon color="yellow" onClick={() => onEdit(row)}>
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon color="red" onClick={() => onDelete(row)}>
                        <IconTrash size={18} />
                      </ActionIcon>
                    </>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td
              colSpan={columns.length + 3}
              style={{ textAlign: "center", color: "gray" }}
            >
              Không có bản ghi nào!
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );

  return (
    <>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Tìm kiếm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          rightSection={
            <ActionIcon onClick={handleSearch}>
              <IconSearch size={18} />
            </ActionIcon>
          }
          style={{ flex: 1 }}
        />
      </Group>

      {isLoading || isFetching ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <Tabs
          defaultValue="active"
          value={activeTab}
          onChange={handleTabChange}
        >
          <Tabs.List>
            <Tabs.Tab value="active" leftSection={<IconUsers size={16} />}>
              Active Members Table
            </Tabs.Tab>
            <Tabs.Tab
              value="deleted"
              leftSection={<IconUserOff size={16} />}
              rightSection={
                deletedMembersCount > 0 ? (
                  <Badge color="red" size="sm" variant="filled" radius="xl">
                    {deletedMembersCount}
                  </Badge>
                ) : null
              }
            >
              Deleted Members Table
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="active">
            {renderTable(filteredData, false)}
          </Tabs.Panel>
          <Tabs.Panel value="deleted">
            {renderTable(filteredData, true)}
          </Tabs.Panel>
        </Tabs>
      )}

      <Group justify="space-between" align="center" mt="md">
        <Group gap="xs" align="center">
          <span>Hiển thị</span>
          <Select
            data={perPageOptions.map((opt) => opt.toString())}
            value={perPage.toString()}
            onChange={(value) => setPerPage(Number(value))}
            allowDeselect={false}
            w={60}
            style={{ minWidth: "50px", textAlign: "center" }}
            size="xs"
          />
          <span>bản ghi / trang</span>
        </Group>
        <Pagination
          total={Math.ceil((filteredData.length || 0) / perPage) || 1}
          value={currentPage}
          onChange={setCurrentPage}
        />
      </Group>
    </>
  );
}
