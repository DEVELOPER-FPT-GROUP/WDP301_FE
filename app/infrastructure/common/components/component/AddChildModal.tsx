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
  Select,
  NumberInput,
} from "@mantine/core";
import { IconX, IconUpload, IconAlertCircle } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import {
  useGetApi,
  usePostApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import ImageSelectionModal from "./ImageSelectionModal"; // Import component mới

// Define types based on the API response structure
interface MemberData {
  memberId: string;
  familyId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  placeOfDeath: string;
  isAlive: boolean;
  generation: number;
  shortSummary: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface SpouseRelation {
  spouse: MemberData;
  children: any[];
}

interface ParentData extends MemberData {
  spouses: SpouseRelation[];
}

// Validation schema for child form
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
  gender: Yup.string().required("Giới tính không được để trống"),
  shortSummary: Yup.string().max(500, "Tóm tắt không quá 500 ký tự"),
  parentSpouseId: Yup.string().required("Vui lòng chọn một người phối ngẫu"),
  birthOrder: Yup.number()
    .required("Thứ tự sinh không được để trống")
    .min(1, "Thứ tự sinh phải lớn hơn 0"),
});

interface AddChildModalProps {
  opened: boolean;
  onClose: () => void;
  parentId: string; // ID của cha/mẹ
  onSuccess: () => void;
  name: string; // Tên của cha/mẹ
}

interface ImagePreview {
  url: string;
  file: File;
  isNew: boolean;
}

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

// Định nghĩa interface cho cấu trúc dữ liệu mediaData
interface MediaSelectionResult {
  id: string;
  url: string;
  status: "avatar" | "label" | "dump";
  memberId?: string;
}

const AddChildModal: React.FC<AddChildModalProps> = ({
  opened,
  onClose,
  parentId,
  onSuccess,
  name,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spouseOptions, setSpouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [parentGender, setParentGender] = useState<string | null>(null);

  // States for managing image - changed to single image
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // State để quản lý hiển thị modal chọn ảnh
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [apiResponseData, setApiResponseData] = useState<
    ApiResponse["data"] | null
  >(null);
  const [familyId, setFamilyId] = useState<string | null>(null);

  // Function to handle image upload - updated for single image
  const handleImageUpload = (file: File | null) => {
    if (!file) {
      setUploadedFile(null);
      setPreviewImage(null);
      return;
    }

    // Revoke previous object URL to prevent memory leaks
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

  // Fetch parent details to get spouse information
  const { data, isSuccess, isLoading } = useGetApi({
    queryKey: ["members", parentId],
    endpoint: "/members/get-member-details/:id",
    urlParams: { id: parentId },
  });

  // Create spouse options for select dropdown
  useEffect(() => {
    if (isSuccess && data?.data) {
      const parent = data.data as ParentData;
      // Store the parent's gender
      setParentGender(parent.gender);

      // Lưu familyId để dùng cho modal chọn ảnh
      if (parent.familyId) {
        setFamilyId(parent.familyId);
      }

      const options: { value: string; label: string }[] = [];

      // Check if spouses array exists
      if (parent.spouses && Array.isArray(parent.spouses)) {
        parent.spouses.forEach((spouseRelation: SpouseRelation) => {
          const spouse = spouseRelation.spouse;
          options.push({
            value: spouse.memberId,
            label: `${spouse.firstName} ${spouse.middleName} ${spouse.lastName}`,
          });
        });
      }

      setSpouseOptions(options);
    }
  }, [data, isSuccess]);

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
      gender: "male", // Default to male
      shortSummary: "",
      parentSpouseId: "", // New field for selected spouse
      birthOrder: 1, // Default to 1
    },
    validate: yupResolver(validationSchema),
  });

  const createChildMutation = usePostApi({
    endpoint: "members/add-child",
    options: {
      onSuccess: (response) => {
        console.log(
          "Backend response when adding child successfully:",
          response
        );

        // ===== BẮT ĐẦU: CODE TẠO DỮ LIỆU GIẢ CHO VIỆC TEST =====

        // Tạo một bản sao của response.data để không ảnh hưởng đến dữ liệu gốc
        // const mockData = { ...response.data };

        // // Tạo một mảng media giả định với nhiều ảnh
        // mockData.media = [
        //   // Giữ lại media gốc nếu có
        //   ...(response.data.media || []),

        //   // Thêm các ảnh giả định
        //   {
        //     ownerId: "mock-media-1",
        //     ownerType: "Member",
        //     url: "https://res.cloudinary.com/dhfatqx0l/image/upload/v1742665011/uploads/lxqunmukpm49x0hca2vx.png",
        //     fileName: "mock1.png",
        //     mimeType: "image/png",
        //     size: 330023,
        //     createdAt: "2025-03-22T17:36:52.325Z",
        //     updatedAt: "2025-03-22T17:36:52.325Z",
        //   },
        //   {
        //     ownerId: "mock-media-2",
        //     ownerType: "Member",
        //     url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574",
        //     fileName: "mock2.jpg",
        //     mimeType: "image/jpeg",
        //     size: 250000,
        //     createdAt: "2025-03-22T17:36:52.325Z",
        //     updatedAt: "2025-03-22T17:36:52.325Z",
        //   },
        //   {
        //     ownerId: "mock-media-3",
        //     ownerType: "Member",
        //     url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961",
        //     fileName: "mock3.jpg",
        //     mimeType: "image/jpeg",
        //     size: 280000,
        //     createdAt: "2025-03-22T17:36:52.325Z",
        //     updatedAt: "2025-03-22T17:36:52.325Z",
        //   },
        // ];

        // // Sử dụng dữ liệu giả thay vì dữ liệu thật
        // setApiResponseData(mockData);
        // setShowImageSelection(true);

        // ===== KẾT THÚC: CODE TẠO DỮ LIỆU GIẢ CHO VIỆC TEST =====

        /* Ghi chú: Đã comment đoạn code logic thực tế, bỏ comment sau khi test xong
        
        // Kiểm tra nếu có nhiều ảnh trong response
     
        */
        if (response?.data?.media && response.data.media.length > 1) {
          setApiResponseData(response.data);
          setShowImageSelection(true);
        } else {
          // Nếu không có nhiều ảnh, đóng modal và thông báo thành công
          notifySuccess({
            title: "Thành công",
            message: "Đã thêm con thành công!",
          });
          setLoading(false);
          handleFinalClose();
        }
        // setLoading(false);
      },
    },
  });

  const resetForm = () => {
    form.reset();
    // Clear image
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setUploadedFile(null);
    setError(null);
    setShowImageSelection(false);
    setApiResponseData(null);
  };

  const handleClose = () => {
    // Xóa điều kiện kiểm tra showImageSelection để luôn cho phép đóng modal
    // if (showImageSelection) return; // Xóa dòng này

    resetForm();
    onClose();
  };

  const handleFinalClose = () => {
    resetForm();
    onSuccess();
    onClose();
  };

  // Thêm hàm mới để xử lý quay lại từ màn hình chọn ảnh
  const handleImageSelectionCancel = () => {
    // Đặt lại trạng thái modal chọn ảnh
    setShowImageSelection(false);
    setApiResponseData(null);

    // Hiển thị thông báo
    notifySuccess({
      title: "Thành công",
      message: "Đã thêm thành công nhưng bỏ qua xử lý ảnh!",
    });

    // Đóng modal
    handleFinalClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Thêm thông tin cần thiết
      formData.append("parentId", parentId);
      formData.append("parentSpouseId", values.parentSpouseId); // Add selected spouse ID

      // Thêm các trường khác từ form
      Object.entries(values).forEach(([key, value]) => {
        // Skip parentSpouseId as we've already added it separately
        if (key === "parentSpouseId") return;

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

      // Thêm file ảnh vào formData - changed to single file
      if (uploadedFile) {
        formData.append("files", uploadedFile);
      }

      // Sử dụng mutation để gửi request
      createChildMutation.mutate(formData, {
        onError: (error: any) => {
          setError(
            error?.response?.data?.message || "Có lỗi xảy ra khi thêm con"
          );
          notifyError({
            title: "Thất bại",
            message: "Có lỗi xảy ra khi thêm con.",
          });
          setLoading(false);
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi thêm con"
      );
      console.error("Error adding child:", err);
      setLoading(false);
    }
  };

  // Xử lý khi người dùng hoàn thành việc chọn ảnh
  const handleImageSelectionComplete = (mediaData: MediaSelectionResult[]) => {
    console.log("Selected media data:", mediaData);
    notifySuccess({
      title: "Thành công",
      message: "Đã thêm con thành công và xử lý ảnh!",
    });
    handleFinalClose();
  };

  // Determine the label for the spouse selection based on parent gender
  const getSpouseSelectLabel = () => {
    if (parentGender === "male") {
      return "Chọn mẹ";
    } else if (parentGender === "female") {
      return "Chọn bố";
    }
    return "Chọn bố/mẹ"; // Default if gender is unknown
  };

  // Determine placeholder text
  const getSpousePlaceholder = () => {
    if (parentGender === "male") {
      return "Chọn mẹ của đứa trẻ";
    } else if (parentGender === "female") {
      return "Chọn bố của đứa trẻ";
    }
    return "Chọn bố/mẹ của đứa trẻ"; // Default if gender is unknown
  };

  // Get appropriate alert text if no spouses available
  const getNoSpouseAlertText = () => {
    if (parentGender === "male") {
      return "Không có người vợ nào. Hãy thêm vợ trước khi thêm con.";
    } else if (parentGender === "female") {
      return "Không có người chồng nào. Hãy thêm chồng trước khi thêm con.";
    }
    return "Không có người phối ngẫu. Hãy thêm người phối ngẫu trước khi thêm con.";
  };

  // Clean up object URLs when component unmounts
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
        onClose={handleClose} // Sử dụng handleClose để luôn cho phép đóng modal
        title={
          <Text size="xl" fw={700} c="brown">
            Xử lý ảnh cho thành viên mới
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
          onCancel={handleImageSelectionCancel} // Sử dụng hàm mới để xử lý khi người dùng hủy
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
          {`Thêm con cho ${name}`}
        </Text>
      }
      centered
      size="lg"
    >
      <LoadingOverlay
        visible={loading || createChildMutation.isPending || isLoading}
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
          {/* Spouse Selection */}
          {spouseOptions.length > 0 ? (
            <Select
              label={getSpouseSelectLabel()}
              placeholder={getSpousePlaceholder()}
              data={spouseOptions}
              {...form.getInputProps("parentSpouseId")}
              required
              searchable
              nothingFoundMessage="Không tìm thấy kết quả"
            />
          ) : (
            <Alert color="yellow">{getNoSpouseAlertText()}</Alert>
          )}

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

          <Select
            label="Giới tính"
            placeholder="Chọn giới tính"
            data={[
              { value: "male", label: "Nam" },
              { value: "female", label: "Nữ" },
            ]}
            {...form.getInputProps("gender")}
            searchable={false}
            clearable={false}
          />

          <Switch
            label="Còn sống"
            mt="xs"
            {...form.getInputProps("isAlive", { type: "checkbox" })}
          />

          {/* Death information (only shown when isAlive is false) */}
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

          <NumberInput
            label="Thứ tự sinh"
            placeholder="Nhập thứ tự sinh"
            required
            {...form.getInputProps("birthOrder")}
            min={1}
          />

          <Textarea
            label="Thông tin tóm tắt"
            placeholder="Nhập thông tin tóm tắt"
            autosize
            minRows={3}
            maxRows={5}
            {...form.getInputProps("shortSummary")}
          />

          {/* Image upload section - modified for single image */}
          <FileInput
            label="Ảnh đại diện"
            placeholder="Tải lên ảnh"
            accept="image/png,image/jpeg,image/jpg"
            leftSection={<IconUpload size={16} />}
            onChange={handleImageUpload}
            value={uploadedFile}
          />

          {/* Image preview section - modified to align left instead of center */}
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
              loading={createChildMutation.isPending}
              color="brown"
              disabled={spouseOptions.length === 0}
            >
              Thêm
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AddChildModal;
