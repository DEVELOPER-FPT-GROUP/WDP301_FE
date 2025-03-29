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
import {
  useGetApi,
  usePostApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { IconAlertCircle, IconPhoto } from "@tabler/icons-react";

interface MediaItem {
  faceId: string;
  previewUrl: string;
  status: "unknown" | "avatar" | "label";
}

interface MediaSelectionResult {
  faceId: string;
  status: "avatar" | "label" | "unknown";
  memberId?: string;
}

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
  requiredAvatarMessage?: string;
  tooltipMessage?: string;
  multipleImagesProcessingTitle?: string;
  multipleImagesProcessingDescription?: string;
}

interface ImageSelectionModalProps {
  media: MediaItem[];
  newMemberId: string;
  familyId: string | null;
  originalImage: string | null;
  onComplete: (result: { verifiedFaces: MediaSelectionResult[] }) => void;
  onCancel?: () => void;
  modalType?: "add-child" | "add-spouse" | "edit-member" | "add-leader";
  customTexts?: CustomTexts;
  disableClose?: boolean;
  refetch?: () => void;
}

interface FamilyMember {
  memberId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  media?: string;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  media,
  newMemberId,
  familyId,
  originalImage,
  onComplete,
  onCancel,
  modalType = "add-child",
  customTexts = {},
  refetch,
}) => {
  // Ref to hide the close button.
  const modalRef = useRef<HTMLDivElement>(null);

  // usePostApi hook to post verified face data.
  const vertifyFaces = usePostApi({
    endpoint: "/media/verify-upload",
  });

  // Flag for auto processing when there is 0 or 1 image.
  const [autoProcessing, setAutoProcessing] = useState(media.length <= 1);

  // Auto process if there is 0 or 1 image.
  useEffect(() => {
    if (media.length <= 1) {
      // console.log(
      //   `[${new Date().toISOString()}] Auto-processing with ${
      //     media.length
      //   } images`
      // );
      setTimeout(() => {
        if (media.length === 1) {
          // If there is one image, auto select as avatar.
          const result: MediaSelectionResult[] = [
            {
              faceId: media[0].faceId,
              status: "avatar",
              memberId: newMemberId,
            },
          ];
          // console.log("Auto-selected single image as avatar:", result);
          onComplete({ verifiedFaces: result });
        } else {
          // If there is no image, complete with empty array.
          // console.log("No images to process, completing");
          onComplete({ verifiedFaces: [] });
        }
      }, 100);
    } else {
      setAutoProcessing(false);
    }
  }, [media, newMemberId, onComplete]);

  if (autoProcessing) {
    return <LoadingOverlay visible />;
  }

  // Define default texts based on modal type.
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
          // For spouse, we want to proceed directly to labeling so that the dropdown appears.
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

  // Combine default texts with custom texts.
  const texts = { ...getDefaultTexts(), ...customTexts };

  // State for the selected avatar index.
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number | null>(
    null
  );

  // Step management state.
  // For "add-spouse", we bypass the confirm-relatives step so that the dropdown appears.
  const [currentStep, setCurrentStep] = useState<
    "select-avatar" | "confirm-relatives" | "label-images"
  >("select-avatar");

  // State for image assignments.
  const [imageAssignments, setImageAssignments] = useState<
    {
      url: string;
      memberId: string | null;
      faceId: string;
    }[]
  >([]);

  // State for family members.
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // State for selected members per image.
  const [selectedMembers, setSelectedMembers] = useState<{
    [key: string]: FamilyMember | null;
  }>({});

  // Hide close button in the select-avatar step.
  useEffect(() => {
    const hideCloseButton = () => {
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
    hideCloseButton();
    const observer = new MutationObserver(hideCloseButton);
    if (modalRef.current) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
    return () => {
      observer.disconnect();
    };
  }, [currentStep]);

  // Log component mount.
  useEffect(() => {
    // console.log(
    //   `ImageSelectionModal: Xử lý ${media.length} ảnh cho ${modalType}`
    // );
    // console.log(`Thời gian bắt đầu xử lý: ${new Date().toISOString()}`);
    // console.log(`Modal type: ${modalType}, familyId: ${familyId}`); // Add this line
  }, []);

  // Fetch family members.
  const { data: memberData, isLoading } = useGetApi({
    queryKey: ["member", modalType, familyId], // Modified query key to depend on modalType
    endpoint: familyId ? `members/family/${familyId}/search` : "",
    queryParams: { page: 1, limit: 10000 },
    enabled: !!familyId,
  });

  // Process fetched family members.
  useEffect(() => {
    if (memberData?.data?.items) {
      // console.log(
      //   `Fetched family members for ${modalType}:`,
      //   memberData.data.items
      // );
      const members = memberData.data.items
        .filter((member: any) => member.memberId !== newMemberId)
        .map((member: any) => ({
          memberId: member.memberId,
          firstName: member.firstName,
          middleName: member.middleName,
          lastName: member.lastName,
          media:
            member.media && member.media.length > 0 ? member.media[0] : null,
        }));
      setFamilyMembers(members);
      // console.log(
      //   `Processed ${members.length} family members for the dropdown`
      // );
    } else {
      console.warn(
        `No family members found in the API response for ${modalType}`
      );
    }
  }, [memberData, newMemberId, modalType]);

  // Initialize image assignments from media.
  useEffect(() => {
    if (media && media.length > 0) {
      const images = media.map((item) => ({
        url: item.previewUrl,
        memberId: null,
        faceId: item.faceId,
      }));
      setImageAssignments(images);
    }
  }, [media]);

  // Handle member selection for an image.
  const handleMemberSelection = (
    imageFaceId: string,
    memberId: string | null
  ) => {
    // console.log(`Selecting member ${memberId} for image ${imageFaceId}`);
    setImageAssignments((prev) =>
      prev.map((item) =>
        item.faceId === imageFaceId ? { ...item, memberId } : item
      )
    );
    if (memberId) {
      const selectedMember =
        familyMembers.find((member) => member.memberId === memberId) || null;
      // console.log("Selected member:", selectedMember);
      setSelectedMembers((prev) => ({
        ...prev,
        [imageFaceId]: selectedMember,
      }));
    } else {
      setSelectedMembers((prev) => {
        const newState = { ...prev };
        delete newState[imageFaceId];
        return newState;
      });
    }
  };
  const isSubmitting = vertifyFaces.isPending;
  // Handle when the user selects an avatar.
  // const handleAvatarSelected = () => {
  //   if (selectedAvatarIndex === null) return;

  //   // For add-spouse, ensure we have family members before proceeding
  //   if (modalType === "add-spouse") {
  //     console.log("Add-spouse flow: Transitioning to label-images step");
  //     console.log(`Current family members count: ${familyMembers.length}`);

  //     // If we don't have family members yet and API is still loading, show loading
  //     if (familyMembers.length === 0 && isLoading) {
  //       console.log("Family members not loaded yet, showing loading overlay");
  //       return <LoadingOverlay visible />;
  //     }

  //     setCurrentStep("label-images");
  //     return;
  //   }
  //   setCurrentStep("confirm-relatives");
  // };
  // const handleAvatarSelected = () => {
  //   if (selectedAvatarIndex === null) return;
  //   if (familyMembers.length === 0 && isLoading) {
  //     console.log("Family members not loaded yet, showing loading overlay");
  //     return <LoadingOverlay visible />;
  //   }

  //   setCurrentStep("confirm-relatives");
  // };
  const handleAvatarSelected = () => {
    if (selectedAvatarIndex === null) return;

    // Nếu đang loading family members, hiển thị loading state (thông qua state)
    if (familyMembers.length === 0 && isLoading) {
      // Không return JSX trực tiếp từ event handler (không hoạt động)
      console.log("Family members not loaded yet, showing loading overlay");
      return;
    }

    // Xử lý đặc biệt cho add-spouse: chuyển thẳng sang label-images
    if (modalType === "add-spouse") {
      console.log("Add-spouse flow: Transitioning to label-images step");
      setCurrentStep("label-images");
      return;
    }

    // Các trường hợp khác: chuyển sang confirm-relatives
    setCurrentStep("confirm-relatives");
  };

  // Handle confirmation of whether to label other images.
  const handleConfirmLabelImages = (confirmed: boolean) => {
    if (confirmed) {
      setCurrentStep("label-images");
    } else {
      submitSelectionData();
    }
  };

  // Handle final submission.
  const handleSubmit = () => {
    submitSelectionData();
    refetch && refetch();
  };

  // Handle cancel action.
  const handleCancel = () => {
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

  // Submit finalized data to the API /media/verify-upload.
  const submitSelectionData = () => {
    const verifiedFaces: MediaSelectionResult[] = [];
    // Process avatar image.
    if (media && selectedAvatarIndex !== null) {
      verifiedFaces.push({
        faceId: media[selectedAvatarIndex].faceId,
        status: "avatar",
        memberId: newMemberId,
      });
    }
    // Process other images.
    imageAssignments.forEach((item, index) => {
      if (media[index] && index === selectedAvatarIndex) {
        return;
      }
      if (item.memberId) {
        verifiedFaces.push({
          faceId: item.faceId,
          status: "label",
          memberId: item.memberId,
        });
      } else {
        verifiedFaces.push({
          faceId: item.faceId,
          status: "unknown",
        });
      }
    });
    const payload = { verifiedFaces };
    // console.log("Submitting media selection data:", payload);
    // Post the data using usePostApi hook.
    vertifyFaces.mutate(payload, {
      onSuccess: (data) => {
        console.log("Data submitted successfully:", data);
        onComplete(payload);
      },
      onError: (err) => {
        console.error("Error submitting data:", err);
        // Optionally display an error message to the user.
      },
    });
  };

  // Add a debugging output at this point to inspect the state
  // console.log(`Current rendering state:
  //   - Modal type: ${modalType}
  //   - Current step: ${currentStep}
  //   - Family members: ${familyMembers.length}
  //   - Is loading: ${isLoading}
  //   - Family ID: ${familyId}
  // `);

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (familyMembers.length === 0 && currentStep === "label-images") {
    return (
      <div ref={modalRef}>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Không có dữ liệu thành viên"
          color="yellow"
        >
          Không tìm thấy thành viên gia đình nào. Hãy kiểm tra lại kết nối mạng
          và thử lại.
        </Alert>
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
      </div>
    );
  }

  const memberOptions = familyMembers.map((member) => ({
    value: member.memberId,
    label: `${member.firstName} ${member.middleName} ${member.lastName}`,
  }));

  // console.log("Member options for dropdown:", memberOptions);

  if (currentStep === "select-avatar") {
    return (
      <div ref={modalRef}>
        <Stack gap="xl">
          <Alert
            icon={<IconPhoto size={20} />}
            title={texts.multipleImagesProcessingTitle}
            color="blue"
          >
            {texts.multipleImagesProcessingDescription}
          </Alert>
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb="md">
            {modalType === "add-leader"
              ? texts.requiredAvatarMessage
              : "Vui lòng chọn một ảnh đại diện trước khi tiếp tục."}
          </Alert>
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
          <div>
            <Title order={4} mb="md">
              {texts.selectAvatarTitle}
            </Title>
            <Text color="dimmed" mb="md">
              {texts.selectAvatarDescription}
            </Text>
            <Grid>
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
                          src={item.previewUrl}
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
              disabled={isSubmitting}
            >
              {texts.noButton}
            </Button>
            <Button
              variant="filled"
              color="blue"
              size="md"
              onClick={() => handleConfirmLabelImages(true)}
              disabled={isSubmitting}
            >
              {texts.yesButton}
            </Button>
          </Group>
        </Stack>
      </div>
    );
  }

  return (
    <div ref={modalRef}>
      <Stack gap="xl">
        <Title order={4} mb="md">
          {texts.labelImagesTitle}
        </Title>
        <Text color="dimmed" mb="md">
          {texts.labelImagesDescription}
        </Text>
        {imageAssignments.map((item, index) => {
          if (index === selectedAvatarIndex) {
            return null;
          }
          const selectedMember = selectedMembers[item.faceId];
          return (
            <Paper shadow="sm" p="md" withBorder mb="md" key={item.faceId}>
              <Flex gap="md" align="flex-start">
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
                <Box style={{ flex: 1 }}>
                  <Select
                    label="Người trong ảnh"
                    placeholder="Chọn thành viên"
                    data={memberOptions}
                    value={item.memberId}
                    onChange={(value) =>
                      handleMemberSelection(item.faceId, value)
                    }
                    searchable
                    clearable
                    nothingFoundMessage="Không tìm thấy thành viên nào"
                    mb="md"
                  />
                  {selectedMember && (
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        Xác nhận: {selectedMember.firstName}{" "}
                        {selectedMember.middleName} {selectedMember.lastName}
                      </Text>
                      {selectedMember.media ? (
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
                      ) : (
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
        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            color="gray"
            size="md"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {texts.cancelButton}
          </Button>
          <Button
            variant="filled"
            color="blue"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : texts.finishButton}
          </Button>
        </Group>
      </Stack>
    </div>
  );
};

export default ImageSelectionModal;
