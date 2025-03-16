import {
  Modal,
  TextInput,
  Button,
  Group,
  Textarea,
  Radio,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
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
  dateOfBirth: Yup.date().required("Ngày sinh là bắt buộc"),
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
  onSubmit: (values: ChildFormData & { parentId: string }) => void;
  parentId: string; // ID của cha/mẹ
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

const AddChildModal: React.FC<AddChildModalProps> = ({
  opened,
  onClose,
  onSubmit,
  parentId,
}) => {
  const form = useForm({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: null,
      // Mặc định là "male"
      placeOfBirth: "",
      isAlive: true,
      shortSummary: "",
      gender: "male", // Mặc định là true
    },
    validate: yupResolver(childSchema),
  });

  const handleSubmit = (values: ChildFormData) => {
    console.log(`Before submit`, values);
    const formattedValues = {
      ...values,
      dateOfBirth: formatDateToISOString(
        values.dateOfBirth ? new Date(values.dateOfBirth) : null
      ),
      parentId, // Truyền ID của cha/mẹ
    };
    onSubmit(formattedValues);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset(); // Reset form khi đóng modal
    onClose(); // Đóng modal
  };

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

          <Radio.Group label="Giới tính" {...form.getInputProps("gender")}>
            <Group mt="xs">
              <Radio value="male" label="Nam" color="brown" />
              <Radio value="female" label="Nữ" color="brown" />
            </Group>
          </Radio.Group>

          <Textarea
            label="Tóm tắt"
            placeholder="Nhập tóm tắt về con"
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

export default AddChildModal;
