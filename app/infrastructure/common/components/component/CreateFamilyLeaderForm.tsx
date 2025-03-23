import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Group,
  Stack,
  Switch,
  Textarea,
  Paper,
  Title,
  LoadingOverlay,
  FileInput,
  Card,
  Image,
  SimpleGrid,
  ActionIcon,
  Modal,
  Text,
} from "@mantine/core";
import { IconX, IconUpload } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { usePostApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import ImageSelectionModal from "./ImageSelectionModal"; // Import ImageSelectionModal

// Validation schema using Yup
const validationSchema = Yup.object({
  firstName: Yup.string().required("Họ không được để trống"),
  middleName: Yup.string().required("Tên đệm không được để trống"),
  lastName: Yup.string().required("Tên không được để trống"),
  dateOfBirth: Yup.date()
    .required("Ngày sinh không được để trống")
    .max(new Date(), "Ngày sinh không thể trong tương lai"),
  placeOfBirth: Yup.string().required("Nơi sinh không được để trống"),
  isAlive: Yup.boolean(),
  dateOfDeath: Yup.date()
    .nullable()
    .when("isAlive", {
      is: false,
      then: () =>
        Yup.date()
          .required("Ngày mất không được để trống")
          .min(Yup.ref("dateOfBirth"), "Ngày mất phải sau ngày sinh")
          .max(new Date(), "Ngày mất không thể trong tương lai"),
    }),
  placeOfDeath: Yup.string().when("isAlive", {
    is: false,
    then: () => Yup.string().required("Nơi mất không được để trống"),
    otherwise: () => Yup.string().nullable(),
  }),
  shortSummary: Yup.string().max(500, "Tóm tắt không quá 500 ký tự"),
});

interface CreateFamilyLeaderFormProps {
  onSuccess: () => void;
  familyId?: string | null;
}

// Interfaces cho ImageSelectionModal
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
  memberId?: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: {
    memberId: string;
    familyId: string;
    // Các trường khác...
    media: MediaItem[];
  };
}

// Current Date and Time (UTC): 2025-03-23 02:53:45
// User: HE171216

const CreateFamilyLeaderForm: React.FC<CreateFamilyLeaderFormProps> = ({
  onSuccess,
  familyId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for managing images
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<any>([]);
  // State để quản lý hiển thị modal chọn ảnh
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [apiResponseData, setApiResponseData] = useState<
    ApiResponse["data"] | null
  >(null);
  const [selectedLeaderMemberId, setSelectedLeaderMemberId] = useState<
    string | null
  >(null);

  // Function to handle image upload
  const handleImageUpload = (files: File[] | null) => {
    if (!files) return;
    const newPreviewUrls = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true,
    }));

    setPreviewImages((prev: any) => [...prev, ...newPreviewUrls]);
    setUploadedFiles((prev: File[]) => [...prev, ...files]);
  };

  // Function to handle image removal
  const handleRemoveImage = (image: any) => {
    setPreviewImages((prev: any) =>
      prev.filter((img: any) => img.url !== image.url)
    );
    setUploadedFiles((prev) => prev.filter((file) => file !== image.file));
  };

  const form = useForm({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "male", // Mặc định là nam
      dateOfBirth: null as Date | null,
      placeOfBirth: "",
      isAlive: true,
      dateOfDeath: null as Date | null,
      placeOfDeath: "",
      shortSummary: "",
    },
    validate: yupResolver(validationSchema),
  });

  const createMutation = usePostApi({
    endpoint: "members/create-family-leader",
    options: {
      onSuccess: (response) => {
        console.log(
          "Backend response when creating family leader successfully:",
          response
        );

        // ===== BẮT ĐẦU: CODE TẠO DỮ LIỆU GIẢ CHO VIỆC TEST =====

        // Nếu có hơn 1 ảnh được tải lên (Giả lập cho mục đích test)
        if (uploadedFiles) {
          // Tạo một bản sao của response.data để không ảnh hưởng đến dữ liệu gốc
          const mockData = { ...response.data };

          // Tạo một mảng media giả định với các ảnh đã tải lên
          mockData.media = [
            // Giữ lại media gốc nếu có
            ...(response.data.media || []),

            // Thêm các ảnh giả định
            {
              ownerId: "mock-media-1",
              ownerType: "Member",
              url: "https://res.cloudinary.com/dhfatqx0l/image/upload/v1742665011/uploads/lxqunmukpm49x0hca2vx.png",
              fileName: "mock1.png",
              mimeType: "image/png",
              size: 330023,
              createdAt: "2025-03-22T17:36:52.325Z",
              updatedAt: "2025-03-22T17:36:52.325Z",
            },
            {
              ownerId: "mock-media-2",
              ownerType: "Member",
              url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574",
              fileName: "mock2.jpg",
              mimeType: "image/jpeg",
              size: 250000,
              createdAt: "2025-03-22T17:36:52.325Z",
              updatedAt: "2025-03-22T17:36:52.325Z",
            },
            {
              ownerId: "mock-media-3",
              ownerType: "Member",
              url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961",
              fileName: "mock3.jpg",
              mimeType: "image/jpeg",
              size: 280000,
              createdAt: "2025-03-22T17:36:52.325Z",
              updatedAt: "2025-03-22T17:36:52.325Z",
            },
          ];

          // Lưu memberId của trưởng họ vừa tạo
          if (response?.data?.memberId) {
            setSelectedLeaderMemberId(response.data.memberId);
          }

          console.log("Mock data for image selection:", mockData);
          // Sử dụng dữ liệu giả thay vì dữ liệu thật
          setApiResponseData(mockData);
          setShowImageSelection(true);
          setLoading(false);

          // ===== KẾT THÚC: CODE TẠO DỮ LIỆU GIẢ CHO VIỆC TEST =====
        } else {
          // Nếu không có nhiều ảnh, hoàn thành quy trình bình thường
          handleCompletionWithoutImageModal();
        }

        /* Ghi chú: Đã comment đoạn code logic thực tế, bỏ comment sau khi test xong
        
        // Kiểm tra nếu có nhiều ảnh trong response
        if (response?.data?.media && response.data.media.length > 1) {
          setSelectedLeaderMemberId(response.data.memberId);
          setApiResponseData(response.data);
          setShowImageSelection(true);
          setLoading(false);
        } else {
          // Nếu không có nhiều ảnh, đóng form và thông báo thành công
          handleCompletionWithoutImageModal();
        }
        */
      },
    },
  });

  // Xử lý hoàn thành mà không cần hiển thị modal chọn ảnh
  const handleCompletionWithoutImageModal = () => {
    notifySuccess({
      title: "Thành công",
      message: "Trưởng họ đã được tạo thành công!",
    });
    resetFormData();
    onSuccess();
  };

  // Xử lý khi người dùng hoàn thành việc chọn ảnh
  const handleImageSelectionComplete = (mediaData: MediaSelectionResult[]) => {
    console.log("Selected media data:", mediaData);
    notifySuccess({
      title: "Thành công",
      message: "Trưởng họ đã được tạo thành công và ảnh đã được xử lý!",
    });
    resetFormData();
    onSuccess();
  };

  // Xử lý khi người dùng hủy quá trình chọn ảnh
  const handleImageSelectionCancel = () => {
    setShowImageSelection(false);
    setApiResponseData(null);

    notifySuccess({
      title: "Thành công",
      message: "Trưởng họ đã được tạo thành công nhưng bỏ qua xử lý ảnh!",
    });

    resetFormData();
    onSuccess();
  };

  // Reset form và dữ liệu ảnh
  const resetFormData = () => {
    form.reset();
    // Thu hồi URL để tránh rò rỉ bộ nhớ
    previewImages.forEach((img: any) => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
    setPreviewImages([]);
    setUploadedFiles([]);
    setShowImageSelection(false);
    setApiResponseData(null);
    setSelectedLeaderMemberId(null);
    setError(null);
  };

  // Dọn dẹp object URL khi component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach((img: any) => {
        if (img.url) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Add familyId if provided
      if (familyId) {
        formData.append("familyId", familyId);
      }

      // Add other form fields
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === "dateOfBirth" || key === "dateOfDeath") {
            // Format date to YYYY-MM-DD
            if (value instanceof Date) {
              const formattedDate = value.toISOString().split("T")[0];
              formData.append(key, formattedDate);
            }
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Set generation to 0 for leader
      formData.append("generation", "0");

      // Add image files to formData
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      // Use mutation to send the request instead of fetch
      createMutation.mutate(formData, {
        onError: (error: any) => {
          // Handle error
          setError(
            error?.response?.data?.message || "Có lỗi xảy ra khi tạo trưởng họ"
          );
          notifyError({
            title: "Thất bại",
            message: "Có lỗi xảy ra khi tạo trưởng họ.",
          });
          setLoading(false);
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo trưởng họ"
      );
      console.error("Error creating family leader:", err);
      setLoading(false);
    }
  };

  // Nếu đang hiển thị modal chọn ảnh
  if (showImageSelection && apiResponseData) {
    return (
      <Modal
        opened={true}
        onClose={handleImageSelectionCancel}
        title={
          <Text size="xl" fw={700} c="brown">
            Xử lý ảnh cho trưởng họ mới
          </Text>
        }
        centered
        size="xl"
      >
        <ImageSelectionModal
          media={apiResponseData.media}
          newMemberId={selectedLeaderMemberId || ""}
          familyId={familyId || null}
          originalImage={previewImages.length > 0 ? previewImages[0].url : null}
          onComplete={handleImageSelectionComplete}
          onCancel={handleImageSelectionCancel}
          modalType="add-leader" // Đã thay đổi modalType thành "add-leader"
        />
      </Modal>
    );
  }

  return (
    <>
      <Title order={2} mb="md" style={{ marginTop: "150px" }} c="brown">
        Tạo Trưởng Họ
      </Title>
      <Text mt="xl" mb="xl" size="xl" c="red" fw={500}>
        Bạn cần tạo thông tin trưởng họ để bắt đầu xây dựng cây gia phả
      </Text>
      <Paper p="lg" withBorder radius="md" pos="relative">
        <LoadingOverlay
          visible={loading || createMutation.isPending}
          overlayProps={{ radius: "md", blur: 2 }}
        />
        <Title order={3} mb="md" c="brown" fw={700}>
          Tạo Trưởng Họ
        </Title>

        {/* {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Lỗi"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )} */}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="Họ"
                placeholder="Nhập họ"
                required
                {...form.getInputProps("firstName")}
              />
              <TextInput
                label="Tên đệm"
                placeholder="Nhập tên đệm"
                required
                {...form.getInputProps("middleName")}
              />
              <TextInput
                label="Tên"
                placeholder="Nhập tên"
                required
                {...form.getInputProps("lastName")}
              />
            </Group>

            {/* Đã xóa phần Select giới tính, mặc định là nam */}

            <Group grow>
              <DateInput
                label="Ngày sinh"
                placeholder="Chọn ngày sinh"
                required
                clearable={false}
                {...form.getInputProps("dateOfBirth")}
              />
              <TextInput
                label="Nơi sinh"
                placeholder="Nhập nơi sinh"
                required
                {...form.getInputProps("placeOfBirth")}
              />
            </Group>

            <Switch
              label="Còn sống"
              mt="xs"
              {...form.getInputProps("isAlive", { type: "checkbox" })}
            />

            {!form.values.isAlive && (
              <Group grow>
                <DateInput
                  label="Ngày mất"
                  placeholder="Chọn ngày mất"
                  required
                  clearable={false}
                  {...form.getInputProps("dateOfDeath")}
                />
                <TextInput
                  label="Nơi mất"
                  placeholder="Nhập nơi mất"
                  required
                  {...form.getInputProps("placeOfDeath")}
                />
              </Group>
            )}

            <Textarea
              label="Thông tin tóm tắt"
              placeholder="Nhập thông tin tóm tắt về trưởng họ"
              autosize
              minRows={3}
              maxRows={5}
              {...form.getInputProps("shortSummary")}
            />

            {/* Image upload section */}
            <FileInput
              label="Ảnh đại diện"
              placeholder="Tải lên ảnh"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              leftSection={<IconUpload size={16} />}
              onChange={handleImageUpload}
            />

            {/* Image preview section */}
            {previewImages.length > 0 && (
              <SimpleGrid cols={3} spacing="md">
                {previewImages.map((img: any, index: number) => (
                  <Card
                    key={index}
                    shadow="sm"
                    padding="xs"
                    radius="md"
                    withBorder
                  >
                    <ActionIcon
                      color="red"
                      variant="light"
                      size="sm"
                      style={{ position: "absolute", top: 4, right: 4 }}
                      onClick={() => handleRemoveImage(img)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                    <Image
                      src={img.url}
                      alt={`Hình ảnh ${index + 1}`}
                      radius="md"
                      height={150}
                    />
                  </Card>
                ))}
              </SimpleGrid>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                type="submit"
                loading={createMutation.isPending}
                color="brown"
              >
                Tạo Trưởng Họ
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </>
  );
};

export default CreateFamilyLeaderForm;
