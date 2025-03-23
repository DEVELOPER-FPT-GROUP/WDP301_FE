import { Box, Button, FileButton, Flex, Paper, TextInput } from "@mantine/core";
import { IconSearch, IconUpload } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useGetApi } from "../../api/hooks/requestCommonHooks";
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";
import ModalPerson from "./ModalPerson";
import ModalHistory from "./ModalHistory";
import ModalDeath from "./ModalDeath";
import { log } from "util";

const getFamilyIdFromToken = () => {
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

const HeaderSearch = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const familyId = getFamilyIdFromToken();

  // 🕯️ Ngày giỗ
  const { data: deathData } = useGetApi({
    endpoint: `members/family/${familyId}/search/all`,
    queryKey: ["death", search, activeFilter],
    queryParams: {
      page: 1,
      limit: 1000,
      isAlive: false,
      search,
    },
  });

  // 📜 Lịch sử gia đình
  const { data: historyData } = useGetApi({
    queryKey: ["history", search, activeFilter],
    endpoint: "family-history/family/:id/search/all",
    urlParams: { id: familyId },
    queryParams: { limit: 1000 },
  });

  // 👤 Thành viên
  const { data: personData } = useGetApi({
    queryKey: ["members", search, activeFilter],
    endpoint: `members/family/${familyId}/search`,
    queryParams: {
      limit: 1000,
      search,
    },
  });

  // Lấy danh sách phù hợp với bộ lọc
  const getResults = () => {
    if (!search.trim()) return [];

    if (activeFilter === "deathAnniversary" && deathData?.data) {
      return deathData.data;
    }

    if (activeFilter === "history" && historyData?.data) {
      return historyData.data;
    }

    if (activeFilter === "person" && personData?.data) {
      return personData.data;
    }

    return [];
  };

  const results = getResults();

  const handleFilterClick = (value: string) => {
    setActiveFilter(value);
    setSearch("");
    setSelectedItem(null);
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setModalOpened(true);
    setSearch("");
  };

  return (
    <>
      <Flex direction="column" w="40%" gap="xs">
        <Flex align="center" gap="xs">
          <Box style={{ position: "relative", width: "100%" }}>
            <TextInput
              placeholder="Tìm kiếm..."
              leftSection={<IconSearch size={16} />}
              radius="md"
              size="sm"
              w="100%"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />

            {results.length > 0 && (
              <Paper
                shadow="xs"
                p="xs"
                radius="md"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 9999,
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {results.map((item: any, idx: number) => (
                  <Box
                    key={idx}
                    p="xs"
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f1f3f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                    onClick={() => handleSelectItem(item)}
                  >
                    {/* Tuỳ theo bộ lọc thì hiện fullname / title */}
                    {activeFilter === "history"
                      ? item.historicalRecordTitle
                      : activeFilter === "deathAnniversary"
                      ? `${item.firstName} ${item.middleName} ${item.lastName}`
                      : item.fullname || item.name}
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          {/* ⬆ Upload icon */}
          <FileButton onChange={(file) => console.log(file)} accept="image/*">
            {(props) => (
              <Button variant="subtle" size="sm" {...props} px={10}>
                <IconUpload size={18} />
              </Button>
            )}
          </FileButton>
        </Flex>

        {/* 🔘 Bộ lọc */}
        <Flex gap="sm" justify="center">
          {[
            { label: "Người", value: "person" },
            { label: "Lịch sử gia đình", value: "history" },
            { label: "Ngày giỗ", value: "deathAnniversary" },
          ].map((filter) => (
            <Button
              key={filter.value}
              size="xs"
              variant={activeFilter === filter.value ? "filled" : "light"}
              color={activeFilter === filter.value ? "blue" : "gray"}
              onClick={() => handleFilterClick(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* 🪟 Hiển thị modal tương ứng */}
      {activeFilter === "person" && selectedItem && (
        <ModalPerson
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          data={selectedItem}
        />
      )}

      {activeFilter === "history" && selectedItem && (
        <ModalHistory
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          data={selectedItem}
        />
      )}

      {activeFilter === "deathAnniversary" && selectedItem && (
        <ModalDeath
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          data={selectedItem}
        />
      )}
    </>
  );
};

export default HeaderSearch;
