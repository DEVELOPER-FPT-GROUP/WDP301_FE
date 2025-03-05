import {
  Button,
  Container,
  Grid,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm, type TransformedValues } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "react-router";
import { z } from "zod";
import { usePostApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
import { Constants } from "~/infrastructure/core/constants";
import { Endpoints } from "~/infrastructure/core/endpoints";
import {
  notifyError,
  notifySuccess,
} from "~/infrastructure/utils/notification/notification";

export const meta = () => {
  return [{ title: "Đăng ký" }];
};

const SignUp = () => {
  const navigate = useNavigate();

  const validationSchema = z
    .object({
      username: z
        .string()
        .min(1, { message: "Không được để trống thông tin này" })
        .max(255, {
          message: "Không được quá 255 ký tự",
        }),
      password: z
        .string()
        .min(1, { message: "Không được để trống thông tin này" }),
      confirmPassword: z
        .string()
        .min(1, { message: "Không được để trống thông tin này" }),
      familyName: z
        .string()
        .min(1, { message: "Không được để trống thông tin này" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    });

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
      familyName: "",
    },
    validate: zodResolver(validationSchema),
  });

  const { mutate, isPending } = usePostApi({
    endpoint: Endpoints.Auth.REGISTER,
    options: {
      onSuccess: () => {
        notifySuccess({
          title: "Thành công",
          message: "Đăng ký thành công! Vui lòng đăng nhập.",
        });
        navigate(AppRoutes.PUBLIC.AUTH.LOGIN);
      },
      onError: (error) => {
        const errorMessage =
          (error as any).response?.data?.message ||
          "Có lỗi xảy ra khi đăng ký.";
        notifyError({
          title: "Thất bại",
          message: errorMessage,
        });
      },
    },
  });

  const handleSubmit = (values: TransformedValues<typeof form>) => {
    const payload = {
      username: values.username,
      password: values.password,
      familyName: values.familyName,
    };

    console.log("Submitting payload:", payload);
    mutate(payload);
  };

  return (
    <Container
      fluid
      className="h-screen flex items-center justify-center bg-gray-200"
    >
      <Grid className="h-screen w-screen">
        {/* Cột bên trái - Hình ảnh */}
        <Grid.Col
          span={7}
          className="h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/test.jpg')" }}
        />

        {/* Cột bên phải - Form đăng nhập */}
        <Grid.Col
          span={5}
          className="flex justify-center items-center h-screen bg-white"
        >
          <div>
            <div className="text-center mb-8 max-w-lg">
              <h1 className="text-3xl font-bold uppercase text-gray-800">
                Đăng kí để trải nghiệm{" "}
                <span className="text-blue-600">Gia Phả Thông Minh</span>
              </h1>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Tên đăng nhập"
                  placeholder="Nhập tên đăng nhập"
                  withAsterisk
                  {...form.getInputProps("username")}
                />
                <PasswordInput
                  label="Mật khẩu"
                  withAsterisk
                  placeholder="Nhập mật khẩu"
                  {...form.getInputProps("password")}
                />
                <PasswordInput
                  label="Xác nhận mật khẩu"
                  withAsterisk
                  placeholder="Nhập mật khẩu"
                  {...form.getInputProps("confirmPassword")}
                />
                <TextInput
                  label="Tên dòng họ"
                  placeholder="Nhập tên dòng họ"
                  withAsterisk
                  {...form.getInputProps("familyName")}
                />
                <Button type="submit" loading={isPending}>
                  Đăng ký
                </Button>
                <div className="text-center text-sm mt-4">
                  Đã có tài khoản?
                  <a
                    onClick={() => {
                      navigate(AppRoutes.PUBLIC.AUTH.LOGIN);
                    }}
                    className="text-blue-500 hover:underline ml-1"
                  >
                    Đăng nhập ngay
                  </a>
                </div>
              </Stack>
            </form>
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default SignUp;
