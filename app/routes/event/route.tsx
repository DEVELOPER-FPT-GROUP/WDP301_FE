import {
  AppShell,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  FileInput,
  Group,
  Image,
  Modal,
  MultiSelect,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { SolarDate } from "@nghiavuive/lunar_date_vi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  type DateClickArg,
} from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  convertRecurrence,
  convertStatus,
} from "~/infrastructure/utils/constant";
import { DateTimePicker } from "@mantine/dates";

export const meta = () => [{ title: "Sự kiện" }];

export default function EventPage() {
  const [opened, setOpened] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [lunarInfo, setLunarInfo] = useState({
    hour: "",
    day: "",
    month: "",
    year: "",
    hourDisplay: "",
    dayDisplay: "",
    monthDisplay: "",
    yearDisplay: "",
  });
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState([]);
  // const { data } = useGetApi({
  //   queryKey: ["events"],
  //   endpoint: "events",
  // });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const handleImageUpload = (files: File[]) => {
    setEventData({ ...eventData, images: files });
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };
  const [data, setData] = useState([
    {
      event_id: 1,
      created_by: 1,
      event_scope: "FAMILY",
      event_type: "ANNIVERSARY",
      event_name: "Giỗ tổ Nguyễn Văn A",
      event_description: "Ngày giỗ ông tổ Nguyễn Văn A.",
      gregorian_event_date: "2025-03-15",
      lunar_event_date: "2025-02-05",
      recurrence_rule: "YEARLY",
      end_recurrence_date: null,
      location: "Nhà thờ họ Nguyễn",
      created_at: "2025-02-17T10:00:00Z",
      eventParticipants: [
        {
          participant_id: 1,
          event_id: 1,
          member_id: 1,
          role_in_event: "Host",
          rsvp_status: "Accepted",
          member: {
            id: 1,
            firstName: "Nguyễn",
            middleName: "Văn",
            lastName: "A",
          },
        },
        {
          participant_id: 2,
          event_id: 1,
          member_id: 2,
          role_in_event: "Guest",
          rsvp_status: "Pending",
          member: {
            id: 2,
            firstName: "Trần",
            middleName: "Thị",
            lastName: "B",
          },
        },
      ],
      media: [
        {
          media_id: 1,
          owner_id: 1,
          url: "/kkk.jpg",
          ownerType: "Event",
          fileName: "gioto.jpg",
          caption: "Hình ảnh Giỗ tổ Nguyễn Văn A",
          mimeType: "image/jpeg",
          size: 2048,
          created_at: "2025-02-17T10:30:00Z",
          updated_at: "2025-02-17T10:30:00Z",
        },
        {
          media_id: 2,
          owner_id: 2,
          url: "/kkk.jpg",
          ownerType: "Event",
          fileName: "sinhnhatB.jpg",
          caption: "Sinh nhật Bà B",
          mimeType: "image/jpeg",
          size: 1024,
          created_at: "2025-02-17T11:30:00Z",
          updated_at: "2025-02-17T11:30:00Z",
        },
        {
          media_id: 2,
          owner_id: 2,
          url: "/kkk.jpg",
          ownerType: "Event",
          fileName: "sinhnhatB.jpg",
          caption: "Sinh nhật Bà B",
          mimeType: "image/jpeg",
          size: 1024,
          created_at: "2025-02-17T11:30:00Z",
          updated_at: "2025-02-17T11:30:00Z",
        },
        {
          media_id: 2,
          owner_id: 2,
          url: "/kkk.jpg",
          ownerType: "Event",
          fileName: "sinhnhatB.jpg",
          caption: "Sinh nhật Bà B",
          mimeType: "image/jpeg",
          size: 1024,
          created_at: "2025-02-17T11:30:00Z",
          updated_at: "2025-02-17T11:30:00Z",
        },
      ],
    },
    {
      event_id: 2,
      created_by: 2,
      event_scope: "FAMILY",
      event_type: "BIRTHDAY",
      event_name: "Sinh nhật Bà Nguyễn Thị B",
      event_description: "Sinh nhật bà Nguyễn Thị B.",
      gregorian_event_date: "2025-03-20",
      lunar_event_date: "2025-05-10",
      recurrence_rule: "YEARLY",
      end_recurrence_date: null,
      location: "Nhà Bà B",
      created_at: "2025-02-17T11:00:00Z",
      eventParticipants: [
        {
          participant_id: 1,
          event_id: 1,
          member_id: 1,
          role_in_event: "Host",
          rsvp_status: "Accepted",
          member: {
            id: 1,
            firstName: "Nguyễn",
            middleName: "Văn",
            lastName: "A",
          },
        },
        {
          participant_id: 2,
          event_id: 1,
          member_id: 2,
          role_in_event: "Guest",
          rsvp_status: "Pending",
          member: {
            id: 2,
            firstName: "Trần",
            middleName: "Thị",
            lastName: "B",
          },
        },
      ],
      media: [
        {
          media_id: 1,
          owner_id: 1,
          url: "/kkk.jpg",
          ownerType: "Event",
          fileName: "gioto.jpg",
          caption: "Hình ảnh Giỗ tổ Nguyễn Văn A",
          mimeType: "image/jpeg",
          size: 2048,
          created_at: "2025-02-17T10:30:00Z",
          updated_at: "2025-02-17T10:30:00Z",
        },
        {
          media_id: 2,
          owner_id: 2,
          url: "/kkk.jpg",
          ownerType: "Event",
          fileName: "sinhnhatB.jpg",
          caption: "Sinh nhật Bà B",
          mimeType: "image/jpeg",
          size: 1024,
          created_at: "2025-02-17T11:30:00Z",
          updated_at: "2025-02-17T11:30:00Z",
        },
      ],
    },
  ]);
  const [dateTitle, setDateTitle] = useState("hôm nay");

  const handleDateClick = (info: DateClickArg) => {
    const now = new Date();
    const nowString = now.toISOString().split("T")[0]; // Chuyển now thành chuỗi yyyy-mm-dd
    console.log(nowString);
    console.log(info.dateStr);
    if (nowString === info.dateStr) {
      setDateTitle("hôm nay");
    } else {
      setDateTitle(info.dateStr);
    }
    const eventsOnDate = data.filter(
      (event: any) => event.gregorian_event_date === info.dateStr
    );
    setSelectedEvents(eventsOnDate);
  };

  const [selectedEvent, setSelectedEvent] = useState(null) as any;
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const solarDate = new SolarDate(now);
      const lunarDate = solarDate.toLunarDate();
      const jd = SolarDate.jdn(now);

      const getLunarHours = (hours: number, dayStemIndex: number) => {
        const earthlyBranches = [
          "Tý",
          "Sửu",
          "Dần",
          "Mão",
          "Thìn",
          "Tỵ",
          "Ngọ",
          "Mùi",
          "Thân",
          "Dậu",
          "Tuất",
          "Hợi",
        ];

        const heavenlyStems = [
          "Giáp",
          "Ất",
          "Bính",
          "Đinh",
          "Mậu",
          "Kỷ",
          "Canh",
          "Tân",
          "Nhâm",
          "Quý",
        ];

        const hourIndex = Math.floor((hours + 1) / 2) % 12;

        const stemIndex = (dayStemIndex * 2 + hourIndex) % 10;

        return `${heavenlyStems[stemIndex]} ${earthlyBranches[hourIndex]}`;
      };

      const lunarHour = getLunarHours(now.getHours(), (jd + 9) % 10);

      const formatTime = (time: number) => time.toString().padStart(2, "0");
      setLunarInfo({
        hour: lunarHour,
        day: lunarDate.getDayName(),
        month: lunarDate.getMonthName(),
        year: lunarDate.getYearName(),
        hourDisplay: `${formatTime(now.getHours())}:${formatTime(
          now.getMinutes()
        )}`,
        dayDisplay: `${lunarDate.get().day}`,
        monthDisplay: `${lunarDate.get().month}`,
        yearDisplay: `${lunarDate.get().year}`,
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateEvent = () => {
    console.log("Event Created");
    const newEvent = {
      event_id: 3,
      created_by: 3,
      event_scope: "BRANCH",
      event_type: "MARRIAGE",
      event_name: "Đám cưới Nguyễn Thị C",
      event_description: "Đám cưới Nguyễn Thị C",
      gregorian_event_date: "2025-02-21",
      lunar_event_date: "2025-01-25",
      recurrence_rule: "YEARLY",
      end_recurrence_date: null,
      location: "Trống hồng place",
      created_at: "2025-02-17T11:00:00Z",
      eventParticipants: [
        {
          participant_id: 1,
          event_id: 1,
          member_id: 1,
          role_in_event: "Host",
          rsvp_status: "Accepted",
          member: {
            id: 1,
            firstName: "Nguyễn",
            middleName: "Văn",
            lastName: "A",
          },
        },
        {
          participant_id: 2,
          event_id: 1,
          member_id: 2,
          role_in_event: "Guest",
          rsvp_status: "Pending",
          member: {
            id: 2,
            firstName: "Trần",
            middleName: "Thị",
            lastName: "B",
          },
        },
      ],
      media: [
        {
          media_id: 1,
          owner_id: 1,
          url: "/kkk.jpg",
          ownerType: "Event",
          fileName: "gioto.jpg",
          caption: "Hình ảnh Giỗ tổ Nguyễn Văn A",
          mimeType: "image/jpeg",
          size: 2048,
          created_at: "2025-02-17T10:30:00Z",
          updated_at: "2025-02-17T10:30:00Z",
        },
        {
          media_id: 2,
          owner_id: 2,
          url: "/kkk.jpg",
          ownerType: "Event",
          fileName: "sinhnhatB.jpg",
          caption: "Sinh nhật Bà B",
          mimeType: "image/jpeg",
          size: 1024,
          created_at: "2025-02-17T11:30:00Z",
          updated_at: "2025-02-17T11:30:00Z",
        },
      ],
    };
    setData([...data, newEvent]);

    data.push(newEvent);
    setOpened(false);
  };
  const getLunarDate = (date: Date) => {
    const solarDate = new SolarDate(date);
    const lunarDate = solarDate.toLunarDate();
    return `${lunarDate.get().day}/${lunarDate.get().month}`;
  };
  const [eventData, setEventData] = useState({
    event_name: "",
    event_description: "",
    event_scope: "",
    event_type: "",
    date: null,
    time: "",
    participants: [],
    images: [],
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
        </Group>
        <Card
          shadow="xs"
          padding="sm"
          radius="lg"
          withBorder
          style={{
            backgroundColor: "#f7ecc6",
            cursor: "pointer",
            transition: "0.3s",
            ":hover": { boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" },
          }}
          onClick={() => {
            setShowCalendar(!showCalendar);
          }}
        >
          <Group justify="space-around">
            {["Giờ", "Ngày", "Tháng", "Năm"].map((label, index) => (
              <Box key={label} style={{ textAlign: "center" }}>
                <Title order={4}>{label}</Title>
                <Text
                  size="xl"
                  c={["orange", "blue", "red", "green"][index]}
                  fw={800}
                  style={{
                    fontFamily: "'Pacifico', cursive",
                    letterSpacing: "1px",
                  }}
                >
                  {
                    [
                      lunarInfo.hourDisplay,
                      lunarInfo.dayDisplay,
                      lunarInfo.monthDisplay,
                      lunarInfo.yearDisplay,
                    ][index]
                  }
                </Text>
                <Text>
                  {
                    [
                      lunarInfo.hour,
                      lunarInfo.day,
                      lunarInfo.month,
                      lunarInfo.year,
                    ][index]
                  }
                </Text>
              </Box>
            ))}
          </Group>
        </Card>
        {showCalendar && (
          <Card padding="md" radius="md" withBorder>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={viLocale}
              headerToolbar={{
                left: "prev",
                center: "title",
                right: "next",
              }}
              selectable={true}
              selectMirror={true}
              events={
                data
                  ? data.map((event: any) => ({
                      title: event.event_name,
                      start: event.gregorian_event_date,
                      color: "#FBBF24",
                    }))
                  : []
              }
              dayCellContent={(arg) => {
                return (
                  <div>
                    <span>{arg.dayNumberText}</span>
                    <br />
                    <span style={{ fontSize: "0.7em", color: "#E76F51" }}>
                      {getLunarDate(arg.date)}
                    </span>
                  </div>
                );
              }}
              dateClick={handleDateClick}
              height="350px"
              contentHeight="auto"
            />
          </Card>
        )}
        <Card padding="md" radius="md" withBorder>
          <Title order={5} mb="xs">
            📆 Sự kiện {dateTitle}
          </Title>
          {selectedEvents.length > 0 ? (
            <Stack justify="md">
              {selectedEvents.map((event: any, index) => (
                <Group
                  key={index}
                  justify="apart"
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#e7f3ff",
                    borderRadius: "12px",
                    transition: "0.3s",
                    cursor: "pointer",
                    ":hover": { transform: "scale(1.02)" },
                  }}
                  onClick={() => {
                    setSelectedEvent(event);
                    setModalOpened(true);
                  }}
                >
                  <Text c="dark" size="lg" fw={600}>
                    {event.event_name}
                  </Text>
                  <Text c="gray" size="sm">
                    🕒 20:00
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text c="gray">Không có sự kiện nào diễn ra {dateTitle}</Text>
          )}
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Title order={5} mb="xs">
            30 ngày tới
          </Title>
          {data && data.length > 0 ? (
            <Stack justify="md">
              {data.map((event: any, index: any) => (
                <Group
                  key={index}
                  justify="apart"
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#e7f3ff",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    ":hover": { transform: "scale(1.02)" },
                  }}
                  onClick={() => {
                    setSelectedEvent(event);
                    setModalOpened(true);
                  }}
                >
                  <Text
                    c="dark"
                    size="md"
                    fw={600}
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {event.event_name}
                  </Text>
                  <Group justify="xs" style={{ alignItems: "center" }}>
                    <Text c="blue" size="sm" style={{ fontWeight: 500 }}>
                      📅 {event.gregorian_event_date}
                    </Text>
                    <Text c="gray" size="sm">
                      🕒 {event.time || "Chưa đặt giờ"}
                    </Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text c="gray">Không có sự kiện nào diễn ra trong 30 ngày tới</Text>
          )}
        </Card>
      </Stack>
      <Modal
        opened={opened}
        title={
          <Text size="xl" fw={700} c="brown">
            Tạo sự kiện mới
          </Text>
        }
        centered
        size="70%"
        onClose={() => setOpened(false)}
      >
        <Stack justify="md">
          <TextInput
            label="Tên sự kiện"
            placeholder="Nhập tên sự kiện"
            required
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
          />
          {/* <SimpleGrid cols={2} spacing="md">
            <Select
              label="Loại sự kiện"
              data={eventsType}
              placeholder="Chọn loại sự kiện"
              onChange={(value) =>
                setEventData({ ...eventData, event_type: value })
              }
              required
            />
            <Select
              label="Phạm vi sự kiện"
              data={eventsScope}
              placeholder="Chọn phạm vi sự kiện"
              required
            />
          </SimpleGrid> */}
          <SimpleGrid cols={2} spacing="md">
            <DateTimePicker
              clearable
              label="Chọn ngày và giờ bắt đầu"
              locale="vi"
              onChange={(value) =>
                setEventData({ ...eventData, startDate: value })
              }
              required
            />
            <DateTimePicker
              clearable
              label="Chọn ngày và giờ kết thúc"
              locale="vi"
              onChange={(value) =>
                setEventData({ ...eventData, endDate: value })
              }
              required
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
                  event_name: e.currentTarget.value,
                })
              }
            />
            <Select
              label="Lặp lại"
              data={eventsConcurrence}
              placeholder="Lặp lại "
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
            <Button variant="default" onClick={() => setOpened(false)}>
              Hủy
            </Button>
            <Button color="brown" onClick={handleCreateEvent}>
              Tạo
            </Button>
          </Group>
        </Stack>
      </Modal>
      {selectedEvent && (
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title={<Title order={2}>{selectedEvent.event_name}</Title>}
          centered
          size="70%"
          padding="xl"
        >
          <Stack justify="lg">
            <Group>
              <Badge color="blue" size="lg" radius="md">
                📖 Mô tả
              </Badge>
              <Text size="md">{selectedEvent.event_description}</Text>
            </Group>
            <Divider />
            <Group justify="xs" align="column">
              <Text>
                📅 Ngày dương: <b>{selectedEvent.gregorian_event_date}</b>
              </Text>
              <Text>
                🌙 Ngày âm: <b>{selectedEvent.lunar_event_date}</b>
              </Text>
              <Text>🕒 {selectedEvent.time || "Chưa đặt giờ"}</Text>
              <Text>
                📍 Địa điểm: <b>{selectedEvent.location}</b>
              </Text>
              <Text>
                🔁 Lặp lại:{" "}
                <b>{convertRecurrence(selectedEvent.recurrence_rule)}</b>
              </Text>
            </Group>
            <Divider />
            <Title order={4}>Người tham gia</Title>
            <Stack justify="xs">
              {selectedEvent.eventParticipants.map((p: any) => (
                <Group key={p.participant_id} justify="sm">
                  <Badge color="teal" size="sm" radius="xl">
                    👤
                  </Badge>
                  <Text fw={700} c="dark">
                    {p.member?.firstName} {p.member?.middleName}{" "}
                    {p.member?.lastName}
                  </Text>
                  <Badge
                    color={p.role_in_event === "Host" ? "green" : "gray"}
                    size="sm"
                    radius="xl"
                  >
                    {p.role_in_event === "Host" ? "Chủ tiệc" : "Người tham gia"}
                  </Badge>
                  <Badge
                    color={convertStatus(p.rsvp_status).color}
                    size="sm"
                    radius="xl"
                  >
                    {convertStatus(p.rsvp_status).text}
                  </Badge>
                </Group>
              ))}
            </Stack>
            <Divider />
            <Title order={4}>Hình ảnh</Title>
            <SimpleGrid cols={3} spacing="md">
              {selectedEvent.media.map((m: any) => (
                <Image
                  key={m.media_id}
                  src={m.url}
                  alt={m.caption}
                  radius="lg"
                  style={{ width: "100%" }}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </Modal>
      )}
    </AppShell>
  );
}
