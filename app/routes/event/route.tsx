import {
  AppShell,
  Box,
  Button,
  Card,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { SolarDate, LunarDate } from "@nghiavuive/lunar_date_vi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";

export const meta = () => [{ title: "Sự kiện" }];

export default function EventPage() {
  const [value, setValue] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [opened, setOpened] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
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

  const handleDateClick = (info) => {
    const eventsOnDate = mockEvents.filter(
      (event) => event.start === info.dateStr
    );
    setSelectedEvents(eventsOnDate);
  };
  const mockEvents = [
    {
      title: "Họp nhóm dự án",
      start: "2025-02-10",
      description: "Thảo luận kế hoạch sprint.",
      color: "#FBBF24",
    },
    {
      title: "Tham gia hội thảo công nghệ",
      start: "2025-02-14",
      description: "Hội thảo AI và Machine Learning.",
      color: "#E76F51",
    },
    {
      title: "Ăn tối gia đình",
      start: "2025-02-14",
      description: "Ăn tối và tâm sự cùng gia đình.",
      color: "#4CAF50",
    },
  ];

  const [selectedEvent, setSelectedEvent] = useState(null);
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

        console.log(
          `Giờ: ${hours}, Địa Chi Giờ: ${earthlyBranches[hourIndex]}, Thiên Can Giờ: ${heavenlyStems[stemIndex]}`
        );

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
    console.log("Sự kiện:", { eventTitle, eventDescription });
    setOpened(false);
  };
  const getLunarDate = (date: Date) => {
    const solarDate = new SolarDate(date);
    const lunarDate = solarDate.toLunarDate();
    return `${lunarDate.get().day}/${lunarDate.get().month}`;
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
              events={[
                {
                  title: "Tết Nguyên Đán",
                  start: "2025-02-10",
                  color: "#FBBF24",
                },
                {
                  title: "Rằm tháng Giêng",
                  start: "2025-02-14",
                  color: "#FBBF24",
                },
                // Thêm các sự kiện khác nếu cần
              ]}
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
            📆 Sự kiện hôm nay
          </Title>
          {selectedEvents.length > 0 ? (
            <Stack justify="md">
              {selectedEvents.map((event, index) => (
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
                    {event.title}
                  </Text>
                  <Text c="gray" size="sm">
                    🕒 {event.time}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text c="gray">Không có sự kiện nào diễn ra hôm nay</Text>
          )}
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Title order={5} mb="xs">
            30 ngày tới
          </Title>
          <Text color="gray">
            Không có sự kiện nào diễn ra trong 30 ngày tới
          </Text>
        </Card>
      </Stack>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Tạo sự kiện mới"
        centered
      >
        <TextInput
          label="Tiêu đề sự kiện"
          placeholder="Nhập tiêu đề"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.currentTarget.value)}
        />

        <Textarea
          label="Mô tả sự kiện"
          placeholder="Nhập mô tả"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.currentTarget.value)}
          mt="md"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>
            Hủy
          </Button>
          <Button color="orange" onClick={handleCreateEvent}>
            Tạo
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={selectedEvent?.title}
        centered
      >
        <Text size="md" fw={500} mb="xs">
          ⏰ Thời gian: {selectedEvent?.time}
        </Text>
        <Text size="sm" color="gray">
          📄 Mô tả: {selectedEvent?.description}
        </Text>
      </Modal>
    </AppShell>
  );
}
