import {
  Modal,
  Box,
  Text,
  Flex,
  Avatar,
  Paper,
  Stack,
  Divider,
  Group,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconUser,
  IconHeart,
  IconBabyCarriage,
  IconGenderFemale,
  IconGenderMale,
  IconCalendar,
  IconMapPin,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useGetApi } from "../../api/hooks/requestCommonHooks";

dayjs.locale("vi");

const ModalDeath = ({ opened, onClose, data }: any) => {
  if (!data) return null;

  const { data: dataPerson } = useGetApi({
    queryKey: ["member", data.memberId],
    endpoint: "members/get-member-details/:id",
    urlParams: { id: data.memberId },
  });

  const person = dataPerson?.data;
  console.log(person);

  if (!person) return null;

  const fullName = `${person.firstName || ""} ${person.middleName || ""} ${
    person.lastName || ""
  }`.trim();
  const birth = person.dateOfBirth
    ? dayjs(person.dateOfBirth).format("DD/MM/YYYY")
    : "Không rõ";
  const death = person.dateOfDeath
    ? dayjs(person.dateOfDeath).format("DD/MM/YYYY")
    : "Không rõ";
  const age =
    person.dateOfBirth && person.dateOfDeath
      ? dayjs(person.dateOfDeath).diff(dayjs(person.dateOfBirth), "year") +
        " tuổi"
      : "Không rõ";
  const genderIcon =
    person.gender === "female" ? (
      <IconGenderFemale size={16} />
    ) : (
      <IconGenderMale size={16} />
    );
  const genderLabel = person.gender === "female" ? "Nữ" : "Nam";

  const generation = person.generation ?? "Không rõ";
  const birthPlace = person.placeOfBirth || "Không có thông tin";
  const deathPlace = person.placeOfDeath || "Không có thông tin";
  const summary = person.shortSummary || "Không có thông tin tóm tắt";
  const spouses = person.spouses || [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title size="xl" fw={700} c="brown">
          Chi tiết ngày giỗ
        </Title>
      }
      centered
      size="lg"
    >
      <Stack gap="lg">
        {/* 🧑 Thông tin chính */}
        <Paper withBorder p="md" radius="md">
          <Flex gap="md" align="center">
            <Avatar size={100} radius="xl" color="gray">
              <IconUser size={50} />
            </Avatar>
            <Stack gap={4} style={{ flex: 1 }}>
              <Text fz="lg" fw={700}>
                {fullName}
              </Text>
              <Group gap="xs" fz="sm" c="dimmed">
                <Text>{genderLabel}</Text>
                <Text>• Thế hệ {generation}</Text>
                <Text>• {person.isAlive ? "Còn sống" : "Đã mất"}</Text>
                <Text>• Hưởng dương: {age}</Text>
              </Group>
              <Text fz="sm">{summary}</Text>
              <Group gap="sm" mt="xs">
                <Group gap={4}>
                  <ThemeIcon variant="light" size="md">
                    <IconCalendar size={14} />
                  </ThemeIcon>
                  <Text fz="md">Ngày sinh: {birth}</Text>
                </Group>
                <Group gap={4}>
                  <ThemeIcon variant="light" size="md">
                    <IconMapPin size={14} />
                  </ThemeIcon>
                  <Text fz="md">Nơi sinh: {birthPlace}</Text>
                </Group>
              </Group>
              <Group gap="md" mt="xs">
                <Group gap={4}>
                  <ThemeIcon variant="light" size="md">
                    <IconCalendar size={14} />
                  </ThemeIcon>
                  <Text fz="md">Ngày mất: {death}</Text>
                </Group>
                <Group gap={4}>
                  <ThemeIcon variant="light" size="md">
                    <IconMapPin size={14} />
                  </ThemeIcon>
                  <Text fz="md">Nơi mất: {deathPlace}</Text>
                </Group>
              </Group>
            </Stack>
          </Flex>
        </Paper>

        {/* ❤️ Vợ / Chồng */}
        {spouses.map((spouseGroup: any, index: number) => {
          const spouse = spouseGroup.spouse;
          const children = spouseGroup.children || [];
          const spouseFullName = `${spouse.firstName || ""} ${
            spouse.middleName || ""
          } ${spouse.lastName || ""}`.trim();

          return (
            <Paper withBorder p="md" radius="md" key={index}>
              <Group mb="xs">
                <IconHeart size={16} color="red" />
                <Text fw={600}>Vợ {index + 1}</Text>
              </Group>
              <Flex align="center" gap="sm">
                <Avatar size="md" src={spouse.media?.[0]?.url}>
                  <IconUser size={18} />
                </Avatar>
                <Box>
                  <Text fw={600}>{spouseFullName}</Text>
                  <Text fz="xs" c="dimmed">
                    Sinh ngày:{" "}
                    {spouse.dateOfBirth
                      ? dayjs(spouse.dateOfBirth).format("DD/MM/YYYY")
                      : "Không rõ"}{" "}
                    • {spouse.isAlive ? "Còn sống" : "Đã mất"}
                  </Text>
                </Box>
              </Flex>

              {/* 👶 Con cái */}
              {children.length > 0 && (
                <>
                  <Group mt="md" mb="xs">
                    <IconBabyCarriage size={16} />
                    <Text fw={600}>Các con ({children.length})</Text>
                  </Group>
                  <Stack>
                    {children.map((childItem: any, idx: number) => {
                      const child = childItem.child;
                      const childName = `${child.firstName || ""} ${
                        child.middleName || ""
                      } ${child.lastName || ""}`;
                      return (
                        <Paper key={idx} withBorder p="sm" radius="sm">
                          <Flex align="center" gap="sm">
                            <Avatar
                              size="sm"
                              color={child.gender === "male" ? "blue" : "pink"}
                            >
                              <IconUser size={14} />
                            </Avatar>
                            <Box>
                              <Text fz="sm" fw={500}>
                                {childName}{" "}
                                <Text span c="dimmed" fz="xs">
                                  (Thứ {childItem.birthOrder})
                                </Text>
                              </Text>
                              <Group fz="xs" gap="xs" c="dimmed">
                                <Text>
                                  {child.gender === "male" ? "Nam" : "Nữ"}
                                </Text>
                                <Text>
                                  • Sinh ngày:{" "}
                                  {dayjs(child.dateOfBirth).format(
                                    "DD/MM/YYYY"
                                  )}
                                </Text>
                                <Text>
                                  • {child.isAlive ? "Còn sống" : "Đã mất"}
                                </Text>
                              </Group>
                            </Box>
                          </Flex>
                        </Paper>
                      );
                    })}
                  </Stack>
                </>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Modal>
  );
};

export default ModalDeath;
