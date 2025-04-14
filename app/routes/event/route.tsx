import {
  AppShell,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { SolarDate } from "@nghiavuive/lunar_date_vi";
import { DateClickArg } from "@fullcalendar/interaction";
import { EventHeader } from "./components/EventHeader";
import { LunarCard } from "./components/LunarCard";
import { EventCalendar } from "./components/EventCalendar";
import { EventCardList } from "./components/EventCardList";
import { EventCreateModal } from "./components/EventCreateModal";
import { EventDetailModal } from "./components/EventDetailModal";
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";
import {
  useDeleteApi,
  useGetApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import { EventDeleteModal } from "./components/EventDeleteModal";

export const meta = () => [{ title: "Sự kiện" }];
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
export default function EventPage() {
  const [opened, setOpened] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState([]);
  interface Event {
    eventId: string;
    eventName: string;
    startDate: string;
    // Add other properties as needed
  }

  const [selectedEvent, setSelectedEvent] = useState<{ event: Event } | null>(
    null
  );
  const [modalOpened, setModalOpened] = useState(false);
  const [dateTitle, setDateTitle] = useState("hôm nay");
  const userName = getUserNameFromToken();

  const { data, isLoading, isFetching, refetch } = useGetApi({
    queryKey: ["events", userName],
    endpoint: `events/created-by/${userName}`,
  });

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
      const formatTime = (t: number) => t.toString().padStart(2, "0");

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

  const getLunarDate = (date: Date) => {
    const solarDate = new SolarDate(date);
    const lunarDate = solarDate.toLunarDate();
    return `${lunarDate.get().day}/${lunarDate.get().month}`;
  };
  const formatDateLocal = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (info: DateClickArg) => {
    const today = new Date();
    const todayStr = formatDateLocal(today.toISOString());

    const selectedDate = info.dateStr; // luôn là yyyy-MM-dd

    setDateTitle(selectedDate === todayStr ? "hôm nay" : selectedDate);

    const eventsOnDate = data.data.filter(
      (e: { event: { startDate: string } }) => {
        const eventDate: string = formatDateLocal(e.event.startDate);
        return eventDate === selectedDate;
      }
    );

    setSelectedEvents(eventsOnDate);
  };
  const [openedModalDelete, setOpenedModalDelete] = useState(false);
  if (isLoading || isFetching) {
    return (
      <AppShell padding="lg" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
        <Stack align="center" justify="center" h="100%">
          <Loader size="xl" color="brown" />
          <p style={{ color: "#666", marginTop: 12 }}>
            Đang tải dữ liệu sự kiện...
          </p>
        </Stack>
      </AppShell>
    );
  }

  return (
    <AppShell padding="lg" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Stack>
        <EventHeader onCreate={() => setOpened(true)} />
        <LunarCard
          lunarInfo={lunarInfo}
          onClick={() => setShowCalendar(!showCalendar)}
        />
        {showCalendar && (
          <EventCalendar
            data={data.data}
            getLunarDate={getLunarDate}
            onDateClick={handleDateClick}
          />
        )}
        <EventCardList
          title={`📆 Sự kiện ${dateTitle}`}
          events={selectedEvents}
          onClick={(event) => {
            setSelectedEvent(event);
            setModalOpened(true);
          }}
          onEdit={(event) => {
            console.log("Chỉnh sửa", event);
            // TODO: mở modal cập nhật
          }}
          onDelete={(event) => {
            setSelectedEvent(event);
            setOpenedModalDelete(true);
          }}
        />
        <EventCardList
          title="📅 30 ngày tới"
          events={data.data}
          onClick={(event) => {
            setSelectedEvent(event);
            setModalOpened(true);
          }}
          onEdit={(event) => {
            console.log("Chỉnh sửa", event);
            // TODO: mở modal cập nhật
          }}
          onDelete={(event) => {
            setSelectedEvent(event);
            setOpenedModalDelete(true);
          }}
        />
        <EventCreateModal
          opened={opened}
          onClose={() => setOpened(false)}
          onSuccess={() => {
            refetch(); // Gọi lại API sau khi tạo thành công
          }}
        />
        <EventDeleteModal
          opened={openedModalDelete}
          onClose={() => setOpenedModalDelete(false)}
          eventId={selectedEvent?.event?.eventId || ""}
          eventName={selectedEvent?.event?.eventName || ""}
          onDeleted={() => {
            refetch();
          }}
        />

        {selectedEvent && (
          <EventDetailModal
            opened={modalOpened}
            onClose={() => setModalOpened(false)}
            event={selectedEvent}
          />
        )}
      </Stack>
    </AppShell>
  );
}
