import {
  Modal,
  TextInput,
  Button,
  Group,
  Textarea,
  Switch,
  Text,
  Loader,
  Center,
  FileInput,
  Card,
  ActionIcon,
  Image,
  LoadingOverlay,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm, yupResolver } from "@mantine/form";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import {
  usePutApi,
  useGetApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import { IconUpload, IconX } from "@tabler/icons-react";
import ImageSelectionModal from "./ImageSelectionModal"; // Import ImageSelectionModal

interface MemberFormData {
  familyId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "male" | "female";
  dateOfBirth: string | null;
  placeOfBirth: string;
  isAlive: boolean;
  dateOfDeath: string | null;
  placeOfDeath: string | null;
  generation: number;
  shortSummary: string;
  isDeleted?: string;
}

// Updated to include id
interface ImagePreview {
  url: string;
  file?: File;
  isExisting: boolean;
  id?: string; // ID for existing images
}

interface MediaItem {
  id: string;
  ownerId: string;
  ownerType: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa interface cho cấu trúc dữ liệu mediaData
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

const memberSchema = Yup.object().shape({
  firstName: Yup.string().required("Họ là bắt buộc").min(2).max(50),
  middleName: Yup.string().required("Tên đệm là bắt buộc").min(2).max(50),
  lastName: Yup.string().required("Tên là bắt buộc").min(2).max(50),
  gender: Yup.string().oneOf(["male", "female"], "Giới tính không hợp lệ"),
  dateOfBirth: Yup.date().nullable(),
  placeOfBirth: Yup.string().required("Nơi sinh là bắt buộc"),
  dateOfDeath: Yup.date().nullable(),
  placeOfDeath: Yup.string().when("isAlive", {
    is: false,
    then: (schema) => schema.required("Nơi mất là bắt buộc"),
  }),
  shortSummary: Yup.string().max(500, "Tóm tắt không được quá 500 ký tự"),
});

interface EditDetailMemberModalProps {
  opened: boolean;
  onClose: () => void;
  refreshState: () => void;
  memberId: string | null;
}

const formatDateToISOString = (date: Date | null): string | null => {
  return date ? date.toISOString().split("T")[0] : null;
};

// Initial empty form data
const initialFormData: MemberFormData = {
  familyId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "male",
  dateOfBirth: null,
  placeOfBirth: "",
  isAlive: true,
  dateOfDeath: null,
  placeOfDeath: "",
  generation: 1,
  shortSummary: "",
  isDeleted: "false",
};

// Current Date and Time: 2025-03-22 18:52:55
// User: HE171216

const EditDetailMemberModal: React.FC<EditDetailMemberModalProps> = ({
  opened,
  onClose,
  refreshState,
  memberId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<ImagePreview | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);

  // State để quản lý hiển thị modal chọn ảnh
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [apiResponseData, setApiResponseData] = useState<
    ApiResponse["data"] | null
  >(null);

  // Fetch member data when memberId changes
  const { data: memberData, isLoading: isFetchingMember } = useGetApi({
    queryKey: ["member", memberId, opened],
    endpoint: memberId ? `members/${memberId}` : "",
  });

  const form = useForm({
    initialValues: initialFormData,
    validate: yupResolver(memberSchema),
  });

  // Function to handle image upload - now accepts a single File
  const handleImageUpload = (file: File | null) => {
    if (!file) return;

    // Thu hồi URL trước đó để tránh rò rỉ bộ nhớ
    if (previewImage && !previewImage.isExisting) {
      URL.revokeObjectURL(previewImage.url);
    }

    const url = URL.createObjectURL(file);

    // Replace any existing preview with the new one
    setPreviewImage({
      url,
      file,
      isExisting: false,
    });

    // If there was an existing image, mark it for deletion
    if (
      hasExistingImage &&
      previewImage &&
      previewImage.isExisting &&
      previewImage.id
    ) {
      setDeleteImageId(previewImage.id);
    }

    // Update uploaded file
    setUploadedFile(file);
  };

  // Function to handle image removal
  const handleRemoveImage = () => {
    // If removing an existing image, store its ID for deletion
    if (previewImage?.isExisting && previewImage.id) {
      setDeleteImageId(previewImage.id);
      setHasExistingImage(false);
    } else if (!previewImage?.isExisting && previewImage?.url) {
      // Thu hồi URL để tránh rò rỉ bộ nhớ
      URL.revokeObjectURL(previewImage.url);
    }

    // Clear the preview
    setPreviewImage(null);
    setUploadedFile(null);
  };

  // Update form when member data is loaded
  useEffect(() => {
    if (memberData && memberData.data) {
      const member = memberData.data;
      form.setValues({
        familyId: member.familyId || "",
        firstName: member.firstName || "",
        middleName: member.middleName || "",
        lastName: member.lastName || "",
        gender:
          member.gender === "male" || member.gender === "female"
            ? member.gender
            : "male",
        dateOfBirth: member.dateOfBirth ?? null,
        placeOfBirth: member.placeOfBirth || "",
        isAlive: member.isAlive ?? true,
        dateOfDeath: member.dateOfDeath ?? null,
        placeOfDeath: member.placeOfDeath ?? "",
        generation: member.generation ?? 1,
        shortSummary: member.shortSummary || "",
        isDeleted: "false",
      });

      // Set only the first image if available
      if (member.media && member.media.length > 0) {
        const firstMedia = member.media[0];
        setPreviewImage({
          url: firstMedia.url,
          id: firstMedia.id,
          isExisting: true,
        });
        setHasExistingImage(true);
      } else {
        setPreviewImage(null);
        setHasExistingImage(false);
      }

      // Reset the delete image ID
      setDeleteImageId(null);
    }
  }, [memberData]);

  // Reset form and file states when modal is closed
  useEffect(() => {
    if (!opened) {
      form.reset();
      // Thu hồi URL trước khi xóa
      if (previewImage && !previewImage.isExisting && previewImage.url) {
        URL.revokeObjectURL(previewImage.url);
      }
      setUploadedFile(null);
      setPreviewImage(null);
      setDeleteImageId(null);
      setHasExistingImage(false);
      setShowImageSelection(false);
      setApiResponseData(null);
    }
  }, [opened]);

  // Dọn dẹp URL khi component unmount
  useEffect(() => {
    return () => {
      if (previewImage && !previewImage.isExisting && previewImage.url) {
        URL.revokeObjectURL(previewImage.url);
      }
    };
  }, []);

  const editMemberApi = usePutApi({
    endpoint: `/members/update/${memberId || ""}`,
    options: {
      onSuccess: (response) => {
        console.log(
          "Backend response when updating member successfully:",
          response
        );

        // Kiểm tra nếu có nhiều ảnh trong response (Giả lập cho mục đích test)
        if (uploadedFile) {
          // Tạo một bản sao của response.data để không ảnh hưởng đến dữ liệu gốc
          const mockData = { ...response.data };

          // Tạo một mảng media giả định với nhiều ảnh
          mockData.media = [
            // Giữ lại media gốc nếu có
            ...(response.data.media || []),

            // Thêm các ảnh giả định
            {
              id: "mock-media-1",
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
              id: "mock-media-2",
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
              id: "mock-media-3",
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

          // Sử dụng dữ liệu giả thay vì dữ liệu thật
          setApiResponseData(mockData);
          setShowImageSelection(true);
          setIsLoading(false);

          // Thêm memberId để sử dụng trong ImageSelectionModal
          if (mockData && memberId) {
            mockData.memberId = memberId;
          }

          /* Khi API trả về nhiều ảnh thực sự, thay thế bằng:

          */
          // if (response?.data?.media && response.data.media.length > 1) {
          //   setApiResponseData(response.data);
          //   setShowImageSelection(true);
          //   setIsLoading(false);
          // } else {
          //   handleCompletionWithoutImageModal(response);
          // }
        } else {
          handleCompletionWithoutImageModal(response);
        }
      },
    },
  });

  // Xử lý hoàn thành mà không cần hiển thị modal chọn ảnh
  const handleCompletionWithoutImageModal = (response: any) => {
    const memberName =
      form.values.firstName +
      " " +
      form.values.middleName +
      " " +
      form.values.lastName;
    notifySuccess({
      title: "Thành công",
      message: `Chỉnh sửa ${memberName} thành công!`,
    });
    form.reset();
    // Thu hồi URL trước khi xóa
    if (previewImage && !previewImage.isExisting && previewImage.url) {
      URL.revokeObjectURL(previewImage.url);
    }
    setUploadedFile(null);
    setPreviewImage(null);
    setDeleteImageId(null);
    setHasExistingImage(false);
    onClose();
    refreshState();
    setIsLoading(false);
  };

  // Xử lý khi người dùng hoàn thành việc chọn ảnh
  const handleImageSelectionComplete = (mediaData: MediaSelectionResult[]) => {
    console.log("Selected media data:", mediaData);
    const memberName =
      form.values.firstName +
      " " +
      form.values.middleName +
      " " +
      form.values.lastName;
    notifySuccess({
      title: "Thành công",
      message: `Chỉnh sửa ${memberName} thành công và xử lý ảnh!`,
    });
    handleFinalClose();
  };

  // Xử lý khi người dùng hủy quá trình chọn ảnh
  const handleImageSelectionCancel = () => {
    setShowImageSelection(false);
    setApiResponseData(null);

    const memberName =
      form.values.firstName +
      " " +
      form.values.middleName +
      " " +
      form.values.lastName;
    notifySuccess({
      title: "Thành công",
      message: `Chỉnh sửa ${memberName} thành công nhưng bỏ qua xử lý ảnh!`,
    });

    handleFinalClose();
  };

  // Đóng modal và làm mới dữ liệu
  const handleFinalClose = () => {
    form.reset();
    if (previewImage && !previewImage.isExisting && previewImage.url) {
      URL.revokeObjectURL(previewImage.url);
    }
    setUploadedFile(null);
    setPreviewImage(null);
    setDeleteImageId(null);
    setHasExistingImage(false);
    setShowImageSelection(false);
    setApiResponseData(null);
    onClose();
    refreshState();
  };

  // Thêm hàm handleClose để xử lý đóng modal
  const handleClose = () => {
    // Nếu đang hiển thị modal chọn ảnh, xử lý hủy quá trình chọn ảnh
    if (showImageSelection) {
      handleImageSelectionCancel();
      return;
    }

    // Nếu không, thực hiện đóng modal bình thường
    form.reset();
    if (previewImage && !previewImage.isExisting && previewImage.url) {
      URL.revokeObjectURL(previewImage.url);
    }
    setUploadedFile(null);
    setPreviewImage(null);
    setDeleteImageId(null);
    setHasExistingImage(false);
    setShowImageSelection(false);
    setApiResponseData(null);
    onClose();
  };

  const fullName = memberData?.data
    ? `${memberData.data.firstName} ${memberData.data.middleName} ${memberData.data.lastName}`
    : "thành viên";

  const handleSubmit = (values: MemberFormData) => {
    setIsLoading(true);

    // Create FormData object for submission
    const formData = new FormData();

    // Add all form values to FormData
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Check if we need to signal image changes
    if (uploadedFile || deleteImageId) {
      formData.append("isChangeImage", "true");
    }

    // Add file if selected
    if (uploadedFile) {
      formData.append("files", uploadedFile);
    }

    // Add deleted image ID - only if we have one to delete
    if (deleteImageId) {
      formData.append("deleteImageIds", deleteImageId);
    }

    // Submit form data
    editMemberApi.mutate(formData, {
      onError: (err) => {
        notifyError({
          title: "Lỗi",
          message: `Chỉnh sửa ${fullName} thất bại!`,
        });
        setIsLoading(false);
      },
    });
  };

  // Nếu đang hiển thị modal chọn ảnh
  if (showImageSelection && apiResponseData) {
    return (
      <Modal
        opened={opened}
        onClose={handleClose} // Sử dụng handleClose
        title={
          <Text size="xl" fw={700} c="brown">
            Xử lý ảnh cho thành viên
          </Text>
        }
        centered
        size="xl"
      >
        <ImageSelectionModal
          media={apiResponseData.media}
          newMemberId={memberId || ""}
          familyId={form.values.familyId}
          originalImage={previewImage?.url || null}
          onComplete={handleImageSelectionComplete}
          onCancel={handleImageSelectionCancel}
          modalType="edit-member"
          customTexts={{
            selectAvatarTitle: "Chọn ảnh đại diện mới",
            selectAvatarDescription:
              "Vui lòng chọn một ảnh để cập nhật ảnh đại diện cho thành viên này.",
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose} // Sử dụng handleClose thay vì onClose
      title={
        <Text size="xl" fw={700} c="brown">
          Chỉnh sửa thông tin
        </Text>
      }
      size="lg"
    >
      {isFetchingMember ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={isLoading} />
          <div className="space-y-4">
            {/* Image upload section */}
            <FileInput
              label="Ảnh đại diện"
              placeholder="Tải lên ảnh"
              accept="image/png,image/jpeg,image/jpg"
              leftSection={<IconUpload size={16} />}
              onChange={handleImageUpload}
            />

            {/* Image preview section - đã cập nhật kích thước và căn lề trái */}
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
                  src={previewImage.url}
                  alt="Ảnh đại diện"
                  radius="md"
                  height={120}
                  fit="contain"
                  style={
                    !form.values.isAlive
                      ? { filter: "grayscale(70%) opacity(0.7)" }
                      : undefined
                  }
                />
              </Card>
            )}

            <div className="grid grid-cols-3 gap-4">
              <TextInput label="Họ" {...form.getInputProps("firstName")} />
              <TextInput
                label="Tên đệm"
                {...form.getInputProps("middleName")}
              />
              <TextInput label="Tên" {...form.getInputProps("lastName")} />
            </div>

            {/* Always display date of birth and place of birth */}
            <DatePickerInput
              label="Ngày sinh"
              value={
                form.values.dateOfBirth
                  ? new Date(form.values.dateOfBirth)
                  : null
              }
              onChange={(date) =>
                form.setFieldValue("dateOfBirth", formatDateToISOString(date))
              }
            />
            <TextInput
              label="Nơi sinh"
              {...form.getInputProps("placeOfBirth")}
            />

            {/* Alive/deceased switch */}
            <Switch
              color="brown"
              label="Còn sống"
              {...form.getInputProps("isAlive", { type: "checkbox" })}
            />

            {/* Only show death details when isAlive is false */}
            {!form.values.isAlive && (
              <>
                <DatePickerInput
                  label="Ngày mất"
                  value={
                    form.values.dateOfDeath
                      ? new Date(form.values.dateOfDeath)
                      : null
                  }
                  onChange={(date) =>
                    form.setFieldValue(
                      "dateOfDeath",
                      formatDateToISOString(date)
                    )
                  }
                />
                <TextInput
                  label="Nơi mất"
                  {...form.getInputProps("placeOfDeath")}
                />
              </>
            )}

            <Textarea label="Tóm tắt" {...form.getInputProps("shortSummary")} />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit" color="brown" loading={isLoading}>
                Lưu
              </Button>
            </Group>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditDetailMemberModal;
