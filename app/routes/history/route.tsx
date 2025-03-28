import { Center, Container, Loader, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import FamilyTimeline from "./components/FamilyTimeline";
import FamilyHistoryModal from "./components/FamilyHistoryModal";
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";

interface FamilyStory {
  historicalRecordId?: string;
  familyId?: string;
  historicalRecordTitle: string;
  historicalRecordSummary: string;
  historicalRecordDetails: string;
  startDate: string;
  endDate: string;
  base64Images?: { url: string }[];
}

export const meta = () => [{ title: "Lịch sử dòng họ" }];
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
const FamilyHistory = () => {
  const [selectedStory, setSelectedStory] = useState<FamilyStory | null>(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const familyId = getFamilyIdFromToken();

  const { data, isLoading, isFetching, refetch } = useGetApi({
    queryKey: ["history"],
    endpoint: "family-history/family/:id/search",
    urlParams: { id: familyId },
    queryParams: { limit: 1000, sortByStartDate: true },
  });

  const openViewModal = (story: FamilyStory) => {
    setSelectedStory(story);
    setViewModalOpened(true);
    setLoadingModal(true);
    setTimeout(() => setLoadingModal(false), 1000);
  };

  const closeViewModal = () => {
    setSelectedStory(null);
    setViewModalOpened(false);
  };

  return (
    <Container p="xl">
      <Title order={1} size={30} fw={700} c="brown" ta="center" mb="md">
        📖👨‍👩‍👧‍👦 Lịch sử dòng họ 👨‍👩‍👧‍👦📖
      </Title>

      {isLoading || isFetching ? (
        <Center>
          <Loader color="blue" size="lg" />
        </Center>
      ) : data?.data?.items.length > 0 ? (
        <FamilyTimeline
          stories={data?.data?.items}
          onSelectStory={openViewModal}
        />
      ) : (
        <Center mt="md">
          <Title order={3} size="sm" c="gray">
            Không có dữ liệu lịch sử gia đình.
          </Title>
        </Center>
      )}

      <FamilyHistoryModal
        story={selectedStory}
        opened={viewModalOpened}
        onClose={closeViewModal}
        loading={loadingModal}
      />
    </Container>
  );
};

export default FamilyHistory;
