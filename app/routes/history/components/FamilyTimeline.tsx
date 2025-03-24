import { Badge, Card, Group, Text, Timeline } from "@mantine/core";
import { formatDate } from "~/infrastructure/utils/common";
// Import hàm format ngày

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
  stories: FamilyStory[];
  onSelectStory: (story: FamilyStory) => void;
}

const FamilyTimeline = ({ stories, onSelectStory }: Props) => {
  return (
    <Timeline active={stories.length - 1} bulletSize={24} lineWidth={4}>
      {stories.map((story, index) => (
        <Timeline.Item
          key={index}
          title={
            <Text size="lg" fw={600} c={"brown"}>
              {story.historicalRecordTitle}
            </Text>
          }
        >
          <Card
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
            onClick={() => onSelectStory(story)}
            style={{ cursor: "pointer" }}
          >
            <Badge color="brown" size="lg" mb="xs">
              📅 {formatDate(story.startDate)} - {formatDate(story.endDate)}
            </Badge>
            <Text size="md" mb="lg" c="dimmed">
              {story.historicalRecordSummary}
            </Text>
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default FamilyTimeline;
