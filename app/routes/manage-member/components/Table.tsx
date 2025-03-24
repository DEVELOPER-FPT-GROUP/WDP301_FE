import { useState } from "react";
import {
  Table,
  Pagination,
  TextInput,
  Select,
  Group,
  Loader,
  ActionIcon,
  Center,
  Box,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconRecycle,
  IconSearch,
} from "@tabler/icons-react";

interface TableProps<T> {
  columns: { key: keyof T; label: string }[];
  data: T[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  perPage: number;
  searchValue?: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearch: (searchTerm: string) => void;
  onEdit?: (row: T) => void; // Optional for deleted members
  onDelete?: (row: T) => void; // Optional for deleted members
  onRestore?: (row: T) => void; // For deleted members
}

export function TableComponent<T extends { memberId: string }>({
  columns,
  data,
  isLoading,
  totalItems,
  currentPage,
  perPage,
  searchValue = "",
  onPageChange,
  onPerPageChange,
  onSearch,
  onEdit,
  onDelete,
  onRestore,
}: TableProps<T>) {
  const perPageOptions = [10, 20, 50];
  const [search, setSearch] = useState(searchValue);

  const totalPages = Math.ceil(totalItems / perPage) || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    onSearch(search);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatSubscription = (value: string) => {
    const mapping: Record<string, string> = {
      six_people: "Gói cho nhóm 6 người",
      no_limit: "Gói không giới hạn",
      fifty_people: "Gói cho nhóm 50 người",
      thirty_people: "Gói cho nhóm 30 người",
      fifteen_people: "Gói cho nhóm 15 người",
    };
    return mapping[value] || value; // Nếu không tìm thấy, trả về nguyên gốc
  };

  // Chuyển đổi status thành tiếng Việt
  const formatStatus = (status: string) => {
    const statusMapping: Record<string, string> = {
      pending: "Chờ xử lý",
      active: "Hoạt động",
      expired: "Hết hạn",
      cancelled: "Đã hủy",
    };
    return statusMapping[status] || status; // Nếu không tìm thấy, trả về nguyên gốc
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Tìm kiếm..."
          value={search}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit();
            }
          }}
          rightSection={
            <ActionIcon onClick={handleSearchSubmit} variant="subtle">
              <IconSearch size={16} />
            </ActionIcon>
          }
          style={{ flex: 1 }}
        />
      </Group>

      {isLoading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <Box style={{ position: "relative", minHeight: "300px" }}>
          <Table
            striped
            highlightOnHover
            withTableBorder
            horizontalSpacing="sm"
          >
            <Table.Thead>
              <Table.Tr>
                {columns.map((col) => (
                  <Table.Th key={col.key.toString()}>{col.label}</Table.Th>
                ))}
                <Table.Th>Hành động</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data && data.length > 0 ? (
                data.map((row: T) => (
                  <Table.Tr key={row.memberId}>
                    {columns.map((col) => {
                      // Lấy giá trị và xử lý undefined
                      let value =
                        row[col.key] !== undefined ? row[col.key] : "";

                      // Format từng giá trị theo cột
                      if (col.key === "price" && value !== "") {
                        value = formatCurrency(value as unknown as number);
                      } else if (col.key === "subscription" && value !== "") {
                        value = formatSubscription(value as unknown as string);
                      } else if (col.key === "status" && value !== "") {
                        value = formatStatus(value as unknown as string);
                      } else if (col.key === "createdAt" && value !== "") {
                        value = formatDate(value as unknown as string);
                      }

                      return (
                        <Table.Td key={`${row.memberId}-${col.key.toString()}`}>
                          {String(value)}
                        </Table.Td>
                      );
                    })}
                    <Table.Td key={`${row.memberId}-actions`}>
                      <Group gap="xs">
                        {/* Show different actions based on whether it's the active or deleted tab */}
                        {onEdit && (
                          <ActionIcon
                            key={`${row.memberId}-edit`}
                            color="blue"
                            onClick={() => onEdit(row)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        )}
                        {onDelete && (
                          <ActionIcon
                            key={`${row.memberId}-delete`}
                            color="red"
                            onClick={() => onDelete(row)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        )}
                        {onRestore && (
                          <ActionIcon
                            key={`${row.memberId}-restore`}
                            color="green"
                            onClick={() => onRestore(row)}
                          >
                            <IconRecycle size={18} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td
                    colSpan={columns.length + 1}
                    style={{ textAlign: "center", color: "gray" }}
                  >
                    Không có bản ghi nào!
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      <Group justify="space-between" align="center" mt="md">
        <Group gap="xs" align="center">
          <span>Hiển thị</span>
          <Select
            data={perPageOptions.map((opt) => opt.toString())}
            value={perPage.toString()}
            onChange={(value) => {
              onPerPageChange(Number(value));
            }}
            allowDeselect={false}
            w={60}
            style={{ minWidth: "50px", textAlign: "center" }}
            size="xs"
          />
          <span>bản ghi / trang</span>
        </Group>
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={onPageChange}
        />
      </Group>
    </>
  );
}
