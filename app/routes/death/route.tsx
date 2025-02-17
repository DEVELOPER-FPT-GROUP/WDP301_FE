export const meta = () => [{ title: "Lịch giỗ các cụ" }];

import {
  Container,
  Title,
  Card,
  Text,
  Avatar,
  Group,
  AppShell,
  Button,
  Modal,
  TextInput,
  Textarea,
  SimpleGrid,
} from "@mantine/core";
import { useState } from "react";

const fakeData = [
  {
    id: 1,
    name: "Phạm Ngọc Bá",
    gender: "Nam",
    generation: 1,
    age: 99,
    spouse: "1 Vợ",
    children: "2 Con",
    deathDate: "10/10",
    tomb: "18 Võ Văn Linh, Nguyễn Tăng",
    temple: "Từ đường chính",
    caretaker: "Nguyễn Văn Sơn",
  },
  {
    id: 2,
    name: "Phạm Thiên Bắc",
    gender: "Nữ",
    generation: 1,
    age: 0,
    spouse: "",
    children: "2 Con",
    deathDate: "",
    tomb: "",
    temple: "",
    caretaker: "",
  },
  {
    id: 3,
    name: "Phạm Xuân Bằng",
    gender: "Nữ",
    generation: 2,
    age: 0,
    spouse: "1 Chồng",
    children: "4 Con",
    deathDate: "2/2/3",
    tomb: "",
    temple: "",
    caretaker: "",
  },
  {
    id: 4,
    name: "Võ La Đình Biên",
    gender: "Nam",
    generation: 2,
    age: 0,
    spouse: "",
    children: "4 Con",
    deathDate: "12/10",
    tomb: "",
    temple: "",
    caretaker: "",
  },
];

const route = () => {
  const [opened, setOpened] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const handleCreateEvent = () => {
    console.log("Event Created", eventTitle, eventDescription);
    setOpened(false);
  };

  return (
    <AppShell padding="lg" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
      <Group justify="space-between">
        <Title
          order={1}
          size={30}
          fw={900}
          c="brown"
          ta="center"
          mb="md"
          style={{ fontFamily: "'Pacifico', cursive", letterSpacing: "1px" }}
        >
          Lịch giỗ các cụ
        </Title>
        <Button
          color="brown"
          radius="xl"
          size="md"
          onClick={() => setOpened(true)}
        >
          + Tạo ngày giỗ
        </Button>
      </Group>
      <SimpleGrid cols={2} spacing="lg">
        {fakeData.map((person) => (
          <Card shadow="sm" p="md" mb="sm" key={person.id} withBorder>
            <Group
              justify="apart"
              style={{
                backgroundColor: "#E65100",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <Group>
                <Avatar radius="xl" />
                <Text fw={700} c="white">
                  {person.name}
                </Text>
              </Group>
              <Text c="white">GT: {person.gender}</Text>
              <Text c="white">Đời: {person.generation}</Text>
              <Text c="white">Tuổi: {person.age}</Text>
              {person.spouse && <Text c="white">{person.spouse}</Text>}
              {person.children && <Text c="white">{person.children}</Text>}
            </Group>
            <Text mt="sm">Ngày mất: {person.deathDate}</Text>
            <Text>Ngày giỗ: {person.deathDate}</Text>
            <Text>Mộ táng: {person.tomb}</Text>
            <Text>Thờ cúng tại: {person.temple}</Text>
            <Text>Người phụ trách: {person.caretaker}</Text>
          </Card>
        ))}
      </SimpleGrid>
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
    </AppShell>
  );
};

export default route;
