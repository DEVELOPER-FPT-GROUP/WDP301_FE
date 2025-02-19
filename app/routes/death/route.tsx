import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  AppShell,
  Box,
} from "@mantine/core";
import { useState } from "react";
import { IconCalendarPlus, IconUser } from "@tabler/icons-react";

export const meta = () => [{ title: "Lịch giỗ các cụ" }];

const fakeData = [
  {
    id: 1,
    name: "Phạm Ngọc Bá",
    gender: "Nam",
    generation: 1,
    age: 70,
    spouse: "Trần Thị Hoa",
    children: "3 Con",
    birth: "10/10/1930",
    deathDate: "15/06/2000",
    tomb: "18 Võ Văn Linh, Nguyễn Tăng",
    temple: "Từ đường chính",
    caretaker: "Nguyễn Văn Sơn",
  },
  {
    id: 2,
    name: "Nguyễn Thị Lan",
    gender: "Nữ",
    generation: 2,
    age: 85,
    spouse: "Hoàng Văn Minh",
    children: "5 Con",
    birth: "05/05/1935",
    deathDate: "20/12/2020",
    tomb: "24 Lê Văn Lương, Quận 7",
    temple: "Nhánh phụ",
    caretaker: "Hoàng Văn Nam",
  },
  {
    id: 3,
    name: "Trần Văn Khánh",
    gender: "Nam",
    generation: 3,
    age: 92,
    spouse: "Võ Thị Hạnh",
    children: "4 Con",
    birth: "12/02/1928",
    deathDate: "01/09/2015",
    tomb: "32 Phan Chu Trinh, Đà Nẵng",
    temple: "Từ đường chi nhánh",
    caretaker: "Trần Hữu Lộc",
  },
  {
    id: 4,
    name: "Lê Thị Hồng",
    gender: "Nữ",
    generation: 2,
    age: 78,
    spouse: "Nguyễn Văn Quý",
    children: "3 Con",
    birth: "21/08/1943",
    deathDate: "10/07/2021",
    tomb: "Khu mộ gia đình Lê, Nam Định",
    temple: "Từ đường gia tộc",
    caretaker: "Lê Quang Định",
  },
];

const MemorialSchedule = () => {
  const [opened, setOpened] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const handleCreateEvent = () => {
    console.log("Event Created", eventTitle, eventDescription);
    setOpened(false);
  };

  return (
    <AppShell padding="lg" styles={{ main: { backgroundColor: "#f8f3e8" } }}>
      <Group justify="space-between" mb="xl">
        <Title
          order={1}
          size={32}
          fw={900}
          c="brown"
          ta="center"
          style={{ fontFamily: "'Pacifico', cursive", letterSpacing: "1px" }}
        >
          🏮 Lịch giỗ các cụ 🏮
        </Title>
        <Button
          leftSection={<IconCalendarPlus size={20} />}
          color="brown"
          radius="xl"
          size="md"
          onClick={() => setOpened(true)}
        >
          Thêm ngày giỗ
        </Button>
      </Group>

      <SimpleGrid cols={2} spacing="lg">
        {fakeData.map((person) => (
          <Card
            key={person.id}
            shadow="md"
            padding="lg"
            radius="md"
            withBorder
            style={{
              transition: "0.3s",
              cursor: "pointer",
              backgroundColor: "#fff9f2",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(0, 0, 0, 0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)")
            }
          >
            <Group
              justify="space-between"
              style={{
                backgroundColor: "#a94442",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <Group>
                <Avatar color="white" radius="xl">
                  <IconUser size={24} />
                </Avatar>
                <Text fw={700} c="white">
                  {person.name}
                </Text>
              </Group>
              <Group>
                <Text c="white" fw={700}>
                  Đời: {person.generation}
                </Text>
                <Text c="white" fw={700}>
                  Tuổi: {person.age}
                </Text>
                {person.spouse && (
                  <Text c="white" fw={700}>
                    {person.spouse}
                  </Text>
                )}
                {person.children && (
                  <Text c="white" fw={700}>
                    {person.children}
                  </Text>
                )}
                <Badge color="white" variant="outline">
                  {person.gender}
                </Badge>
              </Group>
            </Group>

            <Stack mt="sm">
              <SimpleGrid cols={3} spacing="xl">
                <Text size="sm">
                  <strong>Sinh ngày:</strong> {person.birth}
                </Text>
                <Text size="sm">
                  <strong>Ngày mất:</strong> {person.deathDate}
                </Text>
                <Text size="sm">
                  <strong>Hưởng dương:</strong> {person.age} tuổi
                </Text>
              </SimpleGrid>
              <Text size="sm">
                <strong>Mộ táng:</strong> {person.tomb}
              </Text>
              <Text size="sm">
                <strong>Thờ cúng tại:</strong> {person.temple}
              </Text>
              <Text size="sm">
                <strong>Người phụ trách:</strong> {person.caretaker}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Tạo ngày giỗ mới"
        centered
        size="md"
      >
        <TextInput
          label="Tiêu đề sự kiện"
          placeholder="Nhập tiêu đề"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Mô tả sự kiện"
          placeholder="Nhập mô tả"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.currentTarget.value)}
          mt="md"
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>
            Hủy
          </Button>
          <Button color="brown" onClick={handleCreateEvent}>
            Tạo sự kiện
          </Button>
        </Group>
      </Modal>
    </AppShell>
  );
};

export default MemorialSchedule;
