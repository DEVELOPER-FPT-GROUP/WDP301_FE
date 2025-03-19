import { useState, useEffect } from "react";
import {
  Table,
  Pagination,
  TextInput,
  Select,
  Group,
  Loader,
  ActionIcon,
  Center,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";

interface TableProps<T> {
  columns: { key: keyof T; label: string }[];
  endpoint: string;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  showEdit?: boolean; // Điều khiển hiển thị nút Edit
  showDelete?: boolean; // Điều khiển hiển thị nút Delete
}

export function TableComponent<T extends { id: string }>({
  columns,
  endpoint,
  onEdit,
  onDelete,
  showEdit = true, // Mặc định hiển thị
  showDelete = true, // Mặc định hiển thị
}: TableProps<T>) {
  const perPageOptions = [10, 20, 50];
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageOptions[0]);

  const { data, isLoading, isFetching, refetch } = useGetApi({
    queryKey: ["users", currentPage, perPage, debouncedSearch],
    endpoint,
    queryParams: { page: currentPage, limit: perPage, search: debouncedSearch },
  });
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
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setDebouncedSearch(search);
              setCurrentPage(1);
            }
          }}
          style={{ flex: 1 }}
        />
      </Group>

      {isLoading || isFetching ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <Table striped highlightOnHover withTableBorder horizontalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.key as string}>{col.label}</Table.Th>
              ))}
              <Table.Th>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.data?.items.length > 0 ? (
              data.data.items.map((row: T) => (
                <Table.Tr key={row.id}>
                  {columns.map((col) => {
                    let value = row[col.key] as unknown as string; // Ép kiểu để tránh lỗi TypeScript

                    // Format từng giá trị theo cột
                    if (col.key === "price") {
                      value = formatCurrency(value as unknown as number); // Ép kiểu số
                    } else if (col.key === "subscription") {
                      value = formatSubscription(value);
                    } else if (col.key === "status") {
                      value = formatStatus(value);
                    } else if (col.key === "createdAt") {
                      value = formatDate(value);
                    }
                    return (
                      <Table.Td key={col.key as string}>
                        {String(value)}
                      </Table.Td>
                    );
                  })}
                  {(showEdit || showDelete) && (
                    <Table.Td>
                      <Group gap="xs">
                        {showEdit && (
                          <ActionIcon color="blue" onClick={() => onEdit(row)}>
                            <IconEdit size={18} />
                          </ActionIcon>
                        )}
                        {showDelete && (
                          <ActionIcon color="red" onClick={() => onDelete(row)}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Table.Td>
                  )}
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
      )}

      <Group justify="space-between" align="center" mt="md">
        <Group gap="xs" align="center">
          <span>Hiển thị</span>
          <Select
            data={perPageOptions.map((opt) => opt.toString())}
            value={perPage.toString()}
            onChange={(value) => {
              setPerPage(Number(value));
              setCurrentPage(1);
            }}
            allowDeselect={false}
            w={60}
            style={{ minWidth: "50px", textAlign: "center" }}
            size="xs"
          />
          <span>bản ghi / trang</span>
        </Group>
        <Pagination
          total={data?.data?.totalPages || 1}
          value={currentPage}
          onChange={setCurrentPage}
        />
      </Group>
    </>
  );
}
