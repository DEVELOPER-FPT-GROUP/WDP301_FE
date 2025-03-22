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

const EditDetailMemberModal: React.FC<EditDetailMemberModalProps> = ({
  opened,
  onClose,
  refreshState,
  memberId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<ImagePreview | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null); // Track only one ID to delete
  const [hasExistingImage, setHasExistingImage] = useState(false);

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
    options: { onSuccess: refreshState },
  });

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

    // Log FormData content for debugging
    // console.log("FormData entries:");
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ": " + pair[1]);
    // }

    editMemberApi.mutate(formData, {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: `Chỉnh sửa ${fullName} thành công!`,
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
      },
      onError: (err) => {
        notifyError({
          title: "Lỗi",
          message: `Chỉnh sửa ${fullName} thất bại!`,
        });
        setIsLoading(false);
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
              <Button variant="default" onClick={onClose}>
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
