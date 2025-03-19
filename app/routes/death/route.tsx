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
  Center,
  Loader,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconCalendarPlus, IconUser } from "@tabler/icons-react";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { formatDate } from "~/infrastructure/utils/common";
import { jwtDecode } from "jwt-decode";
import { Constants } from "~/infrastructure/core/constants";

export const meta = () => [{ title: "Lịch giỗ các cụ" }];

const getMemberIdFromToken = () => {
  const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);

  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    console.log(decoded);
    return decoded.familyId; // 🛠️ Trích xuất memberId từ payload
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};

const MemorialSchedule = () => {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Lưu giá trị để gọi API
  const memberId = getMemberIdFromToken();

  const { data, isLoading, refetch } = useGetApi({
    endpoint: `members/family/${memberId}/search`,
    queryKey: ["members", searchQuery],
    queryParams: {
      page: 1,
      limit: 1000,
      isAlive: false,
      search: searchQuery,
    },
  });
  console.log("test: ", data);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      setSearchQuery(search);
      refetch();
    }
  };
  const calculateAgeAtDeath = (dateOfBirth: string, dateOfDeath: string) => {
    if (!dateOfBirth || !dateOfDeath) return "N/A"; // Nếu thiếu dữ liệu, trả về "N/A"

    const birthDate = new Date(dateOfBirth);
    const deathDate = new Date(dateOfDeath);

    let age = deathDate.getFullYear() - birthDate.getFullYear();

    return age;
  };

  return (
    <AppShell padding="lg" styles={{ main: { backgroundColor: "#f8f3e8" } }}>
      <Group justify="space-between" mb="xl">
        <Title
          order={1}
          size={32}
          fw={700}
          c="brown"
          ta="center"
          style={{
            fontFamily: "'Be Vietnam Pro', 'Roboto', sans-serif",
            letterSpacing: "1px",
          }}
        >
          🏮 Lịch giỗ các cụ 🏮
        </Title>

        <TextInput
          placeholder="Tìm kiếm lịch giỗ..."
          w={500}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </Group>

      {isLoading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <SimpleGrid cols={2} spacing="lg">
          {data.data.items.map((person: any) => (
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
                (e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0, 0, 0, 0.1)")
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
                    {person.firstName} {person.middleName} {person.lastName}
                  </Text>
                </Group>
                <Group>
                  <Text c="white" fw={700}>
                    Đời: {person.generation}
                  </Text>
                  <Text c="white" fw={700}>
                    Tuổi: Tuổi:{" "}
                    {calculateAgeAtDeath(
                      person.dateOfBirth,
                      person.dateOfDeath
                    )}{" "}
                    tuổi
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
                    {person.gender === "MALE" ? "Nam" : "Nữ"}
                  </Badge>
                </Group>
              </Group>

              <Stack mt="sm">
                <SimpleGrid cols={3} spacing="xl">
                  <Text size="sm">
                    <strong>Sinh ngày:</strong> {formatDate(person.dateOfBirth)}
                  </Text>
                  <Text size="sm">
                    <strong>Ngày mất:</strong> {formatDate(person.dateOfBirth)}
                  </Text>
                  <Text size="sm">
                    <strong>Hưởng dương:</strong> {person.age} tuổi
                  </Text>
                </SimpleGrid>
                <Text size="sm">
                  <strong>Mộ táng:</strong> {person.placeOfBirth}
                </Text>
                <Text size="sm">
                  <strong>Thờ cúng tại:</strong> {person.worship}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </AppShell>
  );
};

export default MemorialSchedule;
