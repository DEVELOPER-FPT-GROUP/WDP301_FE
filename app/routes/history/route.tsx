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
const getMemberIdFromToken = () => {
  const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);

  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.familyId; // 🛠️ Trích xuất memberId từ payload
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};
const FamilyHistory = () => {
  const [familyHistories, setFamilyHistories] = useState<FamilyStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<FamilyStory | null>(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const memberId = getMemberIdFromToken();
  const { data, isSuccess, isLoading } = useGetApi({
    queryKey: ["history"],
    endpoint: "family-history/family/:id/search",
    urlParams: { id: memberId },
    queryParams: { limit: 1000, sortByStartDate: true },
  });

  useEffect(() => {
    if (isSuccess && data) {
      setFamilyHistories(data.data.items);
    }
  }, [data, isSuccess]);

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

      {isLoading ? (
        <Center>
          <Loader color="blue" size="lg" />
        </Center>
      ) : familyHistories.length > 0 ? (
        <FamilyTimeline
          stories={familyHistories}
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
