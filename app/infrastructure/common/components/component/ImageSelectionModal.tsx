import React, { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Card,
  Image,
  Select,
  Button,
  Grid,
  Radio,
  Divider,
  Title,
  Paper,
  Badge,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";

interface MediaItem {
  ownerId: string;
  ownerType: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface MediaSelectionResult {
  id: string; // Sử dụng ownerId hoặc giá trị khác từ API
  url: string;
  status: "avatar" | "label" | "dump";
  memberId?: string;
}

interface ImageSelectionModalProps {
  media: MediaItem[];
  newMemberId: string;
  familyId: string | null;
  originalImage: string | null;
  onComplete: (result: MediaSelectionResult[]) => void;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  media,
  newMemberId,
  familyId,
  originalImage,
  onComplete,
}) => {
  // State cho ảnh đại diện đã chọn
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);

  // State cho việc nhận dạng người trong ảnh
  const [imageAssignments, setImageAssignments] = useState<
    {
      url: string;
      memberId: string | null;
      ownerId: string; // Sử dụng ownerId từ API thay vì UUID
    }[]
  >([]);

  // State cho danh sách thành viên
  const [familyMembers, setFamilyMembers] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  // Lấy danh sách thành viên trong gia đình
  const { data: memberData, isLoading } = useGetApi({
    queryKey: ["member", 1, 10, 0, familyId],
    endpoint: familyId ? `members/family/${familyId}/search` : "",
    queryParams: { page: 1, limit: 10 },
  });

  // Xử lý dữ liệu thành viên khi API trả về
  useEffect(() => {
    if (memberData?.data?.items) {
      const members = memberData.data.items.map((member: any) => ({
        value: member.memberId,
        label: `${member.firstName} ${member.middleName} ${member.lastName}`,
      }));
      setFamilyMembers(members);
    }
  }, [memberData]);

  // Khởi tạo dữ liệu ảnh khi component mount
  useEffect(() => {
    if (media && media.length > 0) {
      // Bỏ qua ảnh đầu tiên vì đó là ảnh avatar được chọn mặc định
      const otherImages = media.slice(1).map((item) => ({
        url: item.url,
        memberId: null,
        ownerId: item.ownerId, // Sử dụng ownerId từ API
      }));

      setImageAssignments(otherImages);
    }
  }, [media]);

  // Xử lý khi người dùng chọn thành viên cho một ảnh
  const handleMemberSelection = (
    imageOwnerId: string,
    memberId: string | null
  ) => {
    setImageAssignments((prev) =>
      prev.map((item) =>
        item.ownerId === imageOwnerId ? { ...item, memberId } : item
      )
    );
  };

  // Xử lý khi người dùng hoàn thành
  const handleSubmit = () => {
    // Chuẩn bị dữ liệu kết quả
    const result: MediaSelectionResult[] = [];

    // Thêm ảnh đại diện
    if (media && media.length > 0) {
      result.push({
        id: media[selectedAvatarIndex].ownerId, // Sử dụng ownerId từ API
        url: media[selectedAvatarIndex].url,
        status: "avatar",
        memberId: newMemberId,
      });
    }

    // Thêm các ảnh được gán nhãn
    imageAssignments.forEach((item) => {
      result.push({
        id: item.ownerId, // Sử dụng ownerId từ API
        url: item.url,
        status: item.memberId ? "label" : "dump",
        memberId: item.memberId || undefined,
      });
    });

    console.log("Final media selection data:", result);

    // Gọi callback và truyền dữ liệu
    onComplete(result);
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <Stack gap="xl">
      {/* Phần chọn ảnh đại diện */}
      <div>
        <Title order={4} mb="md">
          Chọn ảnh đại diện
        </Title>
        <Text color="dimmed" mb="md">
          Chọn ảnh bạn muốn sử dụng làm ảnh đại diện cho thành viên mới.
        </Text>

        <Grid>
          {/* Hiển thị ảnh gốc được upload */}
          {originalImage && (
            <Grid.Col span={4}>
              <Card shadow="sm" p="xs" withBorder>
                <Stack align="center">
                  <Text size="sm" fw={500} mb={5}>
                    Ảnh gốc đã tải lên
                  </Text>
                  <Image
                    src={originalImage}
                    height={180}
                    fit="contain"
                    alt="Original"
                    radius="md"
                  />
                </Stack>
              </Card>
            </Grid.Col>
          )}

          {/* Hiển thị các ảnh từ API để chọn làm avatar */}
          {media.map((item, index) => (
            <Grid.Col span={4} key={index}>
              <Card
                shadow="sm"
                p="xs"
                withBorder
                style={{
                  borderColor:
                    selectedAvatarIndex === index ? "blue" : undefined,
                  borderWidth: selectedAvatarIndex === index ? 2 : 1,
                  position: "relative",
                }}
              >
                {selectedAvatarIndex === index && (
                  <Badge
                    color="blue"
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      zIndex: 10,
                    }}
                  >
                    Đã chọn
                  </Badge>
                )}
                <Stack align="center">
                  <Radio
                    value={String(index)}
                    checked={selectedAvatarIndex === index}
                    onChange={() => setSelectedAvatarIndex(index)}
                    label="Chọn làm avatar"
                  />
                  <Box style={{ position: "relative" }}>
                    <Image
                      src={item.url}
                      height={180}
                      fit="contain"
                      alt={`Generated ${index + 1}`}
                      radius="md"
                    />
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </div>

      {/* Divider */}
      <Divider my="md" />

      {/* Phần nhận diện thành viên trong ảnh */}
      {imageAssignments.length > 0 && (
        <div>
          <Title order={4} mb="md">
            Nhận diện thành viên trong ảnh
          </Title>
          <Text color="dimmed" mb="md">
            Nếu bạn nhận ra thành viên gia đình trong các ảnh dưới đây, hãy chọn
            họ từ danh sách.
          </Text>

          <Grid>
            {imageAssignments.map((item, index) => (
              <Grid.Col span={4} key={item.ownerId}>
                <Paper shadow="sm" p="md" withBorder>
                  <Stack>
                    <Image
                      src={item.url}
                      height={180}
                      fit="contain"
                      alt={`Image ${index + 1}`}
                      radius="md"
                    />
                    <Select
                      label="Người trong ảnh"
                      placeholder="Chọn thành viên"
                      data={familyMembers}
                      value={item.memberId}
                      onChange={(value) =>
                        handleMemberSelection(item.ownerId, value)
                      }
                      searchable
                      clearable
                      nothingFoundMessage="Không tìm thấy thành viên nào"
                    />
                  </Stack>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </div>
      )}

      {/* Nút xác nhận */}
      <Group justify="flex-end" mt="xl">
        <Button variant="filled" color="blue" size="md" onClick={handleSubmit}>
          Hoàn thành
        </Button>
      </Group>
    </Stack>
  );
};

export default ImageSelectionModal;
