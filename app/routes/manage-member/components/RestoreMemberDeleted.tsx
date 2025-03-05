import { Modal, Button, Group, Text } from "@mantine/core";
import { useMemo } from "react";
import { usePutApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

interface MemberFormData {
  familyId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "male" | "female";
  dateOfBirth: string | null;
  placeOfBirth: string;
  isAlive: boolean;
  dateOfDeath: string | null;
  placeOfDeath: string | null;
  generation: number;
  shortSummary: string;
  isDeleted?: string;
}

const RestoreMemberModal = ({
  opened,
  onClose,
  memberData,
  refreshTable,
}: any) => {
  const filteredData: MemberFormData = useMemo(
    () => ({
      familyId: memberData?.familyId || "",
      firstName: memberData?.firstName || "",
      middleName: memberData?.middleName || "",
      lastName: memberData?.lastName || "",
      gender:
        memberData?.gender === "male" || memberData?.gender === "female"
          ? memberData.gender
          : "male",
      dateOfBirth: memberData?.dateOfBirth ?? null,
      placeOfBirth: memberData?.placeOfBirth || "",
      isAlive: memberData?.isAlive ?? true,
      dateOfDeath: memberData?.dateOfDeath ?? null,
      placeOfDeath: memberData?.placeOfDeath ?? "",
      generation: memberData?.generation ?? 1,
      shortSummary: memberData?.shortSummary || "",
      isDeleted: "false",
    }),
    [memberData]
  );

  const restoreMutation = usePutApi({
    endpoint: `/members/update/${memberData?.memberId || ""}`,
    options: { onSuccess: refreshTable },
  });

  const handleRestore = () => {
    restoreMutation.mutate(filteredData, {
      onSuccess: (data) => {
        console.log(data);
        notifySuccess({
          title: "Thành công",
          message: `Khôi phục ${fullName} thành công!`,
        });
        onClose();
      },
      onError: (err) => {
        console.log(err);
        notifyError({ title: "Lỗi", message: "Khôi phục thất bại!" });
      },
    });
  };
  const fullName = `${memberData?.firstName} ${memberData?.middleName} ${memberData?.lastName}`;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={700} c="brown">
          Khôi phục thành viên
        </Text>
      }
    >
      <Text>Bạn có chắc chắn muốn khôi phục "{fullName}" không?</Text>
      <Group justify="flex-end" mt={2}>
        <Button variant="default" onClick={onClose}>
          Hủy
        </Button>
        <Button color="red" onClick={handleRestore}>
          Khôi phục
        </Button>
      </Group>
    </Modal>
  );
};

export default RestoreMemberModal;
