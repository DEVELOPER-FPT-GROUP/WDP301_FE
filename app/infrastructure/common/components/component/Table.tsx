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
}

export function TableComponent<T extends { id: string }>({
  columns,
  endpoint,
  onEdit,
  onDelete,
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
            {data?.data.length > 0 ? (
              data.data.map((row: T) => (
                <Table.Tr key={row.id}>
                  {columns.map((col) => (
                    <Table.Td key={col.key as string}>
                      {String(row[col.key])}
                    </Table.Td>
                  ))}
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon color="blue" onClick={() => onEdit(row)}>
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon color="red" onClick={() => onDelete(row)}>
                        <IconTrash size={18} />
                      </ActionIcon>
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
          total={data?.totalPages || 1}
          value={currentPage}
          onChange={setCurrentPage}
        />
      </Group>
    </>
  );
}
