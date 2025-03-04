import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Title,
  SimpleGrid,
  Textarea,
  FileInput,
  Image,
  ActionIcon,
  Card,
  Group,
  LoadingOverlay,
  Transition,
  Center,
} from "@mantine/core";
import {
  usePostApi,
  usePutApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import { DateInput } from "@mantine/dates";
import { IconX } from "@tabler/icons-react";
import * as yup from "yup";
import { useForm } from "@mantine/form";

const FormModal = ({ opened, onClose, data, refreshTable }: any) => {
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<any>([]);
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
  const validationSchema = yup.object().shape({
    historicalRecordTitle: yup.string().required("Tiêu đề không được để trống"),
    historicalRecordSummary: yup
      .string()
      .required("Tóm tắt không được để trống"),
    historicalRecordDetails: yup
      .string()
      .required("Chi tiết không được để trống"),
    startDate: yup
      .date()
      .typeError("Ngày bắt đầu không hợp lệ")
      .required("Ngày bắt đầu không được để trống"),
    endDate: yup
      .date()
      .typeError("Ngày kết thúc không hợp lệ")
      .required("Ngày kết thúc không được để trống")
      .min(yup.ref("startDate"), "Ngày kết thúc phải lớn hơn ngày bắt đầu"),
  });

  const form = useForm({
    initialValues: {
      familyId: "67b48631521488258760621a",
      historicalRecordTitle: "",
      historicalRecordSummary: "",
      historicalRecordDetails: "",
      startDate: "",
      endDate: "",
      base64Images: [],
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

  useEffect(() => {
    if (data) {
      const images = data.base64Images || [];
      setIsFetchingData(true);
      form.setValues({
        historicalRecordTitle: data.historicalRecordTitle,
        historicalRecordSummary: data.historicalRecordSummary,
        historicalRecordDetails: data.historicalRecordDetails,
        startDate: data.startDate ? new Date(data.startDate) : "",
        endDate: data.endDate ? new Date(data.endDate) : "",
        base64Images: data.base64Images || [],
      });
      setPreviewImages(images);
      console.log("Preview images updated:", images);
      // Đợi 1s để ảnh render kịp
      setTimeout(() => setIsFetchingData(false), 800);
    } else {
      form.reset();
      setPreviewImages([]);
      setDeletedImageIds([]);
      setUploadedFiles([]);
    }
  }, [data]);

  const createMutation = usePostApi({
    endpoint: "family-history",
    options: { onSuccess: refreshTable },
  });
  const updateMutation = usePutApi({
    endpoint: data ? `family-history/${data.historicalRecordId}` : "",
    options: { onSuccess: refreshTable },
  });

  const handleSubmit = (values: any) => {
    setLoading(true);
    const mutation = data ? updateMutation : createMutation;
    const formData = new FormData();

    if (!data) {
      formData.append("familyId", "67b48631521488258760621a");
    }
    formData.append("historicalRecordTitle", values.historicalRecordTitle);
    formData.append("historicalRecordSummary", values.historicalRecordSummary);
    formData.append("historicalRecordDetails", values.historicalRecordDetails);
    formData.append("startDate", values.startDate);
    formData.append("endDate", values.endDate);
    if (uploadedFiles.length > 0) {
      if (data) {
        formData.append("isChangeImage", "true");
      }
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });
    }

    if (deletedImageIds.length > 0) {
      deletedImageIds.forEach((id) => formData.append("deleteImageIds", id));
    }

    mutation.mutate(formData, {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: data
            ? "Lịch sử dòng họ đã được cập nhật thành công!"
            : "Lịch sử dòng họ đã được thêm mới thành công!",
        });
        onClose();
        setLoading(false);
        setPreviewImages([]);
        setDeletedImageIds([]);
        setUploadedFiles([]);
        form.reset();
      },
      onError: () => {
        notifyError({
          title: "Thất bại",
          message: "Có lỗi xảy ra khi lưu lịch sử dòng họ.",
        });
        setLoading(false);
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={2} c={"brown"}>
          {data ? "Chỉnh sửa lịch sử" : "Thêm mới lịch sử"}
        </Title>
      }
      centered
      size="60%"
    >
      <LoadingOverlay
        visible={loading}
        loaderProps={{ children: "Đang xử lý..." }}
      />
      <LoadingOverlay visible={isFetchingData} />
      {!isFetchingData ? (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Tiêu đề"
              placeholder="Nhập tiêu đề"
              {...form.getInputProps("historicalRecordTitle")}
            />
            <SimpleGrid cols={2} spacing="md">
              <DateInput
                label="Ngày bắt đầu"
                locale="vi"
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
                {...form.getInputProps("startDate")}
              />
              <DateInput
                label="Ngày kết thúc"
                locale="vi"
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
                {...form.getInputProps("endDate")}
              />
            </SimpleGrid>
            <Textarea
              label="Tóm tắt"
              placeholder="Nhập tóm tắt"
              {...form.getInputProps("historicalRecordSummary")}
            />
            <Textarea
              label="Chi tiết"
              placeholder="Nhập chi tiết"
              autosize
              minRows={4}
              {...form.getInputProps("historicalRecordDetails")}
            />
            <FileInput
              label="Tải lên hình ảnh"
              multiple
              placeholder="Chọn các hình ảnh"
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
            <Group justify="flex-end">
              <Button variant="default" onClick={onClose}>
                Hủy
              </Button>
              <Button color="brown" onClick={handleSubmit} type="submit">
                Lưu
              </Button>
            </Group>
          </Stack>
        </form>
      ) : (
        <Center style={{ height: 300 }}>
          <LoadingOverlay visible={true} />
        </Center>
      )}
    </Modal>
  );
};

export default FormModal;
