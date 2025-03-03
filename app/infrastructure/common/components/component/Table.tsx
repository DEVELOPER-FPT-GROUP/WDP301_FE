import { useState, useEffect } from "react";
import {
  Table,
  Pagination,
  TextInput,
  Select,
  Group,
  Loader,
} from "@mantine/core";
import axios from "axios";

interface TableProps<T> {
  columns: { key: keyof T; label: string }[];
  endpoint: string;
}

export function TableComponent<T>({ columns, endpoint }: TableProps<T>) {
  const perPageOptions = [10, 20, 50];
  const [data, setData] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Chỉ update khi bấm Enter
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageOptions[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch data từ API
  const fetchData = async () => {
    setLoading(true);
    console.log(currentPage, perPage, debouncedSearch);

    try {
      const response = await axios.get(endpoint, {
        params: { page: currentPage, limit: perPage, search: debouncedSearch },
      });
      setData(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage, debouncedSearch]);

  return (
    <div style={{ padding: "16px", borderRadius: "8px", background: "#fff" }}>
      {/* Ô tìm kiếm */}
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Chỉ thay đổi search tạm thời
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setDebouncedSearch(search); // Chỉ cập nhật khi bấm Enter
              setCurrentPage(1);
            }
          }}
          style={{ flex: 1 }}
        />
      </Group>

      {/* Bảng dữ liệu */}
      {loading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.key as string}>{col.label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <Table.Tr key={rowIndex}>
                  {columns.map((col) => (
                    <Table.Td key={col.key as string}>
                      {String(row[col.key])}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={columns.length}
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
        {/* Hiển thị số bản ghi */}
        <Group gap="xs" align="center">
          <span>Hiển thị</span>
          <Select
            data={perPageOptions.map((opt) => opt.toString())}
            value={perPage.toString()}
            onChange={(value) => {
              setPerPage(Number(value));
              setCurrentPage(1); // Reset về trang đầu khi thay đổi limit
            }}
            allowDeselect={false}
            w={60} // 👈 Giảm kích thước Select
            style={{ minWidth: "50px", textAlign: "center" }} // 👈 Giữ tối thiểu 50px
            size="xs"
          />
          <span>bản ghi / trang</span>
        </Group>

        {/* Pagination */}
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={setCurrentPage}
        />
      </Group>
    </div>
  );
}
