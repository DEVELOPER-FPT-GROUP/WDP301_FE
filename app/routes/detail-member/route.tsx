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
} from "@mantine/core";
import {
  IconMapPin,
  IconCalendar,
  IconArrowLeft,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { useLocation, useNavigate } from "react-router";

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
    queryKey: ["member", memberId],
    endpoint: `/members/${memberId}`,
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

      <Card shadow="sm" padding="xl" radius="md" withBorder>
        {/* Layout mới: Ảnh lớn bên trái, thông tin bên phải */}
        <Group align="flex-start" gap={30} wrap="nowrap">
          {/* Ảnh lớn bên trái */}
          <Box style={{ flex: "0 0 auto" }}>
            <img
              src={
                member.gender === "male"
                  ? "/app/assets/image/male.png"
                  : "/app/assets/image/female.png"
              }
              alt={`Ảnh ${member.gender === "male" ? "nam" : "nữ"}`}
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                border: "2px solid #e9ecef",
                objectFit: "cover",
              }}
            />
          </Box>

          {/* Tất cả thông tin bên phải */}
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
                {member.generation}
              </Text>
            </div>

            {/* Mô tả ngắn */}
            <Text size="sm" mb="md">
              {member.shortSummary || "Không có thông tin tóm tắt"}
            </Text>

            {/* Thông tin chi tiết */}
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
    </div>
  );
}
