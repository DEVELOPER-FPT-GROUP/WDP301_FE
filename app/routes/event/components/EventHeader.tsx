import { Button, Group, Title } from "@mantine/core";

export function EventHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <Group justify="space-between">
      <Title
        order={1}
        size={30}
        fw={700}
        c="brown"
        ta="center"
        mb="md"
        style={{
          fontFamily: "'Be Vietnam Pro', 'Roboto', sans-serif",
          letterSpacing: "1px",
        }}
      >
        Sự kiện
      </Title>
      <Button color="brown" radius="xl" size="md" onClick={onCreate}>
        + Tạo sự kiện
      </Button>
    </Group>
  );
}
