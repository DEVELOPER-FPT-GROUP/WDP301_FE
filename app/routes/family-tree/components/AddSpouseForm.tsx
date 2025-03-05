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
import * as Yup from "yup";

// Validation schema
const spouseSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("Họ là bắt buộc")
    .min(2, "Họ phải có ít nhất 2 ký tự")
    .max(50, "Họ không được quá 50 ký tự"),
  middleName: Yup.string()
    .required("Tên đệm là bắt buộc")
    .min(2, "Tên đệm phải có ít nhất 2 ký tự")
    .max(50, "Tên đệm không được quá 50 ký tự"),
  lastName: Yup.string()
    .required("Tên là bắt buộc")
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(50, "Tên không được quá 50 ký tự"),
  dateOfBirth: Yup.date().required("Ngày sinh là bắt buộc"),
  isAlive: Yup.boolean(),
  dateOfDeath: Yup.date()
    .nullable()
    .when("isAlive", {
      is: false,
      then: (schema) => schema.required("Ngày mất là bắt buộc khi đã qua đời"),
    }),
  placeOfBirth: Yup.string()
    .required("Nơi sinh là bắt buộc")
    .min(2, "Nơi sinh phải có ít nhất 2 ký tự"),
  placeOfDeath: Yup.string()
    .nullable()
    .when("isAlive", {
      is: false,
      then: (schema) => schema.required("Nơi mất là bắt buộc khi đã qua đời"),
    }),
  shortSummary: Yup.string().max(500, "Tóm tắt không được quá 500 ký tự"),
});

export interface SpouseFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  placeOfBirth: string;
  placeOfDeath: string | null;
  isAlive: boolean;
  shortSummary: string;
}

interface AddSpouseFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: SpouseFormData & { memberId: string }) => void;
  currentMemberId: string; // ID của member hiện tại
  gender: "male" | "female";
  fullName: string;
}

// Hàm định dạng ngày tháng
const formatDateToISOString = (date: Date | null): string | null => {
  if (!date) return null;

  // Lấy ngày, tháng, năm của đối tượng Date
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Thêm 1 vì getMonth() bắt đầu từ 0
  const day = date.getDate().toString().padStart(2, "0");

  // Trả về định dạng "YYYY-MM-DD"
  return `${year}-${month}-${day}`;
};

const AddSpouseForm: React.FC<AddSpouseFormProps> = ({
  opened,
  onClose,
  onSubmit,
  currentMemberId,
  gender,
  fullName,
}) => {
  const form = useForm({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: null,
      dateOfDeath: null,
      placeOfBirth: "",
      placeOfDeath: "",
      isAlive: true,
      shortSummary: "",
    },
    validate: yupResolver(spouseSchema),
  });

  const handleSubmit = (values: SpouseFormData) => {
    const formattedValues = {
      ...values,
      dateOfBirth: formatDateToISOString(
        values.dateOfBirth ? new Date(values.dateOfBirth) : null
      ),
      dateOfDeath: formatDateToISOString(
        values.dateOfDeath ? new Date(values.dateOfDeath) : null
      ),
      memberId: currentMemberId, // Truyền ID của member hiện tại lên
    };

    onSubmit(formattedValues);
    form.reset();
    onClose();
  };
  const handleClose = () => {
    form.reset(); // Reset form khi đóng modal
    onClose(); // Đóng modal
  };

  const modalTitle =
    gender === "male"
      ? `Thêm Vợ cho ${fullName}`
      : `Thêm Chồng cho ${fullName}`;
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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
            <TextInput
              label="Họ"
              placeholder="Nhập họ"
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label="Tên đệm"
              placeholder="Nhập tên đệm"
              {...form.getInputProps("middleName")}
            />
            <TextInput
              label="Tên"
              placeholder="Nhập tên"
              {...form.getInputProps("lastName")}
            />
          </div>

          <DatePickerInput
            label="Ngày sinh"
            placeholder="Chọn ngày sinh"
            {...form.getInputProps("dateOfBirth")}
            maxDate={new Date()}
            valueFormat="DD/MM/YYYY"
            clearable
          />

          <TextInput
            label="Nơi sinh"
            placeholder="Nhập nơi sinh"
            {...form.getInputProps("placeOfBirth")}
          />

          <Switch
            label="Còn sống"
            checked={form.values.isAlive}
            color="brown"
            onChange={(event) =>
              form.setFieldValue("isAlive", event.currentTarget.checked)
            }
          />

          {!form.values.isAlive && (
            <>
              <DatePickerInput
                label="Ngày mất"
                placeholder="Chọn ngày mất"
                {...form.getInputProps("dateOfDeath")}
                maxDate={new Date()}
                valueFormat="DD/MM/YYYY"
                clearable
              />
              <TextInput
                label="Nơi mất"
                placeholder="Nhập nơi mất"
                {...form.getInputProps("placeOfDeath")}
              />
            </>
          )}

          <Textarea
            label="Tóm tắt"
            placeholder="Nhập tóm tắt về vợ/chồng"
            {...form.getInputProps("shortSummary")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" color="brown">
              Thêm
            </Button>
          </Group>
        </div>
      </form>
    </Modal>
  );
};

export default AddSpouseForm;
