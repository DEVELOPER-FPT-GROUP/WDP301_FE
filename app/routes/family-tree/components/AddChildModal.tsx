import {
  Modal,
  TextInput,
  Button,
  Group,
  Textarea,
  Radio,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";

// Validation schema
const childSchema = Yup.object().shape({
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
  dateOfBirth: Yup.date()
    .required("Ngày sinh là bắt buộc")
    .max(new Date(), "Ngày sinh không thể trong tương lai"),
  gender: Yup.string()
    .required("Giới tính là bắt buộc")
    .oneOf(["male", "female"], "Giới tính không hợp lệ"),
  placeOfBirth: Yup.string()
    .required("Nơi sinh là bắt buộc")
    .min(2, "Nơi sinh phải có ít nhất 2 ký tự"),
  shortSummary: Yup.string().max(500, "Tóm tắt không được quá 500 ký tự"),
});

export interface ChildFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string;
  placeOfBirth: string;
  shortSummary: string;
  isAlive: boolean; // Mặc định là true
}

interface AddChildModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: ChildFormData & { memberId: string }) => void;
  memberId: string; // ID của cha/mẹ
}

// Hàm định dạng ngày tháng
const formatDateToISOString = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString().split("T")[0];
};

const AddChildModal: React.FC<AddChildModalProps> = ({
  opened,
  onClose,
  onSubmit,
  memberId,
}) => {
  const form = useForm({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: null,
      gender: "male", // Mặc định là "male"
      placeOfBirth: "",
      shortSummary: "",
      isAlive: true, // Mặc định là true
    },
    validate: yupResolver(childSchema),
  });

  const handleSubmit = (values: ChildFormData) => {
    const formattedValues = {
      ...values,
      dateOfBirth: formatDateToISOString(
        values.dateOfBirth ? new Date(values.dateOfBirth) : null
      ),
      memberId, // Truyền ID của cha/mẹ
    };

    onSubmit(formattedValues);
    form.reset();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Thêm Con" size="lg">
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

          <DateInput
            label="Ngày sinh"
            placeholder="Chọn ngày sinh"
            {...form.getInputProps("dateOfBirth")}
            clearable
          />

          <TextInput
            label="Nơi sinh"
            placeholder="Nhập nơi sinh"
            {...form.getInputProps("placeOfBirth")}
          />

          <Radio.Group label="Giới tính" {...form.getInputProps("gender")}>
            <Group mt="xs">
              <Radio value="male" label="Nam" />
              <Radio value="female" label="Nữ" />
            </Group>
          </Radio.Group>

          <Textarea
            label="Tóm tắt"
            placeholder="Nhập tóm tắt về con"
            {...form.getInputProps("shortSummary")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" color="blue">
              Thêm
            </Button>
          </Group>
        </div>
      </form>
    </Modal>
  );
};

export default AddChildModal;
