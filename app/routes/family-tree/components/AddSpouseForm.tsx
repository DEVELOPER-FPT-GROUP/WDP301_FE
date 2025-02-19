import {
  Modal,
  TextInput,
  Button,
  Group,
  Textarea,
  Switch,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
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
  dateOfBirth: Yup.date()
    .required("Ngày sinh là bắt buộc")
    .max(new Date(), "Ngày sinh không thể trong tương lai"),
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
}

// Hàm định dạng ngày tháng
const formatDateToISOString = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString().split("T")[0];
};

const AddSpouseForm: React.FC<AddSpouseFormProps> = ({
  opened,
  onClose,
  onSubmit,
  currentMemberId,
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

  return (
    <Modal opened={opened} onClose={onClose} title="Thêm Vợ/Chồng" size="lg">
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

          <Switch
            label="Còn sống"
            checked={form.values.isAlive}
            onChange={(event) =>
              form.setFieldValue("isAlive", event.currentTarget.checked)
            }
          />

          {!form.values.isAlive && (
            <>
              <DateInput
                label="Ngày mất"
                placeholder="Chọn ngày mất"
                {...form.getInputProps("dateOfDeath")}
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

export default AddSpouseForm;
