import { Modal, Box, Text } from "@mantine/core";

const ModalPerson = ({ opened, onClose, data }: any) => {
  if (!data) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Chi tiết thành viên"
      centered
    >
      <Box>
        <Text>
          <strong>Họ tên:</strong> {data.fullname || data.name}
        </Text>
        <Text>
          <strong>Ngày sinh:</strong> {data.birthDate || "Không rõ"}
        </Text>
        <Text>
          <strong>Giới tính:</strong> {data.gender || "Không rõ"}
        </Text>
      </Box>
    </Modal>
  );
};

export default ModalPerson;
