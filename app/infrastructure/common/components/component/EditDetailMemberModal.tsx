import {
  Modal,
  TextInput,
  Button,
  Group,
  Textarea,
  Switch,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm, yupResolver } from "@mantine/form";
import { useEffect, useMemo } from "react";
import * as Yup from "yup";
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

const memberSchema = Yup.object().shape({
  firstName: Yup.string().required("Họ là bắt buộc").min(2).max(50),
  middleName: Yup.string().required("Tên đệm là bắt buộc").min(2).max(50),
  lastName: Yup.string().required("Tên là bắt buộc").min(2).max(50),
  gender: Yup.string().oneOf(["male", "female"], "Giới tính không hợp lệ"),
  dateOfBirth: Yup.date().nullable(),
  placeOfBirth: Yup.string().when("isAlive", {
    is: true,
    then: (schema) => schema.required("Nơi sinh là bắt buộc"),
  }),
  dateOfDeath: Yup.date().nullable(),
  placeOfDeath: Yup.string().when("isAlive", {
    is: false,
    then: (schema) => schema.required("Nơi mất là bắt buộc"),
  }),
  shortSummary: Yup.string().max(500, "Tóm tắt không được quá 500 ký tự"),
});

interface EditDetailMemberModalProps {
  opened: boolean;
  onClose: () => void;
  refreshTable: () => void;
  memberData: any;
}

const formatDateToISOString = (date: Date | null): string | null => {
  return date ? date.toISOString().split("T")[0] : null;
};

const EditDetailMemberModal: React.FC<EditDetailMemberModalProps> = ({
  opened,
  onClose,
  refreshTable,
  memberData,
}) => {
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

  const form = useForm({
    initialValues: filteredData,
    validate: yupResolver(memberSchema),
  });

  useEffect(() => {
    if (memberData) {
      form.setValues(filteredData);
    }
  }, [memberData]);

  const editMemberApi = usePutApi({
    endpoint: `/members/update/${memberData?.memberId || ""}`,
    options: { onSuccess: refreshTable },
  });

  const fullName = `${memberData?.firstName} ${memberData?.middleName} ${memberData?.lastName}`;

  const handleSubmit = (values: MemberFormData) => {
    editMemberApi.mutate(values, {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: `Chỉnh sửa thành viên ${fullName} thành công!`,
        });
      },
      onError: (err) => {
        notifyError({
          title: "Lỗi",
          message: `Chỉnh sửa thành viên ${fullName} thất bại!`,
        });
      },
    });

    form.reset();
    onClose();
    refreshTable();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={700} c="brown">
          Chỉnh sửa thông tin
        </Text>
      }
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <TextInput label="Họ" {...form.getInputProps("firstName")} />
            <TextInput label="Tên đệm" {...form.getInputProps("middleName")} />
            <TextInput label="Tên" {...form.getInputProps("lastName")} />
          </div>
          <Switch
            color="brown"
            label="Còn sống"
            {...form.getInputProps("isAlive", { type: "checkbox" })}
          />
          {form.values.isAlive ? (
            <>
              <DatePickerInput
                label="Ngày sinh"
                value={
                  form.values.dateOfBirth
                    ? new Date(form.values.dateOfBirth)
                    : null
                }
                onChange={(date) =>
                  form.setFieldValue("dateOfBirth", formatDateToISOString(date))
                }
              />
              <TextInput
                label="Nơi sinh"
                {...form.getInputProps("placeOfBirth")}
              />
            </>
          ) : (
            <>
              <DatePickerInput
                label="Ngày mất"
                value={
                  form.values.dateOfDeath
                    ? new Date(form.values.dateOfDeath)
                    : null
                }
                onChange={(date) =>
                  form.setFieldValue("dateOfDeath", formatDateToISOString(date))
                }
              />
              <TextInput
                label="Nơi mất"
                {...form.getInputProps("placeOfDeath")}
              />
            </>
          )}
          <Textarea label="Tóm tắt" {...form.getInputProps("shortSummary")} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" color="brown">
              Lưu
            </Button>
          </Group>
        </div>
      </form>
    </Modal>
  );
};

export default EditDetailMemberModal;
