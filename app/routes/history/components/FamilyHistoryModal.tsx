import {
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { formatDate } from "~/infrastructure/utils/common";

interface FamilyStory {
  historicalRecordId?: string;
  familyId?: string;
  historicalRecordTitle: string;
  historicalRecordSummary: string;
  historicalRecordDetails: string;
  startDate: string;
  endDate: string;
  base64Images?: { url: string }[];
}

interface Props {
  story: FamilyStory | null;
  opened: boolean;
  onClose: () => void;
  loading: boolean;
}

const FamilyHistoryModal = ({ story, opened, onClose, loading }: Props) => {
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
      {loading ? (
        <Center>
          <Loader color="blue" size="lg" />
        </Center>
      ) : (
        story && (
          <Stack justify="md">
            <Title size={30} fw={700} order={3} ta="center">
              {story.historicalRecordTitle}
            </Title>

            <Group justify="center">
              <Badge color="brown" size="lg">
                📅 {formatDate(story.startDate)} - {formatDate(story.endDate)}
              </Badge>
            </Group>

            <Divider />

            <Text fw={600} size="lg" c="dimmed">
              📝 Tóm tắt:
            </Text>
            <Text size="md">{story.historicalRecordSummary}</Text>

            <Text fw={600} size="lg" c="dimmed">
              📜 Chi tiết:
            </Text>
            <Text size="md">{story.historicalRecordDetails}</Text>

            <Divider />

            {story.base64Images && story.base64Images?.length > 0 && (
              <>
                <Text fw={600} size="lg" c="dimmed">
                  🖼 Hình ảnh:
                </Text>
                <SimpleGrid cols={3} spacing="md">
                  {story.base64Images.map((img, index) => (
                    <Image
                      key={index}
                      src={img.url}
                      alt={`Ảnh ${index + 1}`}
                      radius="md"
                      style={{ objectFit: "cover", width: "100%" }}
                    />
                  ))}
                </SimpleGrid>
              </>
            )}

            <Group justify="flex-end">
              <Button variant="default" onClick={onClose}>
                Đóng
              </Button>
            </Group>
          </Stack>
        )
      )}
    </Modal>
  );
};

export default FamilyHistoryModal;
