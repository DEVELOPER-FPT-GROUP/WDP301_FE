import {
  AppShell,
  Button,
  FileInput,
  Group,
  Image,
  Modal,
  MultiSelect,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { DateTimePicker } from "@mantine/dates";

export const meta = () => [{ title: "Sự kiện" }];

export default function EventPage() {
  const [opened, setOpened] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [formValid, setFormValid] = useState(false);
  const [error, setError] = useState("");
  const handleImageUpload = (files: File[]) => {
    setEventData({ ...eventData, images: files });
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };
  const [eventData, setEventData] = useState({
    event_name: "",
    event_description: "",
    event_scope: "" as string | null,
    event_type: "" as string | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    location: "",
    recurrenceFrequency: "" as string | null,
    participants: [] as string[],
    images: [] as File[],
  });

  const eventsType = [
    { label: "Sinh nhật", value: "BIRTHDAY" },
    { label: "Đám ma", value: "DEATH" },
    { label: "Kết hôn", value: "MARRIAGE" },
    { label: "Tiệc", value: "PARTY" },
    { label: "Họp", value: "MEETING" },
    { label: "Kỷ niệm", value: "ANNIVERSARY" },
    { label: "Khác", value: "OTHER" },
  ];

  const eventsScope = [
    { label: "Họ", value: "FAMILY" },
    { label: "Chi", value: "BRANCH" },
    { label: "Gia đình", value: "HOUSE_HOLD" },
    { label: "Cá nhân", value: "PRIVATE" },
  ];

  const eventsConcurrence = [
    { label: "Hàng ngày", value: "daily" },
    { label: "Hàng tuần", value: "weekly" },
    { label: "Hàng tháng", value: "monthly" },
    { label: "Hàng năm", value: "yearly" },
  ];

  const handleSubmit = () => {
    if (formValid) {
      console.log("Dữ liệu sự kiện:", eventData);
    }
  };

  useEffect(() => {
    if (
      eventData.startDate &&
      eventData.endDate &&
      eventData.startDate > eventData.endDate
    ) {
      setError("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
      setFormValid(false);
    } else if (
      eventData.event_name &&
      eventData.event_type &&
      eventData.event_scope &&
      eventData.startDate &&
      eventData.endDate &&
      eventData.location
    ) {
      setError("");
      setFormValid(true);
    } else if (
      eventData.startDate &&
      eventData.endDate &&
      eventData.startDate < eventData.endDate
    ) {
      setError("");
    } else {
      setFormValid(false);
    }
  }, [eventData]);

  const closeAddModal = () => {
    setOpened(false);
    setError("");
    setFormValid(false);
    setEventData({
      event_name: "",
      event_description: "",
      event_scope: "",
      event_type: "",
      startDate: null,
      endDate: null,
      location: "",
      recurrenceFrequency: "",
      participants: [],
      images: [],
    });
    setPreviewImages([]);
  };

  const openEditModal = (data: typeof eventData) => {
    setEventData({ ...data });
    if (data.images && data.images.length > 0) {
      setPreviewImages(data.images.map((file) => URL.createObjectURL(file)));
    }
    setOpened(true);
  };

  return (
    <AppShell padding="lg" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Stack justify="md">
        <Group justify="space-between">
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
            Sự kiện
          </Title>
          <Button
            color="brown"
            radius="xl"
            size="md"
            onClick={() => setOpened(true)}
          >
            + Tạo sự kiện
          </Button>

          <Button
            color="brown"
            radius="xl"
            size="md"
            onClick={() =>
              openEditModal({
                event_name: "ccc",
                event_description: "ccc",
                event_scope: "FAMILY",
                event_type: "DEATH",
                startDate: new Date("2025-02-07T07:22:00.000Z"),
                endDate: new Date("2025-02-21T08:33:00.000Z"),
                location: "nhà",
                recurrenceFrequency: "weekly",
                participants: ["1", "2"],
                images: [],
              })
            }
          >
            chỉnh sửa
          </Button>
        </Group>
      </Stack>
      <Modal
        opened={opened}
        title={<Title order={2}>Tạo sự kiện mới</Title>}
        centered
        size="70%"
        onClose={closeAddModal}
      >
        <Stack justify="md">
          <TextInput
            label="Tên sự kiện"
            placeholder="Nhập tên sự kiện"
            required
            value={eventData.event_name}
            onChange={(e) =>
              setEventData({ ...eventData, event_name: e.currentTarget.value })
            }
          />
          <Textarea
            label="Mô tả sự kiện"
            placeholder="Nhập mô tả"
            onChange={(e) =>
              setEventData({
                ...eventData,
                event_description: e.currentTarget.value,
              })
            }
            value={eventData.event_description}
          />
          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Loại sự kiện"
              data={eventsType}
              placeholder="Chọn loại sự kiện"
              onChange={(value) =>
                setEventData({ ...eventData, event_type: value })
              }
              required
              value={eventData.event_type}
            />
            <Select
              label="Phạm vi sự kiện"
              data={eventsScope}
              placeholder="Chọn phạm vi sự kiện"
              required
              onChange={(value) =>
                setEventData({ ...eventData, event_scope: value })
              }
              value={eventData.event_scope}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="md">
            <DateTimePicker
              clearable
              label="Chọn ngày và giờ bắt đầu"
              locale="vi"
              onChange={(value) =>
                setEventData({ ...eventData, startDate: value })
              }
              required
              error={error}
              value={eventData.startDate}
            />
            <DateTimePicker
              clearable
              label="Chọn ngày và giờ kết thúc"
              locale="vi"
              onChange={(value) =>
                setEventData({ ...eventData, endDate: value })
              }
              required
              value={eventData.endDate}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="md">
            <TextInput
              label="Địa chỉ tổ chức"
              placeholder="Địa chỉ tổ chức"
              required
              onChange={(e) =>
                setEventData({
                  ...eventData,
                  location: e.currentTarget.value,
                })
              }
              value={eventData.location}
            />
            <Select
              label="Lặp lại"
              data={eventsConcurrence}
              placeholder="Lặp lại "
              onChange={(value) =>
                setEventData({ ...eventData, recurrenceFrequency: value })
              }
              value={eventData.recurrenceFrequency}
            />
          </SimpleGrid>
          <MultiSelect
            label="Người tham gia"
            data={[
              { value: "1", label: "Nguyễn Văn A" },
              { value: "2", label: "Trần Thị B" },
            ]}
            placeholder="Chọn người tham gia"
            onChange={(values) =>
              setEventData({ ...eventData, participants: values })
            }
            value={eventData.participants}
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
          <Group justify="right" mt="md">
            <Button variant="default" onClick={closeAddModal}>
              Hủy
            </Button>
            <Button color="brown" onClick={handleSubmit} disabled={!formValid}>
              Tạo
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}
