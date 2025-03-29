import {
  Badge,
  Button,
  Divider,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { SolarDate } from "@nghiavuive/lunar_date_vi";
export function EventDetailModal({ event, opened, onClose }: any) {
  function formatTimeFromISO(isoString: string): string {
    if (!isoString) return "Chưa rõ giờ";
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  function formatLunarDate(isoDate: string) {
    const solar = new SolarDate(new Date(isoDate));
    const lunar = solar.toLunarDate();
    const lunarObj = lunar.get();

    return {
      solarDate: `${solar.get().day}/${solar.get().month}/${solar.get().year}`,
      lunarDate: `${lunarObj.day}/${lunarObj.month}/${lunarObj.year}`,
      lunarDayName: `${lunar.getDayName()}`, // e.g. "Ngày Quý Mão"
      lunarMonthName: `${lunar.getMonthName()}`, // e.g. "Tháng Hai"
      lunarYearName: `${lunar.getYearName()}`, // e.g. "Năm Giáp Thìn"
    };
  }
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={2}>{event.event.eventName}</Title>}
      size="70%"
      centered
      padding="xl"
    >
      <Stack>
        <Group>
          <Badge color="blue">📖 Mô tả</Badge>
          <Text>{event.event.eventDescription}</Text>
        </Group>
        <Divider />
        <Group>
          <Text>
            📅 Ngày dương:{" "}
            <b>{formatLunarDate(event.event.startDate).solarDate}</b>
          </Text>
          <Text>
            🌙 Ngày âm:{" "}
            <b>{formatLunarDate(event.event.startDate).lunarDate}</b>
          </Text>
          <Text>
            {" "}
            🕒{" "}
            {event.event.startDate
              ? formatTimeFromISO(event.event.startDate)
              : "Chưa rõ giờ"}
          </Text>
          <Text>
            📍 Địa điểm: <b>{event.event.location}</b>
          </Text>
        </Group>
        <Divider />
        <Title order={4}>Hình ảnh</Title>
        <SimpleGrid cols={3} spacing="md">
          {event.event.media.map((m: any) => (
            <Image key={m.media_id} src={m.url} alt={m.caption} radius="lg" />
          ))}
        </SimpleGrid>
        <Group justify="right" mt="md">
          <Button variant="default" onClick={onClose}>
            Đóng
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
