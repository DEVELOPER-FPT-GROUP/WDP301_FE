import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  SimpleGrid,
  FileInput,
  Image,
  Group,
  Button,
  Card,
  ActionIcon,
  LoadingOverlay,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useState } from "react";
import { usePostApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import * as yup from "yup";
import { useForm } from "@mantine/form";
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";
import { IconX } from "@tabler/icons-react";
const getUserNameFromToken = () => {
  const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);

  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.username;
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};
export function EventCreateModal({ opened, onClose, onSuccess }: any) {
  const validationSchema = yup.object().shape({
    eventName: yup.string().required("Tên sự kiện không được để trống"),
    startDate: yup
      .date()
      .typeError("Ngày không hợp lệ")
      .required("Ngày không được để trống"),
    location: yup.string().required("Địa điểm không được để trống"),
  });
  const userName = getUserNameFromToken();
  const form = useForm({
    initialValues: {
      createdBy: userName,
      eventName: "",
      eventDescription: "",
      startDate: "",
      base64Images: [],
      localtion: "",
    },
    validate: (values) => {
      try {
        validationSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (err: any) {
        const errors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          errors[e.path] = e.message;
        });
        return errors;
      }
    },
  });
  const [loading, setLoading] = useState(false);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const handleImageUpload = (
    files: File[] | null,
    setPreviewImages: any,
    setUploadedFiles: any
  ) => {
    if (!files) return;
    const newPreviewUrls = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true,
    }));

    setPreviewImages((prev: string[]) => [...prev, ...newPreviewUrls]);

    setUploadedFiles((prev: File[]) => [...prev, ...files]);
  };

  const createMutation = usePostApi({
    endpoint: "events",
  });

  const handleSubmit = (values: any) => {
    setLoading(true);

    const mutation = createMutation;
    const formData = new FormData();

    formData.append("eventName", values.eventName);
    formData.append("eventDescription", values.eventDescription);
    formData.append("location", values.location);
    formData.append("createdBy", values.createdBy);
    formData.append("startDate", values.startDate);
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });
    }

    mutation.mutate(formData, {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: "Sự kiện đã được thêm mới thành công!",
        });
        onClose();
        setLoading(false);
        onSuccess?.();
        handleClose();
      },
      onError: () => {
        notifyError({
          title: "Thất bại",
          message: "Có lỗi xảy ra khi lưu Sự kiện.",
        });
        setLoading(false);
      },
    });
  };

  const handleRemoveImage = (image: any) => {
    if (image.isNew) {
      console.log(image);
      setPreviewImages((prev: any) =>
        prev.filter((img: any) => img.url !== image.url)
      );
      setUploadedFiles(
        (prev) => prev.filter((file) => file !== image.file) // So sánh trực tiếp file
      );
    } else {
      // Nếu là ảnh cũ từ server (dùng mediaId)
      setPreviewImages((prev: any) =>
        prev.filter((img: any) => img.mediaId !== image.mediaId)
      );
      setDeletedImageIds((prev) => [...prev, image.mediaId]);
    }
  };

  const handleClose = () => {
    form.reset();
    setPreviewImages([]);
    setDeletedImageIds([]);
    setUploadedFiles([]);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Tạo sự kiện mới"
      size="70%"
      centered
    >
      <LoadingOverlay
        visible={loading}
        loaderProps={{ children: "Đang xử lý..." }}
      />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Tên sự kiện"
            placeholder="Nhập tên sự kiện"
            required
            {...form.getInputProps("eventName")}
          />
          <Textarea
            label="Mô tả sự kiện"
            placeholder="Nhập mô tả"
            {...form.getInputProps("eventDescription")}
          />
          <SimpleGrid cols={2} spacing="md">
            <DateTimePicker
              clearable
              label="Ngày"
              locale="vi"
              minDate={new Date()}
              {...form.getInputProps("startDate")}
            />
            <TextInput
              label="Địa điểm"
              placeholder="Nhập địa điểm"
              required
              {...form.getInputProps("location")}
            />
          </SimpleGrid>
          <FileInput
            label="Tải lên hình ảnh"
            multiple
            placeholder="Chọn hình ảnh"
            onChange={(files) =>
              handleImageUpload(files, setPreviewImages, setUploadedFiles)
            }
          />
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
                    variant="gradient"
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
                  />
                </Card>
              ))}
            </SimpleGrid>
          )}
          <Group justify="right" mt="md">
            <Button variant="default" onClick={handleClose}>
              Hủy
            </Button>
            <Button color="brown" type="submit">
              Tạo
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
