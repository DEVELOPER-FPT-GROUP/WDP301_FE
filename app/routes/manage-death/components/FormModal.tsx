import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  SimpleGrid,
  Group,
  LoadingOverlay,
  Center,
  Select,
  Text,
} from "@mantine/core";
import {
  useGetApi,
  usePutApi,
} from "~/infrastructure/common/api/hooks/requestCommonHooks";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";
import { DateInput } from "@mantine/dates";
import * as yup from "yup";
import { useForm } from "@mantine/form";
import { Constants } from "~/infrastructure/core/constants";
import { jwtDecode } from "jwt-decode";
const getMemberIdFromToken = () => {
  const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);

  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.familyId;
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};
const FormModal = ({ opened, onClose, data, refreshTable }: any) => {
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const memberId = getMemberIdFromToken();
  // Schema validation với Yup
  const validationSchema = yup.object().shape({
    memberId: yup.string().required("Thành viên không được để trống"),
    dateOfDeath: yup
      .date()
      .typeError("Ngày mất không hợp lệ")
      .required("Ngày mất không được để trống")
      .max(new Date(), "Ngày mất không thể lớn hơn ngày hiện tại"),
    placeOfDeath: yup.string(),
    worship: yup.string(),
  });

  const form = useForm({
    initialValues: {
      memberId: "",
      dateOfDeath: "" as any,
      placeOfDeath: "",
      worship: "",
    },
    validate: (values) => {
      try {
        validationSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (err: any) {
        const errors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          errors[e.path] = e.message;
        });
        return errors;
      }
    },
  });

  useEffect(() => {
    if (data) {
      // console.log("data: ", data);
      setIsFetchingData(true);
      form.setValues({
        memberId: data.memberId,
        dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath) : "",
        placeOfDeath: data.placeOfDeath,
        worship: data.worship,
      });
      setTimeout(() => setIsFetchingData(false), 800);
    } else {
      form.reset();
    }
  }, [data]);

  const { data: members } = useGetApi({
    endpoint: `members/family/${memberId}/search`,
    queryKey: ["members"],
    queryParams: {
      page: 1,
      limit: 1000,
      isAlive: false,
    },
  });
  // console.log("members: ", members);

  const putMutation = usePutApi({
    endpoint: `members/${form.values.memberId}`,
    options: {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: data
            ? "Ngày giỗ dòng họ đã được cập nhật thành công!"
            : "Ngày giỗ dòng họ đã được thêm mới thành công!",
        });
        handleClose();
        setLoading(false);
        refreshTable();
      },
      onError: () => {
        notifyError({
          title: "Thất bại",
          message: "Có lỗi xảy ra khi lưu ngày giỗ dòng họ.",
        });
        setLoading(false);
      },
    },
  });

  const handleSubmit = (values: any) => {
    setLoading(true);
    const payload = {
      dateOfDeath: values.dateOfDeath,
      placeOfDeath: values.placeOfDeath,
      worship: values.worship,
    };

    putMutation.mutate(payload);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text size="xl" fw={700} c="brown">
          {data ? "Chỉnh sửa ngày giỗ" : "Thêm mới ngày giỗ"}
        </Text>
      }
      centered
      size="60%"
      closeOnClickOutside={false}
    >
      <LoadingOverlay
        visible={loading}
        loaderProps={{ children: "Đang xử lý..." }}
      />
      <LoadingOverlay visible={isFetchingData} />
      {!isFetchingData ? (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <SimpleGrid cols={2} spacing="md">
              {/* <p>
                {members.data.items.length > 0 &&
                  JSON.stringify(members.data.items)}
              </p> */}
              <Select
                label="Thành viên"
                data={
                  members &&
                  members.data.items &&
                  members.data.items.length > 0 &&
                  members.data.items
                    .filter((member: any) => member.dateOfDeath)
                    .map((member: any) => {
                      console.log("member: ", member);
                      return {
                        value: member.memberId,
                        label:
                          member.firstName +
                          " " +
                          member.middleName +
                          " " +
                          member.lastName,
                      };
                    })
                }
                // data={[
                //   { value: "react", label: "React" },
                //   { value: "ng", label: "Angular" },
                // ]}
                allowDeselect={false}
                {...form.getInputProps("memberId")}
                withAsterisk
              />
              <DateInput
                label="Ngày mất (lịch dương)"
                locale="vi"
                clearable
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
                withAsterisk
                {...form.getInputProps("dateOfDeath")}
              />
            </SimpleGrid>
            <SimpleGrid cols={2} spacing="md">
              <TextInput
                label="An táng tại"
                placeholder="An táng tại"
                {...form.getInputProps("placeOfDeath")}
              />
              <TextInput
                label="Thờ cúng tại"
                placeholder="Thờ cúng tại"
                {...form.getInputProps("worship")}
              />
            </SimpleGrid>
            <Group justify="flex-end">
              <Button variant="default" onClick={handleClose}>
                Hủy
              </Button>
              <Button color="brown" type="submit">
                Lưu
              </Button>
            </Group>
          </Stack>
        </form>
      ) : (
        <Center style={{ height: 300 }}>
          <LoadingOverlay visible={true} />
        </Center>
      )}
    </Modal>
  );
};

export default FormModal;
