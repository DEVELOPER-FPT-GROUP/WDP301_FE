import {
  Button,
  Container,
  Grid,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { type TransformedValues, useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "react-router";
import { z } from "zod";
import useLogin from "~/infrastructure/api/hooks/auth/useLogin";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
import { Constants } from "~/infrastructure/core/constants";

export const meta = () => {
  return [{ title: "Đăng nhập" }];
};

const Login = () => {
  const navigate = useNavigate();

  const { mutate: loginRequest, isPending } = useLogin({
    onSuccess: (data: any) => {
      localStorage.setItem(
        Constants.API_ACCESS_TOKEN_KEY,
        data.data.accessToken
      );
      navigate(AppRoutes.PRIVATE.FAMILY_TREE, { replace: true });
    },
  });

  const validationSchema = z.object({
    username: z
      .string()
      .min(1, { message: "This field cannot be empty" })
      .max(255, { message: "This field cannot be longer than 255 characters" }),
    password: z.string().min(1, { message: "This field cannot be empty" }),
  });
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: zodResolver(validationSchema),
  });

  const handleSubmit = (values: TransformedValues<typeof form>) => {
    loginRequest(values);
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
                Xin chào bạn đến với{" "}
                <span
                  className="text-blue-600"
                  onClick={() => {
                    navigate(AppRoutes.PUBLIC.GUEST.HOME);
                  }}
                >
                  Gia Phả Thông Minh
                </span>
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Đăng nhập để trải nghiệm đầy đủ tính năng
              </p>
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
                <div className="text-right">
                  <a
                    onClick={() => {
                      navigate(AppRoutes.PUBLIC.AUTH.SIGN_UP);
                    }}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <Button type="submit" loading={isPending}>
                  Đăng nhập
                </Button>
                <div className="text-center text-sm mt-4">
                  Chưa có tài khoản?
                  <a
                    onClick={() => {
                      navigate(AppRoutes.PUBLIC.AUTH.SIGN_UP);
                    }}
                    className="text-blue-500 hover:underline ml-1"
                  >
                    Đăng ký ngay
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

export default Login;
