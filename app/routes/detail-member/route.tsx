import { useEffect, useState } from "react";
import {
  Card,
  Text,
  Title,
  Loader,
  Center,
  Group,
  Stack,
  Alert,
  Button,
  Box,
  Divider,
  Avatar,
  Paper,
} from "@mantine/core";
import {
  IconMapPin,
  IconCalendar,
  IconArrowLeft,
  IconAlertCircle,
  IconUsers,
  IconHeart,
  IconBabyCarriage,
} from "@tabler/icons-react";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { useLocation, useNavigate } from "react-router";

interface Parent {
  memberId: string;
  familyId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  dateOfDeath?: string | null;
  placeOfBirth: string;
  placeOfDeath?: string | null;
  isAlive: boolean;
  generation: number;
  shortSummary: string;
  gender: "male" | "female";
  isDeleted: boolean;
  media?: Media[];
}

interface Media {
  id: string;
  url: string;
}

interface Child {
  child: {
    memberId: string;
    familyId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    placeOfBirth: string;
    placeOfDeath?: string;
    isAlive: boolean;
    generation: number;
    shortSummary: string;
    gender: "male" | "female";
    isDeleted: boolean;
    media?: Media[];
  };
  birthOrder: number;
}

interface Spouse {
  spouse: {
    memberId: string;
    familyId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    placeOfBirth: string;
    placeOfDeath?: string;
    isAlive: boolean;
    generation: number;
    shortSummary: string;
    gender: "male" | "female";
    isDeleted: boolean;
    media?: Media[];
  };
  children: Child[];
}

interface MemberData {
  memberId: string;
  familyId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  dateOfDeath?: string | null;
  placeOfBirth: string;
  placeOfDeath?: string | null;
  isAlive: boolean;
  generation: number;
  shortSummary: string;
  gender: "male" | "female";
  isDeleted: boolean;
  media?: Media[];
  spouses: Spouse[];
  parent: {
    mother?: Parent;
    father?: Parent;
  };
}

export default function DetailMember() {
  const location = useLocation();
  const navigate = useNavigate();
  const { memberId } = location.state || {};
  const [member, setMember] = useState<MemberData | null>(null);

  // Xử lý khi không có memberId
  if (!memberId) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Không tìm thấy thành viên"
        color="red"
      >
        Không có thông tin ID thành viên được cung cấp.
      </Alert>
    );
  }

  const { data, isLoading, isError } = useGetApi({
    queryKey: ["member-details", memberId],
    endpoint: `/members/get-member-details/${memberId}`,
  });

  useEffect(() => {
    if (data?.data && !data.data.isDeleted) {
      console.log(data.data);
      setMember(data.data);
    }
  }, [data]);

  // Hàm format ngày tháng nhất quán
  const formatDate = (dateString: string) => {
    if (!dateString) return "Không có thông tin";

    const date = new Date(dateString);
    // Format: DD/MM/YYYY
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hàm kết hợp tên đầy đủ tránh khoảng trắng thừa
  const getFullName = (
    firstName: string,
    middleName: string,
    lastName: string
  ) => {
    return [firstName, middleName, lastName].filter(Boolean).join(" ");
  };

  // Hàm lấy ảnh đại diện (sử dụng ảnh đầu tiên nếu có, nếu không sử dụng ảnh mặc định)
  const getProfileImage = (person: any) => {
    if (person.media && person.media.length > 0) {
      return person.media[0].url;
    }
    return person.gender === "male"
      ? "/app/assets/image/male.png"
      : "/app/assets/image/female.png";
  };

  // Style for images based on alive status
  const getImageStyle = (isAlive: boolean) => {
    const baseStyle = {
      width: "160px",
      height: "160px",
      borderRadius: "50%",
      border: "2px solid #e9ecef",
      objectFit: "cover" as const,
    };

    if (!isAlive) {
      return {
        ...baseStyle,
        filter: "grayscale(70%) opacity(0.7)",
      };
    }

    return baseStyle;
  };

  // Style for avatar based on alive status
  const getAvatarStyle = (isAlive: boolean) => {
    if (!isAlive) {
      return {
        filter: "grayscale(70%) opacity(0.7)",
      };
    }
    return {};
  };

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  if (isLoading) {
    return (
      <Center style={{ height: "200px" }}>
        <Loader size="md" />
      </Center>
    );
  }

  if (isError || !member) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Lỗi" color="red">
        Không tìm thấy thông tin thành viên hoặc đã xảy ra lỗi khi tải dữ liệu.
      </Alert>
    );
  }

  return (
    <div>
      {/* Header với nút quay lại và tiêu đề */}
      <Group justify="space-between" mb={24}>
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleGoBack}
            color="gray"
            size="sm"
          >
            Quay lại
          </Button>
          <Title order={2}>Chi tiết thành viên</Title>
        </Group>
      </Group>

      {/* Thông tin cơ bản của thành viên */}
      <Card shadow="sm" padding="xl" radius="md" withBorder mb={20}>
        <Group align="flex-start" gap={30} wrap="nowrap">
          {/* Ảnh đại diện - with grayscale if not alive */}
          <Box style={{ flex: "0 0 auto" }}>
            <img
              src={getProfileImage(member)}
              alt={`Ảnh ${member.gender === "male" ? "nam" : "nữ"}`}
              style={getImageStyle(member.isAlive)}
            />
          </Box>

          {/* Thông tin cá nhân */}
          <Stack style={{ flex: "1 1 auto" }} gap="md">
            {/* Thông tin cơ bản */}
            <div>
              <Title order={3} mb="xs">
                {getFullName(
                  member.firstName,
                  member.middleName,
                  member.lastName
                )}
              </Title>
              <Text size="sm" c="dimmed" mb="lg">
                {member.gender === "male" ? "Nam" : "Nữ"} • Thế hệ{" "}
                {member.generation} • {member.isAlive ? "Còn sống" : "Đã mất"}
              </Text>
            </div>

            {/* Mô tả ngắn */}
            <Text size="sm" mb="md">
              {member.shortSummary || "Không có thông tin tóm tắt"}
            </Text>

            {/* Thông tin ngày sinh ngày mất */}
            <Group gap="lg" wrap="wrap" mb="xs">
              <Text fw={500} style={{ display: "flex", alignItems: "center" }}>
                <IconCalendar size={18} style={{ marginRight: 8 }} />
                Ngày sinh: {formatDate(member.dateOfBirth)}
              </Text>
              {member.dateOfDeath && (
                <Text
                  fw={500}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <IconCalendar size={18} style={{ marginRight: 8 }} />
                  Ngày mất: {formatDate(member.dateOfDeath)}
                </Text>
              )}
            </Group>

            {/* Thông tin nơi sinh nơi mất */}
            <Group gap="lg" wrap="wrap">
              <Text fw={500} style={{ display: "flex", alignItems: "center" }}>
                <IconMapPin size={18} style={{ marginRight: 8 }} />
                Nơi sinh: {member.placeOfBirth || "Không có thông tin"}
              </Text>
              {member.placeOfDeath && (
                <Text
                  fw={500}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <IconMapPin size={18} style={{ marginRight: 8 }} />
                  Nơi mất: {member.placeOfDeath}
                </Text>
              )}
            </Group>
          </Stack>
        </Group>
      </Card>

      {/* Thông tin về cha mẹ */}
      {(member.parent?.father || member.parent?.mother) && (
        <Card shadow="sm" padding="xl" radius="md" withBorder mb={20}>
          <Group mb="md" align="center">
            <IconUsers size={24} />
            <Title order={4}>Thông tin cha mẹ</Title>
          </Group>

          <Group gap="lg" wrap="wrap">
            {member.parent?.father && (
              <Paper withBorder p="md" radius="md" style={{ flex: "1" }}>
                <Group gap="md" mb={10}>
                  <Avatar
                    src={getProfileImage(member.parent.father)}
                    size="md"
                    radius="xl"
                    style={getAvatarStyle(member.parent.father.isAlive)}
                  />
                  <div>
                    <Text fw={500}>
                      Cha:{" "}
                      {getFullName(
                        member.parent.father.firstName,
                        member.parent.father.middleName,
                        member.parent.father.lastName
                      )}
                    </Text>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        Sinh ngày:{" "}
                        {formatDate(member.parent.father.dateOfBirth)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        • {member.parent.father.isAlive ? "Còn sống" : "Đã mất"}
                      </Text>
                    </Group>
                  </div>
                </Group>
              </Paper>
            )}

            {member.parent?.mother && (
              <Paper withBorder p="md" radius="md" style={{ flex: "1" }}>
                <Group gap="md" mb={10}>
                  <Avatar
                    src={getProfileImage(member.parent.mother)}
                    size="md"
                    radius="xl"
                    style={getAvatarStyle(member.parent.mother.isAlive)}
                  />
                  <div>
                    <Text fw={500}>
                      Mẹ:{" "}
                      {getFullName(
                        member.parent.mother.firstName,
                        member.parent.mother.middleName,
                        member.parent.mother.lastName
                      )}
                    </Text>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        Sinh ngày:{" "}
                        {formatDate(member.parent.mother.dateOfBirth)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        • {member.parent.mother.isAlive ? "Còn sống" : "Đã mất"}
                      </Text>
                    </Group>
                  </div>
                </Group>
              </Paper>
            )}
          </Group>
        </Card>
      )}

      {/* Thông tin vợ/chồng và con cái */}
      {member.spouses && member.spouses.length > 0 && (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          {member.spouses.map((spouseRelation, index) => (
            <div key={spouseRelation.spouse.memberId}>
              {/* Hiển thị thông tin vợ/chồng */}
              <Group mb="md" align="center">
                <IconHeart size={24} color="#FF6B6B" />
                <Title order={4}>
                  {member.gender === "male" ? "Vợ" : "Chồng"} {index + 1}
                </Title>
              </Group>

              <Paper withBorder p="md" radius="md" mb={20}>
                <Group align="center" gap="md">
                  <Avatar
                    src={getProfileImage(spouseRelation.spouse)}
                    size="md"
                    radius="xl"
                    style={getAvatarStyle(spouseRelation.spouse.isAlive)}
                  />
                  <div>
                    <Text fw={500}>
                      {getFullName(
                        spouseRelation.spouse.firstName,
                        spouseRelation.spouse.middleName,
                        spouseRelation.spouse.lastName
                      )}
                    </Text>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        Sinh ngày:{" "}
                        {formatDate(spouseRelation.spouse.dateOfBirth)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        •{" "}
                        {spouseRelation.spouse.isAlive ? "Còn sống" : "Đã mất"}
                      </Text>
                    </Group>
                  </div>
                </Group>
              </Paper>

              {/* Hiển thị thông tin các con */}
              {spouseRelation.children &&
                spouseRelation.children.length > 0 && (
                  <>
                    <Group mt={30} mb="md" align="center">
                      <IconBabyCarriage size={24} />
                      <Title order={4}>
                        Các con ({spouseRelation.children.length})
                      </Title>
                    </Group>

                    <Stack gap="md">
                      {spouseRelation.children.map((childInfo) => (
                        <Paper
                          key={childInfo.child.memberId}
                          withBorder
                          p="md"
                          radius="md"
                        >
                          <Group align="center" gap="md">
                            <Avatar
                              src={getProfileImage(childInfo.child)}
                              size="md"
                              radius="xl"
                              style={getAvatarStyle(childInfo.child.isAlive)}
                            />
                            <div>
                              <Group gap="xs">
                                <Text fw={500}>
                                  {getFullName(
                                    childInfo.child.firstName,
                                    childInfo.child.middleName,
                                    childInfo.child.lastName
                                  )}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  (Thứ {childInfo.birthOrder})
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <Text size="xs" c="dimmed">
                                  {childInfo.child.gender === "male"
                                    ? "Nam"
                                    : "Nữ"}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  • Sinh ngày:{" "}
                                  {formatDate(childInfo.child.dateOfBirth)}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  •{" "}
                                  {childInfo.child.isAlive
                                    ? "Còn sống"
                                    : "Đã mất"}
                                </Text>
                              </Group>
                            </div>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </>
                )}

              {/* Divider between spouses if there are more than one */}
              {index < member.spouses.length - 1 && <Divider my="xl" />}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
