import { Box, Grid, Image, Stack, Text, Title } from "@mantine/core";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } },
};

const HomePage = () => {
  return (
    <Box
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid gutter="xl" align="center">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack justify="md" style={{ minHeight: "350px" }}>
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              exit="hidden"
              viewport={{ once: false, amount: 0.2 }}
            >
              <Title
                order={1}
                size={50}
                fw={900}
                c="brown"
                mb="xl"
                style={{
                  fontFamily: "'Lobster', cursive",
                  lineHeight: "1.3",
                }}
              >
                Gia phả thông minh
              </Title>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              exit="hidden"
              viewport={{ once: false, amount: 0.2 }}
            >
              <Text size="xl" fw={700} c="brown">
                <TypeAnimation
                  sequence={[
                    "Tôn vinh truyền thống gia đình",
                    2000,
                    "Gắn kết thế hệ",
                    2000,
                    "Giữ gìn văn hóa của dòng họ",
                    2000,
                    "Tra cứu thông tin nhanh chóng",
                    2000,
                  ]}
                  speed={50}
                  deletionSpeed={30}
                  repeat={Infinity}
                  cursor={true}
                />
              </Text>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              exit="hidden"
              viewport={{ once: false, amount: 0.2 }}
            >
              <Text size="lg" c="gray.7">
                Ứng dụng tạo cây gia phả, kết nối gia đình, lưu giữ kỷ niệm và
                quản lý thông tin dòng họ theo cách hiện đại. Với công nghệ tiên
                tiến, bạn có thể dễ dàng tìm hiểu nguồn gốc tổ tiên, tự động
                nhắc nhở sự kiện quan trọng như ngày giỗ, sinh nhật, giúp gia
                đình luôn gắn kết dù ở bất cứ đâu.
              </Text>
            </motion.div>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }} style={{ textAlign: "center" }}>
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            exit="hidden"
            viewport={{ once: false, amount: 0.2 }}
          >
            <Image
              src="banner.png"
              alt="Gia phả 4.0"
              width={350}
              height={350}
              radius="md"
              style={{ border: "4px solid white", boxShadow: "lg" }}
            />
          </motion.div>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default HomePage;
