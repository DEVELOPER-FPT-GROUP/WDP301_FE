import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Group,
  Stack,
  Switch,
  Textarea,
  Alert,
  Text,
  LoadingOverlay,
  FileInput,
  Card,
  Image,
  ActionIcon,
  Modal,
} from "@mantine/core";
import { IconX, IconUpload } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { IconAlertCircle } from "@tabler/icons-react";
import { usePostApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import ImageSelectionModal from "./ImageSelectionModal"; // Import ImageSelectionModal
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";

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

interface AddSpouseModalProps {
  opened: boolean;
  onClose: () => void;
  memberId: string; // ID của thành viên cần thêm vợ/chồng
  gender: "male" | "female"; // Giới tính của thành viên hiện tại
  onSuccess: () => void;
  name: string;
}

// Interfaces cho ImageSelectionModal
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
const AddSpouseModal: React.FC<AddSpouseModalProps> = ({
  opened,
  onClose,
  memberId,
  gender,
  onSuccess,
  name,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for managing image - đã thay đổi thành một ảnh duy nhất
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // State để quản lý hiển thị modal chọn ảnh
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [apiResponseData, setApiResponseData] = useState<
    ApiResponse["data"] | null
  >(null);
  const familyId = getFamilyIdFromToken();

  // Function to handle image upload - đã cập nhật cho một ảnh
  const handleImageUpload = (file: File | null) => {
    if (!file) {
      setUploadedFile(null);
      setPreviewImage(null);
      return;
    }

    // Thu hồi URL trước đó để tránh rò rỉ bộ nhớ
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    setPreviewImage(URL.createObjectURL(file));
    setUploadedFile(file);
  };

  // Function to handle image removal
  const handleRemoveImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setUploadedFile(null);
  };

  const form = useForm({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: null as Date | null,
      placeOfBirth: "",
      isAlive: true,
      dateOfDeath: null as Date | null,
      placeOfDeath: "",
      shortSummary: "",
    },
    validate: yupResolver(validationSchema),
  });

  const createSpouseMutation = usePostApi({
    endpoint: "members/add-spouse",
    options: {
      onSuccess: (response) => {
        console.log(
          "Backend response when adding spouse successfully:",
          response
        );
        if (response?.data?.media && response.data.media.length > 1) {
          setApiResponseData(response.data);
          setShowImageSelection(true);
          setLoading(false);
        } else {
          // Nếu không có nhiều ảnh, đóng modal và thông báo thành công
          handleCompletionWithoutImageModal();
        }
      },
    },
  });

  // Xử lý hoàn thành mà không cần hiển thị modal chọn ảnh
  const handleCompletionWithoutImageModal = () => {
    notifySuccess({
      title: "Thành công",
      message: `Đã thêm ${gender === "male" ? "vợ" : "chồng"} thành công!`,
    });
    resetForm();
    onSuccess();
    onClose();
  };

  // Xử lý khi người dùng hoàn thành việc chọn ảnh
  const handleImageSelectionComplete = (result: {
    verifiedFaces: MediaSelectionResult[];
  }) => {
    console.log("Selected media data:", result.verifiedFaces);
    notifySuccess({
      title: "Thành công",
      message: `Đã thêm ${
        gender === "male" ? "vợ" : "chồng"
      } thành công và xử lý ảnh!`,
    });
    handleFinalClose();
  };

  // Xử lý khi người dùng hủy quá trình chọn ảnh
  const handleImageSelectionCancel = () => {
    setShowImageSelection(false);
    setApiResponseData(null);

    notifySuccess({
      title: "Thành công",
      message: `Đã thêm ${
        gender === "male" ? "vợ" : "chồng"
      } thành công nhưng bỏ qua xử lý ảnh!`,
    });

    handleFinalClose();
  };

  // Đóng modal và làm mới dữ liệu
  const handleFinalClose = () => {
    resetForm();
    onSuccess();
    onClose();
  };

  const resetForm = () => {
    form.reset();
    // Xóa ảnh
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setUploadedFile(null);
    setError(null);
    setShowImageSelection(false);
    setApiResponseData(null);
  };

  // Xử lý đóng modal trong mọi trường hợp
  const handleClose = () => {
    // Nếu đang hiển thị modal chọn ảnh, xử lý hủy quá trình chọn ảnh
    if (showImageSelection) {
      handleImageSelectionCancel();
      return;
    }

    // Nếu không, thực hiện đóng modal bình thường
    resetForm();
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Thêm thông tin cần thiết
      formData.append("memberId", memberId);
      // Thêm các trường khác từ form
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

      // Thêm file ảnh vào formData - đã thay đổi thành một file
      if (uploadedFile) {
        formData.append("files", uploadedFile);
      }

      // Sử dụng mutation để gửi request
      createSpouseMutation.mutate(formData, {
        onError: (error: any) => {
          setError(
            error?.response?.data?.message ||
              `Có lỗi xảy ra khi thêm ${gender === "male" ? "vợ" : "chồng"}`
          );
          notifyError({
            title: "Thất bại",
            message: `Có lỗi xảy ra khi thêm ${
              gender === "male" ? "vợ" : "chồng"
            }.`,
          });
          setLoading(false);
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Có lỗi xảy ra khi thêm ${gender === "male" ? "vợ" : "chồng"}`
      );
      console.error("Error adding spouse:", err);
      setLoading(false);
    }
  };

  // Dọn dẹp object URL khi component unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, []);

  // Nếu đang hiển thị modal chọn ảnh
  if (showImageSelection && apiResponseData) {
    return (
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Text size="xl" fw={700} c="brown">
            Xử lý ảnh cho {gender === "male" ? "vợ" : "chồng"} mới
          </Text>
        }
        centered
        size="xl"
      >
        <ImageSelectionModal
          media={apiResponseData.media}
          newMemberId={apiResponseData.memberId}
          familyId={familyId}
          originalImage={previewImage}
          onComplete={handleImageSelectionComplete}
          onCancel={handleImageSelectionCancel}
          modalType="add-spouse"
          customTexts={{
            selectAvatarTitle: `Chọn ảnh đại diện cho ${
              gender === "male" ? "vợ" : "chồng"
            } mới`,
            selectAvatarDescription: `Vui lòng chọn một ảnh để làm ảnh đại diện cho ${
              gender === "male" ? "vợ" : "chồng"
            } mới.`,
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text size="xl" fw={700} c="brown">
          {`Thêm ${gender === "male" ? "vợ" : "chồng"} cho ${name}`}
        </Text>
      }
      centered
      size="lg"
    >
      <LoadingOverlay
        visible={loading || createSpouseMutation.isPending}
        overlayProps={{ radius: "md", blur: 2 }}
      />

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Lỗi"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

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
            placeholder="Nhập thông tin tóm tắt"
            autosize
            minRows={3}
            maxRows={5}
            {...form.getInputProps("shortSummary")}
          />

          {/* Phần upload ảnh - đã điều chỉnh cho một ảnh */}
          <FileInput
            label="Ảnh đại diện"
            placeholder="Tải lên ảnh"
            accept="image/png,image/jpeg,image/jpg"
            leftSection={<IconUpload size={16} />}
            onChange={handleImageUpload}
            value={uploadedFile}
          />

          {/* Phần xem trước ảnh - đã điều chỉnh cho một ảnh, căn lề trái */}
          {previewImage && (
            <Card
              shadow="sm"
              padding="xs"
              radius="md"
              withBorder
              w={150}
              style={{ marginLeft: 0 }}
            >
              <ActionIcon
                color="red"
                variant="light"
                size="sm"
                style={{ position: "absolute", top: 4, right: 4 }}
                onClick={handleRemoveImage}
              >
                <IconX size={16} />
              </ActionIcon>
              <Image
                src={previewImage}
                alt="Ảnh đại diện"
                radius="md"
                height={120}
                fit="contain"
              />
            </Card>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              loading={createSpouseMutation.isPending}
              color="brown"
            >
              Lưu
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AddSpouseModal;
