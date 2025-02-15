import {
  AppShell,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Modal,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useState } from "react";

export const meta = () => [{ title: "Lịch sử dòng họ" }];
const route = () => {
  const familyStories = [
    {
      title: "Ông tổ Nguyễn Văn A",
      description:
        "Người khai sinh ra dòng họ Nguyễn với nhiều câu chuyện lịch sử hào hùng.",
      image: "https://via.placeholder.com/400x200",
    },
    {
      title: "Bà Nguyễn Thị B",
      description: "Người đóng góp lớn trong việc bảo tồn văn hóa gia tộc.",
      image: "https://via.placeholder.com/400x200",
    },
    {
      title: "Bà Nguyễn Thị B",
      description: "Người đóng góp lớn trong việc bảo tồn văn hóa gia tộc.",
      image: "https://via.placeholder.com/400x200",
    },
  ];
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  return (
    <AppShell padding="lg" styles={{ main: { backgroundColor: "#f5f2dc" } }}>
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
        <Button
          color="brown"
          radius="xl"
          size="md"
          onClick={() => setAddModalOpened(true)}
        >
          + Thêm lịch sử
        </Button>
      </Group>
      <Grid gutter="lg">
        {familyStories.map((story, index) => (
          <Grid.Col key={index} span={4}>
            <Card
              shadow="sm"
              padding="lg"
              radius="xl"
              withBorder
              style={{ transition: "transform 0.2s", cursor: "pointer" }}
            >
              <Card.Section>
                <Image
                  src={story.image}
                  height={220}
                  alt={story.title}
                  radius="xl"
                />
              </Card.Section>
              <Text
                w={700}
                size="lg"
                mt="md"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {story.title}
              </Text>
              <Text mt="sm" color="gray" size="sm" lineClamp={3}>
                {story.description}
              </Text>
              <Group justify="right" mt="md">
                <Button
                  variant="filled"
                  color="brown"
                  radius="xl"
                  size="sm"
                  onClick={() => {
                    setSelectedStory(story);
                    setDetailModalOpened(true);
                  }}
                >
                  Xem chi tiết
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        title="Thêm câu chuyện"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        closeOnClickOutside={false}
      >
        <TextInput
          label="Tiêu đề câu chuyện"
          placeholder="Nhập tiêu đề"
          mb="sm"
        />
        <Textarea
          label="Nội dung câu chuyện"
          placeholder="Nhập nội dung"
          mb="sm"
        />
        <Group justify="right" mt="md">
          <Button color="red" onClick={() => setAddModalOpened(false)}>
            Đóng
          </Button>
          <Button color="brown">Thêm</Button>
        </Group>
      </Modal>

      <Modal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        title={selectedStory?.title || "Chi tiết câu chuyện"}
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        closeOnClickOutside={false}
      >
        {selectedStory && (
          <div>
            <Image src={selectedStory.image} height={200} radius="md" mb="md" />
            <Text size="sm" color="dimmed">
              {selectedStory.description}
            </Text>
          </div>
        )}
      </Modal>
    </AppShell>
  );
};

export default route;
