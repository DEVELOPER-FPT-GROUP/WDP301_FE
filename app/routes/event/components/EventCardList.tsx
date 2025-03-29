import { ActionIcon, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";

export function EventCardList({
  title,
  events,
  onClick,
  onEdit,
  onDelete,
}: {
  title: string;
  events: any[];
  onClick: (event: any) => void;
  onEdit: (event: any) => void;
  onDelete: (event: any) => void;
}) {
  function formatTimeFromISO(isoString: string): string {
    if (!isoString) return "Chưa rõ giờ";
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return (
    <Card padding="md" radius="md" withBorder>
      <Title order={5} mb="xs">
        {title}
      </Title>
      {events.length > 0 ? (
        <Stack justify="md">
          {events.map((event: any, index) => (
            <Group
              key={index}
              justify="space-between"
              style={{
                padding: "12px 16px",
                backgroundColor: "#e7f3ff",
                borderRadius: "12px",
                transition: "0.3s",
                ":hover": { transform: "scale(1.02)" },
              }}
            >
              {/* Click chọn event */}
              <Group
                gap="sm"
                style={{ flex: 1 }}
                onClick={() => onClick(event)}
              >
                <Text c="dark" size="lg" fw={600}>
                  {event.event.eventName}
                </Text>
                <Text c="gray" size="sm" style={{ minWidth: 60 }}>
                  🕒{" "}
                  {event.event.startDate
                    ? formatTimeFromISO(event.event.startDate)
                    : "Chưa rõ giờ"}
                </Text>
              </Group>

              {/* Nút chỉnh sửa và xoá */}
              <Group gap="xs">
                {/* <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => onEdit(event)}
                >
                  <IconEdit size={18} />
                </ActionIcon> */}
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => onDelete(event)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text c="gray">Không có sự kiện nào</Text>
      )}
    </Card>
  );
}
