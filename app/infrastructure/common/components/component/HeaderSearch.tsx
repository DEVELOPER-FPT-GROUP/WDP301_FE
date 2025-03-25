import {
  Box,
  Button,
  FileButton,
  Flex,
  Paper,
  TextInput,
  Image,
  LoadingOverlay,
  Text,
  Center,
  Card,
} from "@mantine/core";
import {
  IconSearch,
  IconUpload,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useState } from "react";
import { useGetApi, usePostApi } from "../../api/hooks/requestCommonHooks";
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";
import ModalHistory from "./ModalHistory";
import ModalDeath from "./ModalDeath";
import { useNavigate } from "react-router";

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
  const [activeFilter, setActiveFilter] = useState<string>("person");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [facialSearchResults, setFacialSearchResults] = useState<any[]>([]);
  const [noResults, setNoResults] = useState(false);
  const navigate = useNavigate();
  const familyId = getFamilyIdFromToken();

  // API mutation for facial search
  const facialSearchMutation = usePostApi({
    endpoint: "facial-search/search",
    queryParams: {
      similarityThreshold: 0.6,
      maxResults: 1000,
      sortBy: "similarity",
    },
    options: {
      onSuccess: (response) => {
        console.log("Facial search results:", response);

        // Filter results to only include members from the same family
        if (response && Array.isArray(response)) {
          const filteredResults = response.filter(
            (result) =>
              result.memberDetails && result.memberDetails.familyId === familyId
          );

          setFacialSearchResults(filteredResults);

          // Set no results flag if there are no matching results
          setNoResults(filteredResults.length === 0);
        } else {
          setFacialSearchResults([]);
          setNoResults(true);
        }
      },
      onError: (error) => {
        console.error("Error in facial search:", error);
        setFacialSearchResults([]);
        setNoResults(true);
      },
    },
  });

  // 🕯️ Ngày giỗ - only enabled when not searching by image
  const { data: deathData } = useGetApi({
    endpoint: `members/family/${familyId}/search/all`,
    queryKey: ["death", search, activeFilter],
    queryParams: {
      page: 1,
      limit: 1000,
      isAlive: false,
      search,
    },
    enabled: !imagePreview && activeFilter === "deathAnniversary",
  });

  // 📜 Lịch sử gia đình - only enabled when not searching by image
  const { data: historyData } = useGetApi({
    queryKey: ["history", search, activeFilter],
    endpoint: "family-history/family/:id/search/all",
    urlParams: { id: familyId },
    queryParams: { limit: 1000 },
    enabled: !imagePreview && activeFilter === "history",
  });

  // 👤 Thành viên - only enabled when not searching by image
  const { data: personData } = useGetApi({
    queryKey: ["members", search, activeFilter],
    endpoint: `members/family/${familyId}/search`,
    queryParams: {
      limit: 1000,
      search,
    },
    enabled: !imagePreview && activeFilter === "person",
  });

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    setUploadedImage(file);
    setNoResults(false); // Reset no results flag

    // Create image preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Set filter to person as we're searching by face
    setActiveFilter("person");

    // Prepare form data for API
    const formData = new FormData();
    formData.append("file", file);

    // Call the facial search API using the mutation
    facialSearchMutation.mutate(formData);
  };

  const clearImageSearch = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setFacialSearchResults([]);
    setNoResults(false);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  // Lấy danh sách phù hợp với bộ lọc
  const getResults = () => {
    // If we have facial search results, return those with memberDetails
    if (imagePreview) {
      return facialSearchResults;
    }

    if (!search.trim()) return [];

    if (activeFilter === "deathAnniversary" && deathData?.data) {
      return deathData.data;
    }

    if (activeFilter === "history" && historyData?.data) {
      return historyData.data;
    }

    if (activeFilter === "person" && personData?.data) {
      return personData.data.items;
    }

    return [];
  };

  const results = getResults();

  const handleFilterClick = (value: string) => {
    if (imagePreview) {
      clearImageSearch();
    }
    setActiveFilter(value);
    setSearch("");
    setSelectedItem(null);
    setNoResults(false);
  };

  const handleSelectItem = (item: any) => {
    if (item.memberDetails) {
      navigate("/detail-member", {
        state: {
          memberId: item.memberDetails.memberId,
        },
      });
      setSearch("");
      clearImageSearch();
      return;
    }

    if (activeFilter === "person") {
      navigate("/detail-member", {
        state: {
          memberId: item.memberId,
        },
      });
      setSearch("");
      return;
    }

    setSelectedItem(item);
    setModalOpened(true);
    setSearch("");
  };

  // No results message that shows when facial search returns no matches
  const renderNoResultsMessage = () => {
    if (!noResults || facialSearchMutation.isPending) return null;

    return (
      <Paper
        shadow="xs"
        p="md"
        radius="md"
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >
        <Center py="md">
          <Flex align="center" gap="xs">
            <IconAlertCircle size={18} color="var(--mantine-color-orange-6)" />
            <Text size="sm">Không tìm thấy thành viên nào phù hợp</Text>
          </Flex>
        </Center>
      </Paper>
    );
  };

  return (
    <>
      <Flex direction="column" w="40%" gap="xs">
        <Flex align="center" gap="xs">
          <Box style={{ position: "relative", width: "100%" }}>
            <Flex align="center" gap="xs">
              {/* Show image preview if available */}
              {imagePreview && (
                <Box style={{ position: "relative", width: 40, height: 40 }}>
                  <Image
                    src={imagePreview}
                    alt="Uploaded"
                    width={40}
                    height={40}
                    radius="md"
                    fit="cover"
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <Button
                    variant="subtle"
                    size="xs"
                    p={0}
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                    }}
                    onClick={clearImageSearch}
                    title="Xóa tìm kiếm bằng ảnh"
                  >
                    <IconX size={12} />
                  </Button>
                </Box>
              )}

              <TextInput
                placeholder={
                  facialSearchMutation.isPending
                    ? "Đang tìm kiếm..."
                    : imagePreview
                    ? "Tìm kiếm bằng khuôn mặt..."
                    : "Tìm kiếm..."
                }
                leftSection={!imagePreview && <IconSearch size={16} />}
                radius="md"
                size="sm"
                w="100%"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                disabled={!!imagePreview || facialSearchMutation.isPending}
              />
            </Flex>

            {/* Loading overlay for image search */}
            <LoadingOverlay visible={facialSearchMutation.isPending} />

            {/* No results message */}
            {renderNoResultsMessage()}

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
                {results.map((item: any, idx: number) => {
                  if (imagePreview) {
                    // Display facial search results
                    const member = item.memberDetails;
                    const fullName = `${member.firstName} ${member.middleName} ${member.lastName}`;
                    const avatarUrl = member.media?.[0]?.url || "";
                    const similarity = (item.similarity * 100).toFixed(2);

                    return (
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
                        <Flex align="center" gap="sm" justify="space-between">
                          <Flex align="center" gap="sm">
                            {avatarUrl && (
                              <Card
                                shadow="sm"
                                padding="xs"
                                radius="md"
                                withBorder
                                w={150}
                                style={{ marginLeft: 0 }}
                              >
                                <Image
                                  src={avatarUrl}
                                  alt="Avatar"
                                  width={40}
                                  height={40}
                                  radius="md"
                                  fit="contain"
                                />
                              </Card>
                            )}
                          </Flex>
                          <Text>{fullName}</Text>
                          <Text size="xs" c="dimmed">
                            Trùng khớp: {similarity} %
                          </Text>
                        </Flex>
                      </Box>
                    );
                  } else {
                    // Display regular search results
                    const fullName =
                      activeFilter === "person"
                        ? `${item.firstName} ${item.middleName} ${item.lastName}`
                        : "";

                    return (
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
                        {activeFilter === "history"
                          ? item.historicalRecordTitle
                          : activeFilter === "deathAnniversary"
                          ? `${item.firstName} ${item.middleName} ${item.lastName}`
                          : activeFilter === "person"
                          ? `${item.firstName} ${item.middleName} ${item.lastName}`
                          : item.fullname ||
                            item.name ||
                            item.title ||
                            "unknown"}
                      </Box>
                    );
                  }
                })}
              </Paper>
            )}
          </Box>

          {/* ⬆ Upload icon */}
          <FileButton
            onChange={handleFileUpload}
            accept="image/*"
            disabled={facialSearchMutation.isPending}
          >
            {(props) => (
              <Button
                variant="subtle"
                size="sm"
                {...props}
                px={10}
                title="Tìm kiếm bằng khuôn mặt"
              >
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
              disabled={!!imagePreview && filter.value !== "person"}
              title={
                imagePreview && filter.value !== "person"
                  ? "Xóa ảnh tìm kiếm để sử dụng bộ lọc này"
                  : undefined
              }
            >
              {filter.label}
            </Button>
          ))}
        </Flex>
      </Flex>

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
