import React, { useState } from "react";
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

  // States for managing images
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<any>([]);

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

      // Thêm file ảnh vào formData
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((file) => {
          formData.append("files", file);
        });
      }
      // console.log("formData", formData);
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      // Sử dụng mutation để gửi request
      createSpouseMutation.mutate(formData, {
        onSuccess: () => {
          notifySuccess({
            title: "Thành công",
            message: `Đã thêm ${
              gender === "male" ? "vợ" : "chồng"
            } thành công!`,
          });
          setLoading(false);
          handleClose();
        },
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
