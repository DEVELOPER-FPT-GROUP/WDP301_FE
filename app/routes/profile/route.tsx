import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Modal,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useState } from "react";
import {
  useGetApi,
  usePutApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { Constants } from "~/infrastructure/core/constants";
import { notifySuccess } from "~/infrastructure/utils/notification/notification";
import { getDataFromToken } from "~/infrastructure/utils/common";

dayjs.locale("vi");

export const meta = () => [{ title: "Tài khoản" }];

const formatName = (person: any) => {
  if (!person) return "Không rõ";
  return `${person.firstName || ""} ${person.middleName || ""} ${
    person.lastName || ""
  }`.trim();
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <Flex gap="sm">
    <Text fw={600} w={130}>
      {label}:
    </Text>
    <Text>{value}</Text>
  </Flex>
);

const Profile = () => {
  const token = getDataFromToken();
  const memberId = token?.memberId;

  const { data } = useGetApi({
    queryKey: ["member", memberId],
    endpoint: "members/get-member-details/:id",
    urlParams: { id: memberId },
  });

  const user = data?.data;

  const [modalOpened, setModalOpened] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const { mutate: changePasswordApi } = usePutApi({
    endpoint: `accounts/change-password/${user?.memberId}`,
  });

  const handleChangePassword = () => {
    let valid = true;

    setOldPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    if (!oldPassword) {
      setOldPasswordError("Vui lòng nhập mật khẩu cũ");
      valid = false;
    }

    if (!newPassword) {
      setNewPasswordError("Vui lòng nhập mật khẩu mới");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Vui lòng nhập lại mật khẩu");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      valid = false;
    }

    if (!valid) return;

    changePasswordApi(
      {
        oldPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          notifySuccess({
            title: "Thành công",
            message: "Đổi mật khẩu thành công!",
          });
          setModalOpened(false);
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
          setOldPasswordError(msg);
        },
      }
    );
  };

  if (!user) return null;

  const fullName = formatName(user);
  const gender = user.gender === "male" ? "Nam" : "Nữ";
  const status = user.isAlive ? "Còn sống" : "Đã mất";
  const generation = user.generation ?? "Không rõ";
  const dob = user.dateOfBirth
    ? dayjs(user.dateOfBirth).format("DD/MM/YYYY")
    : "Không rõ";
  const pob = user.placeOfBirth || "Không rõ";

  const father = user.parent?.father;
  const mother = user.parent?.mother;

  const formatParent = (p: any) => {
    if (!p) return "Không rõ";
    return `${formatName(p)} (${p.gender === "male" ? "Cha" : "Mẹ"} - ${
      p.isAlive ? "Còn sống" : "Đã mất"
    })`;
  };

  return (
    <>
      <Paper withBorder shadow="md" radius="md" p="xl" mt="lg">
        <Flex align="center" gap="xl" mb="lg">
          <Avatar size={100} radius="xl" color="blue" variant="filled">
            <IconUser size={50} />
          </Avatar>
          <Box>
            <Title order={3}>{fullName}</Title>
            <Group mt={4}>
              <Badge color="pink">{gender}</Badge>
              <Text color="dimmed">• Đời: {generation}</Text>
              <Text color="dimmed">• {status}</Text>
            </Group>
          </Box>
        </Flex>

        <Divider mb="lg" />

        <Stack justify="xs">
          <InfoItem label="🎂 Ngày sinh" value={dob} />
          <InfoItem label="📍 Nơi sinh" value={pob} />
          <InfoItem label="👨 Cha" value={formatParent(father)} />
          <InfoItem label="👩 Mẹ" value={formatParent(mother)} />
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={() => setModalOpened(true)}>
            Đổi mật khẩu
          </Button>
        </Group>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Đổi mật khẩu"
        centered
        size="sm"
      >
        <Stack>
          <PasswordInput
            label="Mật khẩu cũ"
            placeholder="Nhập mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.currentTarget.value)}
            error={oldPasswordError}
            required
          />
          <PasswordInput
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            error={newPasswordError}
            required
          />
          <PasswordInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            error={confirmPasswordError}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button onClick={handleChangePassword}>Xác nhận</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default Profile;
