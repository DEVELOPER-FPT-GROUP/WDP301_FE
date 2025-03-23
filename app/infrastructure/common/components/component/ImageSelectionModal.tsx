import React, { useState, useEffect, useRef } from "react";
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
  Alert,
  Center,
  Flex,
} from "@mantine/core";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { IconAlertCircle, IconPhoto } from "@tabler/icons-react";

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
  id: string;
  url: string;
  status: "avatar" | "label" | "unknown";
  memberId?: string; // Chỉ tồn tại khi status là avatar hoặc label
}

// Thêm interface mới cho các tiêu đề có thể tùy chỉnh
interface CustomTexts {
  originalImageTitle?: string;
  selectAvatarTitle?: string;
  selectAvatarDescription?: string;
  confirmRelativesTitle?: string;
  confirmRelativesDescription?: string;
  labelImagesTitle?: string;
  labelImagesDescription?: string;
  noButton?: string;
  yesButton?: string;
  finishButton?: string;
  nextButton?: string;
  cancelButton?: string;
  requiredAvatarMessage?: string; // Thêm message mới cho thông báo avatar bắt buộc
  tooltipMessage?: string; // Thêm message cho tooltip
  multipleImagesProcessingTitle?: string; // Tiêu đề xử lý nhiều ảnh
  multipleImagesProcessingDescription?: string; // Mô tả xử lý nhiều ảnh
}

interface ImageSelectionModalProps {
  media: MediaItem[];
  newMemberId: string;
  familyId: string | null;
  originalImage: string | null;
  onComplete: (result: MediaSelectionResult[]) => void;
  onCancel?: () => void; // Thêm callback khi người dùng hủy
  modalType?: "add-child" | "add-spouse" | "edit-member" | "add-leader"; // Thêm loại modal add-leader
  customTexts?: CustomTexts; // Thêm các tiêu đề tùy chỉnh
  disableClose?: boolean; // Thêm prop để vô hiệu hóa nút đóng
}

interface FamilyMember {
  memberId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  media?: string;
}

// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-03-23 04:02:45
// Current User's Login: HE171216

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  media,
  newMemberId,
  familyId,
  originalImage,
  onComplete,
  onCancel,
  modalType = "add-child",
  customTexts = {},
}) => {
  // Ref để ẩn nút close
  const modalRef = useRef<HTMLDivElement>(null);

  // Định nghĩa các tiêu đề mặc định dựa trên loại modal
  const getDefaultTexts = (): CustomTexts => {
    switch (modalType) {
      case "add-leader":
        return {
          originalImageTitle: "Ảnh gốc đã tải lên",
          selectAvatarTitle: "Chọn ảnh đại diện cho trưởng họ",
          selectAvatarDescription:
            "Vui lòng chọn một ảnh để làm ảnh đại diện cho trưởng họ mới.",
          confirmRelativesTitle: "Xác nhận nhận diện người thân",
          confirmRelativesDescription:
            "Trong các ảnh còn lại, có ảnh nào là của người thân trong dòng họ không?",
          labelImagesTitle: "Nhận diện thành viên trong ảnh",
          labelImagesDescription:
            "Nếu bạn nhận ra thành viên trong các ảnh dưới đây, hãy chọn họ từ danh sách.",
          noButton: "Hủy",
          yesButton: "Có, tôi muốn nhận diện",
          finishButton: "Hoàn thành",
          nextButton: "Xác nhận avatar",
          cancelButton: "Hủy",
          requiredAvatarMessage:
            "Bạn buộc phải chọn một ảnh đại diện cho trưởng họ.",
          tooltipMessage: "Bạn phải chọn một ảnh đại diện trước khi tiếp tục.",
          multipleImagesProcessingTitle: "Xử lý nhiều ảnh cho trưởng họ",
          multipleImagesProcessingDescription:
            "Chúng tôi đã phát hiện nhiều ảnh được tải lên. Vui lòng xử lý chúng theo các bước sau.",
        };
      case "add-spouse":
        return {
          originalImageTitle: "Ảnh gốc đã tải lên",
          selectAvatarTitle: "Chọn ảnh đại diện",
          selectAvatarDescription:
            "Vui lòng chọn một ảnh để làm ảnh đại diện cho người phối ngẫu.",
          confirmRelativesTitle: "Xác nhận nhận diện người thân",
          confirmRelativesDescription:
            "Một số ảnh khác đã được tải lên cùng với ảnh đại diện. Bạn có muốn gán những ảnh này cho các thành viên khác trong gia đình không?",
          labelImagesTitle: "Nhận diện thành viên trong ảnh",
          labelImagesDescription:
            "Nếu bạn nhận ra thành viên gia đình trong các ảnh dưới đây, hãy chọn họ từ danh sách.",
          noButton: "Hủy",
          yesButton: "Có, tôi muốn nhận diện",
          finishButton: "Hoàn thành",
          nextButton: "Tiếp tục",
          cancelButton: "Hủy",
          multipleImagesProcessingTitle: "Xử lý nhiều ảnh cho người phối ngẫu",
          multipleImagesProcessingDescription:
            "Chúng tôi đã phát hiện nhiều ảnh được tải lên. Vui lòng xử lý chúng theo các bước sau.",
        };
      case "edit-member":
        return {
          originalImageTitle: "Ảnh gốc đã tải lên",
          selectAvatarTitle: "Chọn ảnh đại diện mới",
          selectAvatarDescription:
            "Vui lòng chọn một ảnh để cập nhật ảnh đại diện.",
          confirmRelativesTitle: "Xác nhận nhận diện người thân",
          confirmRelativesDescription:
            "Một số ảnh khác đã được tải lên cùng với ảnh đại diện. Bạn có muốn gán những ảnh này cho các thành viên khác trong gia đình không?",
          labelImagesTitle: "Nhận diện thành viên trong ảnh",
          labelImagesDescription:
            "Nếu bạn nhận ra thành viên gia đình trong các ảnh dưới đây, hãy chọn họ từ danh sách.",
          noButton: "Hủy",
          yesButton: "Có, tôi muốn nhận diện",
          finishButton: "Hoàn thành",
          nextButton: "Tiếp tục",
          cancelButton: "Hủy",
          multipleImagesProcessingTitle:
            "Xử lý nhiều ảnh khi chỉnh sửa thành viên",
          multipleImagesProcessingDescription:
            "Chúng tôi đã phát hiện nhiều ảnh được tải lên. Vui lòng xử lý chúng theo các bước sau.",
        };
      default: // add-child
        return {
          originalImageTitle: "Ảnh gốc đã tải lên",
          selectAvatarTitle: "Chọn ảnh đại diện",
          selectAvatarDescription:
            "Vui lòng chọn một ảnh để làm ảnh đại diện cho thành viên mới.",
          confirmRelativesTitle: "Xác nhận nhận diện người thân",
          confirmRelativesDescription:
            "Một số ảnh khác đã được tải lên cùng với ảnh đại diện. Bạn có muốn gán những ảnh này cho các thành viên khác trong gia đình không?",
          labelImagesTitle: "Nhận diện thành viên trong ảnh",
          labelImagesDescription:
            "Nếu bạn nhận ra thành viên gia đình trong các ảnh dưới đây, hãy chọn họ từ danh sách.",
          noButton: "Hủy",
          yesButton: "Có, tôi muốn nhận diện",
          finishButton: "Hoàn thành",
          nextButton: "Tiếp tục",
          cancelButton: "Hủy",
          multipleImagesProcessingTitle: "Xử lý nhiều ảnh cho thành viên mới",
          multipleImagesProcessingDescription:
            "Chúng tôi đã phát hiện nhiều ảnh được tải lên. Vui lòng xử lý chúng theo các bước sau.",
        };
    }
  };

  // Kết hợp tiêu đề mặc định với tiêu đề tùy chỉnh
  const texts = { ...getDefaultTexts(), ...customTexts };

  // State cho ảnh đại diện đã chọn
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number | null>(
    null
  );

  // Thêm state để quản lý các bước
  const [currentStep, setCurrentStep] = useState<
    "select-avatar" | "confirm-relatives" | "label-images"
  >("select-avatar");

  // State cho việc nhận dạng người trong ảnh
  const [imageAssignments, setImageAssignments] = useState<
    {
      url: string;
      memberId: string | null;
      ownerId: string;
    }[]
  >([]);

  // State cho danh sách thành viên
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // State lưu trữ thành viên được chọn cho mỗi ảnh
  const [selectedMembers, setSelectedMembers] = useState<{
    [key: string]: FamilyMember | null;
  }>({});

  // Ẩn nút close khi ở màn hình select-avatar
  useEffect(() => {
    // Nếu đang ở màn hình select-avatar, ẩn nút close
    const hideCloseButton = () => {
      // Tìm nút close và ẩn đi
      const modalParent = modalRef.current?.closest(".mantine-Modal-root");
      if (modalParent) {
        const closeButton = modalParent.querySelector(".mantine-Modal-close");
        if (closeButton) {
          if (currentStep === "select-avatar") {
            (closeButton as HTMLElement).style.display = "none";
          } else {
            (closeButton as HTMLElement).style.display = "";
          }
        }
      }
    };

    // Gọi hàm ẩn nút close
    hideCloseButton();

    // Sử dụng MutationObserver để theo dõi thay đổi DOM
    const observer = new MutationObserver(hideCloseButton);
    if (modalRef.current) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [currentStep]);

  // Console log thông báo khi component được tạo
  useEffect(() => {
    console.log(
      `ImageSelectionModal: Xử lý ${media.length} ảnh cho ${modalType}`
    );
    console.log(`Thời gian bắt đầu xử lý: ${new Date().toISOString()}`);
  }, []);

  // Lấy danh sách thành viên trong gia đình
  const { data: memberData, isLoading } = useGetApi({
    queryKey: ["member", 1, 10, 0, familyId],
    endpoint: familyId ? `members/family/${familyId}/search` : "",
    queryParams: { page: 1, limit: 10 },
  });

  // Xử lý dữ liệu thành viên khi API trả về
  useEffect(() => {
    if (memberData?.data?.items) {
      // Lọc ra các thành viên, loại bỏ thành viên vừa được tạo
      const members = memberData.data.items
        .filter((member: any) => member.memberId !== newMemberId)
        .map((member: any) => ({
          memberId: member.memberId,
          firstName: member.firstName,
          middleName: member.middleName,
          lastName: member.lastName,
          // Lưu lại ảnh của thành viên nếu có
          media:
            member.media && member.media.length > 0 ? member.media[0] : null,
        }));
      setFamilyMembers(members);
    }
  }, [memberData, newMemberId]);

  // Khởi tạo dữ liệu ảnh khi component mount
  useEffect(() => {
    if (media && media.length > 0) {
      const images = media.map((item) => ({
        url: item.url,
        memberId: null,
        ownerId: item.ownerId,
      }));
      setImageAssignments(images);
    }
  }, [media]);

  // Xử lý khi người dùng chọn thành viên cho một ảnh
  const handleMemberSelection = (
    imageOwnerId: string,
    memberId: string | null
  ) => {
    // Cập nhật assignment cho ảnh
    setImageAssignments((prev) =>
      prev.map((item) =>
        item.ownerId === imageOwnerId ? { ...item, memberId } : item
      )
    );

    // Nếu memberId có giá trị, tìm thành viên tương ứng và lưu vào selectedMembers
    if (memberId) {
      const selectedMember =
        familyMembers.find((member) => member.memberId === memberId) || null;
      setSelectedMembers((prev) => ({
        ...prev,
        [imageOwnerId]: selectedMember,
      }));
    } else {
      // Nếu không có memberId (người dùng đã xóa lựa chọn), xóa khỏi selectedMembers
      setSelectedMembers((prev) => {
        const newState = { ...prev };
        delete newState[imageOwnerId];
        return newState;
      });
    }
  };

  // Xử lý khi người dùng hoàn thành bước chọn avatar
  const handleAvatarSelected = () => {
    if (selectedAvatarIndex === null) {
      return; // Không cho phép tiếp tục nếu chưa chọn avatar
    }

    // Nếu đang trong trường hợp add-leader, submitSelectionData luôn mà không chuyển bước
    if (modalType === "add-leader") {
      submitSelectionData();
      return;
    }

    // Các trường hợp khác, chuyển sang bước tiếp theo
    setCurrentStep("confirm-relatives");
  };

  // Xử lý khi người dùng xác nhận có muốn nhận diện người thân
  const handleConfirmLabelImages = (confirmed: boolean) => {
    if (confirmed) {
      setCurrentStep("label-images");
    } else {
      // Nếu không muốn gán nhãn cho ảnh, trực tiếp hoàn thành quy trình
      submitSelectionData();
    }
  };

  // Xử lý khi người dùng hoàn thành
  const handleSubmit = () => {
    submitSelectionData();
  };

  // Xử lý khi người dùng hủy
  const handleCancel = () => {
    // Nếu đã có dữ liệu (đã chọn avatar) và không phải màn hình select-avatar
    // thì submitSelectionData luôn
    if (
      selectedAvatarIndex !== null &&
      modalType !== "add-leader" &&
      currentStep !== "select-avatar"
    ) {
      submitSelectionData();
      return;
    }

    if (onCancel) {
      onCancel();
    }
  };

  // Hàm xử lý dữ liệu gửi đi
  const submitSelectionData = () => {
    // Chuẩn bị dữ liệu kết quả
    const result: MediaSelectionResult[] = [];

    // Thêm ảnh đại diện
    if (media && selectedAvatarIndex !== null) {
      result.push({
        id: media[selectedAvatarIndex].ownerId,
        url: media[selectedAvatarIndex].url,
        status: "avatar",
        memberId: newMemberId,
      });
    }

    // Thêm các ảnh được gán nhãn hoặc bỏ qua
    imageAssignments.forEach((item, index) => {
      // Bỏ qua ảnh đã chọn làm avatar
      if (media[index] && index === selectedAvatarIndex) {
        return;
      }

      // Tạo object cơ bản
      const mediaResult: any = {
        id: item.ownerId,
        url: item.url,
        status: item.memberId ? "label" : "unknown",
      };

      // Chỉ thêm memberId nếu có giá trị và status không phải là unknown
      if (item.memberId && mediaResult.status !== "unknown") {
        mediaResult.memberId = item.memberId;
      }

      result.push(mediaResult);
    });

    console.log("Final media selection data:", result);

    // Gọi callback và truyền dữ liệu
    onComplete(result);
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  // Tạo danh sách dropdown tùy chọn cho Select
  const memberOptions = familyMembers.map((member) => ({
    value: member.memberId,
    label: `${member.firstName} ${member.middleName} ${member.lastName}`,
  }));

  // Hiển thị bước 1: Chọn ảnh đại diện
  if (currentStep === "select-avatar") {
    return (
      <div ref={modalRef}>
        <Stack gap="xl">
          {/* Thông báo xử lý nhiều ảnh */}
          <Alert
            icon={<IconPhoto size={20} />}
            title={texts.multipleImagesProcessingTitle}
            color="blue"
          >
            {texts.multipleImagesProcessingDescription}
          </Alert>

          {/* Hiển thị thông báo bắt buộc chọn avatar */}
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb="md">
            {modalType === "add-leader"
              ? texts.requiredAvatarMessage
              : "Vui lòng chọn một ảnh đại diện trước khi tiếp tục."}
          </Alert>

          {/* Hiển thị ảnh gốc ở phần trên với kích thước lớn hơn */}
          {originalImage && (
            <div>
              <Title order={4} mb="md">
                {texts.originalImageTitle}
              </Title>
              <Card shadow="sm" p="md" withBorder>
                <Center>
                  <Image
                    src={originalImage}
                    height={250}
                    width="100%"
                    fit="contain"
                    alt="Original"
                    radius="md"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "250px",
                      objectFit: "contain",
                    }}
                  />
                </Center>
              </Card>
            </div>
          )}

          <Divider my="md" />

          {/* Phần chọn ảnh đại diện */}
          <div>
            <Title order={4} mb="md">
              {texts.selectAvatarTitle}
            </Title>
            <Text color="dimmed" mb="md">
              {texts.selectAvatarDescription}
            </Text>

            <Grid>
              {/* Hiển thị các ảnh trả về từ API để chọn làm avatar */}
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
                      height: "100%",
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
                    <Stack align="center" style={{ height: "100%" }}>
                      <Radio
                        value={String(index)}
                        checked={selectedAvatarIndex === index}
                        onChange={() => setSelectedAvatarIndex(index)}
                        label="Chọn làm avatar"
                      />
                      <Box
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "150px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          src={item.url}
                          height={150}
                          width={200}
                          fit="contain"
                          alt={`Generated ${index + 1}`}
                          radius="md"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "150px",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </div>

          {/* Chỉ hiển thị nút tiếp tục, không hiển thị nút hủy ở bước chọn avatar */}
          <Group justify="flex-end" mt="xl">
            <Button
              variant="filled"
              color="blue"
              size="md"
              onClick={handleAvatarSelected}
              disabled={selectedAvatarIndex === null}
            >
              {texts.nextButton}
            </Button>
          </Group>
        </Stack>
      </div>
    );
  }

  // Hiển thị bước 2: Xác nhận có muốn nhận diện người thân không
  if (currentStep === "confirm-relatives") {
    return (
      <div ref={modalRef}>
        <Stack gap="xl">
          <Alert
            icon={<IconPhoto size={20} />}
            title={texts.confirmRelativesTitle}
            color="blue"
          >
            {texts.confirmRelativesDescription}
          </Alert>

          <Group justify="center" mt="lg">
            <Button
              variant="outline"
              color="gray"
              size="md"
              onClick={() => handleConfirmLabelImages(false)}
            >
              {texts.noButton}
            </Button>
            <Button
              variant="filled"
              color="blue"
              size="md"
              onClick={() => handleConfirmLabelImages(true)}
            >
              {texts.yesButton}
            </Button>
          </Group>
        </Stack>
      </div>
    );
  }

  // Hiển thị bước 3: Nhận diện thành viên trong ảnh với layout mới
  return (
    <div ref={modalRef}>
      <Stack gap="xl">
        <Title order={4} mb="md">
          {texts.labelImagesTitle}
        </Title>
        <Text color="dimmed" mb="md">
          {texts.labelImagesDescription}
        </Text>

        {/* Lặp qua các ảnh, bỏ qua ảnh đã chọn làm avatar */}
        {imageAssignments.map((item, index) => {
          // Bỏ qua ảnh đã chọn làm avatar
          if (index === selectedAvatarIndex) {
            return null;
          }

          const selectedMember = selectedMembers[item.ownerId];

          return (
            <Paper shadow="sm" p="md" withBorder mb="md" key={item.ownerId}>
              <Flex gap="md" align="flex-start">
                {/* Bên trái: Ảnh nhỏ */}
                <Box
                  style={{
                    width: "30%",
                    minWidth: "120px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "120px",
                  }}
                >
                  <Image
                    src={item.url}
                    height={120}
                    width={150}
                    fit="contain"
                    alt={`Image ${index + 1}`}
                    radius="md"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "120px",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                {/* Bên phải: Dropdown và ảnh của thành viên được chọn */}
                <Box style={{ flex: 1 }}>
                  <Select
                    label="Người trong ảnh"
                    placeholder="Chọn thành viên"
                    data={memberOptions}
                    value={item.memberId}
                    onChange={(value) =>
                      handleMemberSelection(item.ownerId, value)
                    }
                    searchable
                    clearable
                    nothingFoundMessage="Không tìm thấy thành viên nào"
                    mb="md"
                  />

                  {/* Hiển thị ảnh của thành viên đã chọn nếu có */}
                  {selectedMember && (
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        Xác nhận: {selectedMember.firstName}{" "}
                        {selectedMember.middleName} {selectedMember.lastName}
                      </Text>
                      {selectedMember.media && (
                        <Box style={{ width: "100px", height: "100px" }}>
                          <Image
                            src={selectedMember.media}
                            height={100}
                            width={100}
                            fit="contain"
                            alt="Ảnh thành viên"
                            radius="md"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                      )}
                      {!selectedMember.media && (
                        <Text size="sm" color="dimmed" fs="italic">
                          (Thành viên này chưa có ảnh đại diện)
                        </Text>
                      )}
                    </Stack>
                  )}
                </Box>
              </Flex>
            </Paper>
          );
        })}

        {/* Nút hủy và hoàn thành */}
        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            color="gray"
            size="md"
            onClick={handleCancel}
          >
            {texts.cancelButton}
          </Button>
          <Button
            variant="filled"
            color="blue"
            size="md"
            onClick={handleSubmit}
          >
            {texts.finishButton}
          </Button>
        </Group>
      </Stack>
    </div>
  );
};

export default ImageSelectionModal;
