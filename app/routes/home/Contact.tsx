import { Box, Text, Title, Button, Grid, Image } from "@mantine/core";
import { MantineLogo } from "@mantinex/mantine-logo";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <Box
      id="contact"
      style={{
        padding: "80px 40px",
        textAlign: "center",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false }} // Luôn chạy lại khi cuộn đến
      >
        <Title
          order={1}
          size={50}
          fw={900}
          c="brown"
          ta="center"
          mb="md"
          style={{
            fontFamily: "'Pacifico', cursive",
            letterSpacing: "1px",
          }}
        >
          Về chúng tôi
        </Title>
      </motion.div>

      <Grid gutter="xl">
        {/* Cột bên trái: Logo, tiêu đề và nội dung */}
        <Grid.Col span={{ base: 12, md: 6 }} style={{ textAlign: "left" }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false }}
          >
            {/* <Image src="logo.png" width={40} alt="Gia Phả 4.0" /> */}
            <MantineLogo size={30} />
            <Title
              order={2}
              fw={700}
              c="brown"
              style={{
                fontFamily: "'Pacifico', cursive",
              }}
              mt="md"
            >
              Gia phả thông minh
            </Title>
            <Text size="md" c="gray.7" mt="xs">
              Giữ gìn và phát huy gia phả là giữ lấy cho con cháu đời sau một
              mảng văn hóa độc đáo gắn liền với đạo hiếu.
            </Text>
            <Text size="md" c="gray.7" mt="md">
              Các dòng họ là một phần của lịch sử dân tộc, qua đó, những người
              dựng gia phả đã giải tỏa nhiều tồn nghi do quá khứ để lại hay tìm
              được một phần của những người có công với nước vốn thất lạc hàng
              trăm năm.
            </Text>
          </motion.div>

          {/* Icon Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: false }}
            style={{ marginTop: "20px", display: "flex", gap: "10px" }}
          >
            <Image
              src="facebook-icon.png"
              width={30}
              alt="Facebook"
              style={{ cursor: "pointer", transition: "transform 0.3s" }}
              onClick={() =>
                window.open(
                  "https://www.facebook.com/profile.php?id=61573126883257",
                  "_blank"
                )
              }
            />
          </motion.div>
        </Grid.Col>

        {/* Cột bên phải: Hòm thư góp ý */}
        <Grid.Col span={{ base: 12, md: 6 }} style={{ textAlign: "left" }}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false }}
          >
            <Title
              order={2}
              fw={700}
              c="brown"
              style={{
                fontFamily: "'Pacifico', cursive",
              }}
            >
              Hòm thư góp ý
            </Title>
            <Button
              size="lg"
              radius="xl"
              mt="md"
              style={{
                background: "brown",
                color: "#fff",
                fontWeight: "bold",
                padding: "10px 30px",
              }}
              onClick={() =>
                window.open(
                  "mailto:support@gia-pha.com?subject=Góp ý về Gia Phả",
                  "_blank"
                )
              }
            >
              GÓP Ý
            </Button>
          </motion.div>
        </Grid.Col>
      </Grid>

      {/* Footer */}
      <Box
        style={{
          marginTop: "50px",
          paddingTop: "20px",
          borderTop: "1px solid #ddd",
          textAlign: "center",
        }}
      >
        <Text size="sm" c="gray.6">
          Chính sách bảo mật | Điều khoản sử dụng | Về Gia phả 4.0
        </Text>
        <Text size="sm" c="gray.6" mt="xs">
          Copyrights © 2025 by GCONNECT
        </Text>
      </Box>
    </Box>
  );
};

export default Contact;
