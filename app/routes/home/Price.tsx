import {
  Box,
  Title,
  Paper,
  Button,
  Grid,
  Text,
  Modal,
  Image,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
import emailjs from "@emailjs/browser";
import { notifySuccess } from "~/infrastructure/utils/notification/notification";
import { usePostApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
// Định nghĩa kiểu dữ liệu cho một gói cước
interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  buttonText: string;
  subscription: string;
}

const pricingPlans = [
  {
    name: "Gói cho nhóm 6 người",
    price: "Miễn phí",
    features: ["Truy cập các tính năng cơ bản", "Giới hạn tối đa 6 thành viên"],
    buttonText: "Thử ngay",
    subscription: "six_people",
  },
  {
    name: "Gói cho nhóm 15 người",
    price: "200.000đ / năm",
    features: ["Truy cập các tính năng cơ bản", "Giới hạn tối đa 6 thành viên"],
    buttonText: "Mua ngay",
    subscription: "fifteen_people",
  },
  {
    name: "Gói cho nhóm 30 người",
    price: "499.000đ / năm",
    features: ["Truy cập các tính năng cơ bản", "Giới hạn tối đa 6 thành viên"],
    buttonText: "Mua ngay",
    subscription: "thirty_people",
  },
  {
    name: "Gói cho nhóm 50 người",
    price: "699.000đ / năm",
    features: [
      "Truy cập các tất cả tính năng",
      "Giới hạn tối đa 50 thành viên",
      "Hỗ trợ về 24/7 qua Facebook Zalo",
    ],
    buttonText: "Mua ngay",
    subscription: "fifty_people",
  },
  {
    name: "Gói không giới hạn",
    price: "1.000.000đ / năm",
    features: [
      "Truy cập các tất cả tính năng",
      "Giới hạn tối đa 50 thành viên",
      "Hỗ trợ về 24/7 qua Facebook Zalo",
    ],
    buttonText: "Mua ngay",
    subscription: "no_limit",
  },
];

const Price = () => {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleOpenModal = (plan: any) => {
    setSelectedPlan(plan);
    setOpened(true);
  };

  const BIDV_ACCOUNT = "4271030587";

  // Hàm tạo URL QR Code thanh toán chính xác
  const generateQRUrl = () => {
    if (!selectedPlan) return "";

    // Lấy số tiền từ chuỗi giá (loại bỏ ký tự không cần thiết)
    const amount = selectedPlan.price.match(/\d+/g)?.join("") || "0";

    return `https://img.vietqr.io/image/BIDV-${BIDV_ACCOUNT}-${amount}.png?amount=${amount}&addInfo=Thanh+toan+${encodeURIComponent(
      selectedPlan.name
    )}&fixedAmount=true`;
  };

  const form = useForm({
    initialValues: {
      fullName: "",
      phone: "",
      email: "",
    },
    validate: {
      fullName: (value) =>
        value.trim().length > 0 ? null : "Vui lòng nhập họ và tên",
      phone: (value) =>
        /^\d{10,11}$/.test(value) ? null : "Số điện thoại không hợp lệ",
      email: (value) =>
        /\S+@\S+\.\S+/.test(value) ? null : "Email không hợp lệ",
    },
  });

  const onClose = () => {
    setOpened(false);
    form.reset();
    setSelectedPlan(null);
  };

  const createMutation = usePostApi({
    endpoint: "orders",
  });

  // Hàm gửi email xác nhận thanh toán
  const sendConfirmationEmail = async (values: {
    fullName: string;
    email: string;
    transactionId: string;
  }) => {
    try {
      const templateParams = {
        to_name: values.fullName,
        to_email: values.email,
        package_name: selectedPlan?.name,
        price: selectedPlan?.price,
        transaction_id: values.transactionId,
      };

      await emailjs.send(
        "service_t9s1ums", // Thay bằng Service ID từ EmailJS
        "template_afcf8qf", // Thay bằng Template ID
        templateParams,
        "9M2wRWuuCBeBLI1Tt" // Thay bằng Public Key
      );
    } catch (error) {
      console.error("❌ Lỗi khi gửi email xác nhận:", error);
    }
  };

  // Hàm xử lý thanh toán khi form được submit
  const handlePaymentSubmit = async (values: {
    fullName: string;
    phone: string;
    email: string;
  }) => {
    try {
      const priceValue = selectedPlan?.price
        ? parseInt(selectedPlan.price.replace(/\D/g, ""), 10) || 0
        : 0;

      const newTransactionId = `GD${Date.now()}`;

      const paymentData = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phone,
        transactionId: newTransactionId,
        subscription: selectedPlan?.subscription || "custom",
        price: priceValue,
      };

      createMutation.mutate(paymentData, {
        onSuccess: (response) => {
          // Gửi email xác nhận thanh toán
          sendConfirmationEmail({ ...values, transactionId: newTransactionId });

          notifySuccess({
            title: "Thành công",
            message:
              "Đơn hàng sẽ được xác nhận bởi admin. Hãy check mail để kiểm tra đơn hàng",
          });
          onClose();
        },
        onError: (error) => {
          console.error("❌ Lỗi khi gửi thanh toán:", error);
          alert("Có lỗi xảy ra! Vui lòng thử lại.");
        },
      });
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      alert("Có lỗi xảy ra! Vui lòng thử lại.");
    }
  };

  return (
    <Box
      id="price"
      style={{
        padding: "100px 0",
        textAlign: "center",
      }}
    >
      {/* Tiêu đề */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false }}
      >
        <Title
          order={1}
          size={50}
          fw={700}
          c="brown"
          mb="xl"
          style={{
            fontFamily: "'Be Vietnam Pro', 'Roboto', sans-serif",
            lineHeight: "1.3",
          }}
        >
          Bảng giá
        </Title>
      </motion.div>

      {/* Grid 4 gói */}
      <Grid gutter="xl">
        {pricingPlans.map((plan, index) => (
          <Grid.Col key={index} span={{ base: 12, md: 6, lg: 2.4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              viewport={{ once: false }}
              style={{ height: "100%" }} // Đảm bảo tất cả thẻ có cùng chiều cao
            >
              <Paper
                shadow="lg"
                radius="md"
                p="xl"
                style={{
                  textAlign: "center",
                  border: "3px solid brown",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%", // Đảm bảo Paper có chiều cao tối đa
                }}
              >
                <Title order={2} size={20} fw={600}>
                  {plan.name}
                </Title>
                <Text size="md" fw={700} mt="md">
                  {plan.price}
                </Text>

                {/* Danh sách tính năng */}
                <Box mt="lg" style={{ textAlign: "left", flexGrow: 1 }}>
                  {plan.features.map((feature, i) => (
                    <Text key={i} size="sm">
                      ✅ {feature}
                    </Text>
                  ))}
                </Box>

                {/* Nút đăng ký */}
                <Button
                  mt="lg"
                  size="lg"
                  radius="xl"
                  style={{
                    background: "brown",
                    color: "#fff",
                    fontWeight: "bold",
                    marginTop: "auto",
                  }}
                  onClick={() => {
                    if (plan.buttonText === "Thử ngay") {
                      navigate(AppRoutes.PUBLIC.AUTH.SIGN_UP);
                    } else {
                      handleOpenModal(plan);
                    }
                  }}
                >
                  {plan.buttonText}
                </Button>
              </Paper>
            </motion.div>
          </Grid.Col>
        ))}
      </Grid>

      <Modal
        opened={opened}
        onClose={onClose}
        centered
        size="lg"
        style={{ zIndex: 99999 }}
        closeOnClickOutside={false}
        title={
          <Title order={2} c="brown" ta="center">
            Xác nhận thanh toán
          </Title>
        }
      >
        {selectedPlan && (
          <Grid mt="lg">
            {/* Cột 1: Nhập thông tin khách hàng */}
            <Grid.Col span={6}>
              <Box>
                <Text fw={700} size="lg" mb="sm">
                  Gói: {selectedPlan.name}
                </Text>
                <Text size="md" mb="md">
                  Giá: <strong>{selectedPlan.price}</strong>
                </Text>

                {/* Form nhập thông tin */}
                <form onSubmit={form.onSubmit(handlePaymentSubmit)}>
                  <TextInput
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                    {...form.getInputProps("fullName")}
                    required
                  />
                  <TextInput
                    label="Số điện thoại"
                    placeholder="0123456789"
                    mt="sm"
                    {...form.getInputProps("phone")}
                    required
                  />
                  <TextInput
                    label="Email"
                    placeholder="example@gmail.com"
                    mt="sm"
                    {...form.getInputProps("email")}
                    required
                  />

                  <Button type="submit" fullWidth mt="lg" color="brown">
                    Xác nhận thanh toán
                  </Button>
                </form>
              </Box>
            </Grid.Col>

            {/* Cột 2: QR Code Thanh toán */}
            <Grid.Col span={6} style={{ textAlign: "center" }}>
              <Text fw={700} size="md">
                Quét mã QR để thanh toán
              </Text>
              <Image
                src={generateQRUrl()}
                alt="QR Code thanh toán"
                width={200}
                height={200}
                mt="md"
              />
              <Text size="sm" mt="sm" c="gray">
                Số tài khoản: <strong>{BIDV_ACCOUNT}</strong> (BIDV)
              </Text>
              <Text size="sm" c="gray">
                Nội dung: <strong>Thanh toán {selectedPlan.name}</strong>
              </Text>
            </Grid.Col>
          </Grid>
        )}
      </Modal>
    </Box>
  );
};

export default Price;
