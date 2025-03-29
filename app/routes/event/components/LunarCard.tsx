import { Box, Card, Group, Text, Title } from "@mantine/core";

export function LunarCard({
  lunarInfo,
  onClick,
}: {
  lunarInfo: any;
  onClick: () => void;
}) {
  const labels = ["Giờ", "Ngày", "Tháng", "Năm"];
  const colors = ["orange", "blue", "red", "green"];
  const displays = [
    lunarInfo.hourDisplay,
    lunarInfo.dayDisplay,
    lunarInfo.monthDisplay,
    lunarInfo.yearDisplay,
  ];
  const labelsText = [
    lunarInfo.hour,
    lunarInfo.day,
    lunarInfo.month,
    lunarInfo.year,
  ];

  return (
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
      onClick={onClick}
    >
      <Group justify="space-around">
        {labels.map((label, i) => (
          <Box key={label} style={{ textAlign: "center" }}>
            <Title order={4}>{label}</Title>
            <Text size="xl" c={colors[i]} fw={800}>
              {displays[i]}
            </Text>
            <Text>{labelsText[i]}</Text>
          </Box>
        ))}
      </Group>
    </Card>
  );
}
