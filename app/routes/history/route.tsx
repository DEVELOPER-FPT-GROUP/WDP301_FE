import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Divider,
  FileInput,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  Menu,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Timeline,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useEffect, useState } from "react";
import {
  useDeleteApi,
  useGetApi,
  usePostApi,
  usePutApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import * as yup from "yup";
import { IconEdit, IconSettings, IconTrash } from "@tabler/icons-react";

interface FamilyStory {
  historicalRecordId?: string;
  familyId?: string;
  historicalRecordTitle: string;
  historicalRecordSummary: string;
  historicalRecordDetails: string;
  startDate: string;
  endDate: string;
  base64Images?: string[];
}

const validationSchema = yup.object().shape({
  historicalRecordTitle: yup.string().required("Tiêu đề không được để trống"),
  historicalRecordSummary: yup.string().required("Tóm tắt không được để trống"),
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

export const meta = () => [{ title: "Lịch sử dòng họ" }];

const route = () => {
  const [familyHistories, setFamilyHistories] = useState<FamilyStory[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedStory, setSelectedStory] = useState<FamilyStory | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [viewModalOpened, setViewModalOpened] = useState(false);

  const handleImageUpload = (files: File[] | null) => {
    if (!files) return;
    const filePromises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Chuyển file sang Base64
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    });

    Promise.all(filePromises).then((base64Files) => {
      form.setFieldValue("base64Images", base64Files);
      setPreviewImages(base64Files);
    });
  };

  const { data, isSuccess, refetch } = useGetApi({
    queryKey: ["history"],
    endpoint: "family-history/family/:id",
    urlParams: { id: "67b48631521488258760621a" },
  });

  useEffect(() => {
    setLoadingData(true); // Bắt đầu tải dữ liệu

    const timeout = setTimeout(() => {
      setLoadingData(false); // Sau 5s, nếu vẫn đang tải thì đặt loadingData = false
    }, 3000);

    if (isSuccess && data) {
      setFamilyHistories(data.data);
      setLoadingData(false); // Dữ liệu đã tải xong, nên đặt loadingData = false ngay
      clearTimeout(timeout); // Xóa timeout để tránh cập nhật không cần thiết
    } else {
      setFamilyHistories([]);
    }

    return () => clearTimeout(timeout); // Xóa timeout khi component unmount
  }, [data, isSuccess]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const form = useForm({
    initialValues: {
      familyId: "67b48631521488258760621a",
      historicalRecordTitle: "",
      historicalRecordSummary: "",
      historicalRecordDetails: "",
      startDate: "",
      endDate: "",
      base64Images: [] as string[],
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

  const openModal = (story?: FamilyStory) => {
    setSelectedStory(story || null);
    if (story) {
      form.setValues({
        historicalRecordTitle: story.historicalRecordTitle,
        historicalRecordSummary: story.historicalRecordSummary,
        historicalRecordDetails: story.historicalRecordDetails,
        startDate: story.startDate ? new Date(story.startDate) : "",
        endDate: story.endDate ? new Date(story.endDate) : "",
        base64Images: story.base64Images || [],
      });
    } else {
      form.reset();
    }
    setModalOpened(true);
  };

  const closeViewModal = () => {
    setViewModalOpened(false);
    setSelectedStory(null);
  };
  const openViewModal = (story: FamilyStory) => {
    setSelectedStory(story);
    setViewModalOpened(true);
  };

  const closeModal = () => {
    setModalOpened(false);
    setSelectedStory(null);
    form.reset();
    setPreviewImages([]);
  };
  const createMutation = usePostApi({
    endpoint: "family-history",
    options: { onSuccess: refetch },
  });

  const updateMutation = usePutApi({
    endpoint: selectedStory
      ? `family-history/${selectedStory.historicalRecordId}`
      : "",
    options: { onSuccess: refetch },
  });

  const deleteMutation = useDeleteApi({
    endpoint: selectedStory
      ? `family-history/${selectedStory.historicalRecordId}`
      : "",
  });

  const handleDelete = () => {
    setLoading(true);
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        notifications.show({
          title: "Thành công",
          message: "Lịch sử dòng họ đã được xóa thành công!",
          color: "green",
        });
        refetch();
        setDeleteModalOpened(false);
        closeModal();
      },
      onError: () => {
        notifications.show({
          title: "Thất bại",
          message: "Có lỗi xảy ra khi xóa lịch sử dòng họ.",
          color: "red",
        });
      },
      onSettled: () => setLoading(false),
    });
  };

  const handleSubmit = (values: FamilyStory) => {
    setLoading(true);
    const mutation = selectedStory ? updateMutation : createMutation;
    const dataToSubmit = selectedStory
      ? {
          ...values,
          historicalRecordId: undefined,
          familyId: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        }
      : values;
    console.log(dataToSubmit);

    mutation.mutate(dataToSubmit as FamilyStory, {
      onSuccess: () => {
        notifications.show({
          title: "Thành công",
          message: selectedStory
            ? "Lịch sử dòng họ đã được cập nhật thành công!"
            : "Lịch sử dòng họ đã được thêm mới thành công!",
          color: "green",
        });
        refetch();
        closeModal();
      },
      onError: () => {
        notifications.show({
          title: "Thất bại",
          message: "Có lỗi xảy ra khi lưu lịch sử dòng họ.",
          color: "red",
        });
      },
      onSettled: () => setLoading(false),
    });
  };
  const images = ["kkk.jpg", "kkk.jpg", "kkk.jpg", "kkk.jpg"];
  return (
    <Container p={"xl"}>
      <Group justify="space-between" pb={"md"}>
        <Title
          order={1}
          size={30}
          fw={900}
          c="brown"
          ta="center"
          mb="md"
          style={{
            fontFamily: "'Pacifico', cursive",
            letterSpacing: "1px",
          }}
        >
          Lịch sử dòng họ
        </Title>
        <Button color="brown" radius="xl" size="md" onClick={() => openModal()}>
          + Thêm lịch sử
        </Button>
      </Group>
      {loadingData ? (
        <Center>
          <Loader color="blue" size="lg" />
        </Center>
      ) : (
        <Timeline
          active={familyHistories.length > 0 ? familyHistories.length - 1 : 0}
          bulletSize={24}
          lineWidth={4}
        >
          {familyHistories.length > 0 ? (
            familyHistories.map((story, index) => (
              <Timeline.Item
                key={index}
                title={
                  <Group justify="space-between">
                    <Text size="lg" fw={600}>
                      {story.historicalRecordTitle}
                    </Text>
                    {/* Menu cài đặt */}
                    <Menu position="bottom-end" shadow="md" width={150}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconSettings size={20} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={18} />}
                          onClick={() => openModal(story)}
                        >
                          Chỉnh sửa
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={18} />}
                          color="red"
                          onClick={() => {
                            setSelectedStory(story);
                            setDeleteModalOpened(true);
                          }}
                        >
                          Xóa
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                }
              >
                <Card
                  shadow="sm"
                  padding="md"
                  radius="md"
                  withBorder
                  onClick={() => openViewModal(story)}
                  style={{ cursor: "pointer" }}
                >
                  <Badge color="gray" size="lg" mb="xs">
                    📅 {formatDate(story.startDate)} -{" "}
                    {formatDate(story.endDate)}
                  </Badge>
                  <Text size="md" mb="lg" c="dimmed">
                    {story.historicalRecordSummary}
                  </Text>
                </Card>
              </Timeline.Item>
            ))
          ) : (
            <Text
              size="sm"
              c="gray"
              style={{ textAlign: "center", marginTop: "16px" }}
              mt="md"
            >
              Không có dữ liệu lịch sử gia đình.
            </Text>
          )}
        </Timeline>
      )}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={
          <Title order={2}>
            {selectedStory ? "Chỉnh sửa lịch sử" : "Thêm mới lịch sử"}
          </Title>
        }
        centered
        size="60%"
      >
        <LoadingOverlay
          visible={loading}
          loaderProps={{ children: "Loading..." }}
        />
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
                {...form.getInputProps("startDate")}
              />
              <DateInput
                label="Ngày kết thúc"
                locale="vi"
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
              onChange={handleImageUpload}
            />
            {previewImages.length > 0 && (
              <SimpleGrid cols={3} spacing="md">
                {previewImages.map((src, index) => (
                  <Image
                    key={index}
                    src={src}
                    alt={`Hình ảnh ${index + 1}`}
                    radius="md"
                  />
                ))}
              </SimpleGrid>
            )}
            <Group justify="flex-end">
              <Button variant="default" onClick={closeModal}>
                Hủy
              </Button>
              <Button color="brown" type="submit">
                Lưu
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={<Text fw={600}>Xác nhận xóa</Text>}
        centered
      >
        <Text>Bạn có chắc chắn muốn xóa lịch sử này không?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
            Hủy
          </Button>
          <Button color="red" onClick={handleDelete}>
            Xóa
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title={
          <Title order={2} c="brown">
            📖 Chi tiết lịch sử
          </Title>
        }
        centered
        size="60%"
      >
        {loadingData ? (
          <Center>
            <Loader color="blue" size="lg" />
          </Center>
        ) : (
          <Stack justify="md">
            {/* Tiêu đề lớn */}
            <Title
              size={30}
              fw={900}
              order={3}
              ta="center"
              style={{
                fontFamily: "'Pacifico', cursive",
                letterSpacing: "1px",
              }}
            >
              {selectedStory?.historicalRecordTitle}
            </Title>

            <Group justify="center">
              <Badge color="brown" size="lg">
                📅 {formatDate(selectedStory?.startDate ?? "")} -{" "}
                {formatDate(selectedStory?.endDate ?? "")}
              </Badge>
            </Group>

            <Divider />

            {/* Tóm tắt */}
            <Text fw={600} size="lg" c="dimmed">
              📝 Tóm tắt:
            </Text>
            <Text size="md">{selectedStory?.historicalRecordSummary}</Text>

            {/* Chi tiết */}
            <Text fw={600} size="lg" c="dimmed">
              📜 Chi tiết:
            </Text>
            <Text size="md">{selectedStory?.historicalRecordDetails}</Text>

            <Divider />

            {/* Hiển thị nhiều ảnh */}
            {selectedStory?.base64Images &&
              selectedStory.base64Images.length > 0 && (
                <>
                  <Text fw={600} size="lg" c="dimmed">
                    🖼 Hình ảnh:
                  </Text>
                  <SimpleGrid cols={3} spacing="md">
                    {selectedStory.base64Images.map((src: any, index) => (
                      <Image
                        key={index}
                        src={src.url}
                        alt={`Ảnh ${index + 1}`}
                        radius="md"
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "150px",
                        }}
                      />
                    ))}
                  </SimpleGrid>
                </>
              )}
            <Group justify="flex-end">
              <Button variant="default" onClick={closeViewModal}>
                Đóng
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default route;
