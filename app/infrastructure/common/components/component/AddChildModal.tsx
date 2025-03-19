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
  SimpleGrid,
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
  name: string; // Tên của cha/mẹ // ID của quan hệ gia đình nếu cần
}

interface ImagePreview {
  url: string;
  file: File;
  isNew: boolean;
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

  // States for managing images
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<ImagePreview[]>([]);

  // Function to handle image upload
  const handleImageUpload = (files: File[] | null) => {
    if (!files) return;
    const newPreviewUrls = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true,
    }));

    setPreviewImages((prev) => [...prev, ...newPreviewUrls]);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  // Function to handle image removal
  const handleRemoveImage = (image: ImagePreview) => {
    setPreviewImages((prev) => prev.filter((img) => img.url !== image.url));
    setUploadedFiles((prev) => prev.filter((file) => file !== image.file));
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
      onSuccess: () => {
        onSuccess();
        resetForm();
      },
    },
  });

  const resetForm = () => {
    form.reset();
    setPreviewImages([]);
    setUploadedFiles([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

      // Thêm file ảnh vào formData
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Sử dụng mutation để gửi request
      createChildMutation.mutate(formData, {
        onSuccess: () => {
          notifySuccess({
            title: "Thành công",
            message: "Đã thêm con thành công!",
          });
          setLoading(false);
          handleClose();
        },
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
              {previewImages.map((img, index) => (
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
