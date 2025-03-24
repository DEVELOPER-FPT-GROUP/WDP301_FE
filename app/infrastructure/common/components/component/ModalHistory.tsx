import {
  Modal,
  Text,
  Stack,
  Title,
  Group,
  Badge,
  Divider,
  SimpleGrid,
  Image,
  Button,
} from "@mantine/core";
import { formatDate } from "~/infrastructure/utils/common";

const ModalHistory = ({ opened, onClose, data }: any) => {
  if (!data) return null;
  console.log(data);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={700} c="brown">
          📖 Chi tiết lịch sử
        </Text>
      }
      centered
      size="60%"
    >
      <Stack justify="md">
        <Title size={30} fw={700} order={3} ta="center">
          {data.historicalRecordTitle}
        </Title>

        <Group justify="center">
          <Badge color="brown" size="lg">
            📅 {formatDate(data.startDate)} - {formatDate(data.endDate)}
          </Badge>
        </Group>

        <Divider />

        <Text fw={600} size="lg" c="dimmed">
          📝 Tóm tắt:
        </Text>
        <Text size="md">{data.historicalRecordSummary}</Text>

        <Text fw={600} size="lg" c="dimmed">
          📜 Chi tiết:
        </Text>
        <Text size="md">{data.historicalRecordDetails}</Text>

        <Divider />

        {data.base64Images && data.base64Images?.length > 0 && (
          <>
            <Text fw={600} size="lg" c="dimmed">
              🖼 Hình ảnh:
            </Text>
            <SimpleGrid cols={3} spacing="md">
              {data.base64Images.map((img: any, index: number) => {
                console.log(img);
                return (
                  <Image
                    key={index}
                    src={img.url}
                    alt={`Ảnh ${index + 1}`}
                    radius="md"
                    style={{ objectFit: "cover", width: "100%" }}
                  />
                );
              })}
            </SimpleGrid>
          </>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Đóng
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalHistory;
