import { useState } from "react";
import {
  AppShell,
  Text,
  SimpleGrid,
  Card,
  Stack,
  Grid,
  Title,
  Loader,
  Skeleton,
  Center,
} from "@mantine/core";
import { BarChart, LineChart } from "@mantine/charts";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";

export const meta = () => [{ title: "Quản lý truy cập" }];

const route = () => {
  const endpoint = "/trackings/families-accounts/summary";
  const { data, isLoading, isFetching, refetch } = useGetApi({
    queryKey: ["traffic"],
    endpoint,
  });

  // Chuyển đổi dữ liệu từ API
  const viewsData =
    data?.data?.viewsInYear?.map((item: any) => ({
      month: new Date(0, item.month - 1).toLocaleString("vi-VN", {
        month: "short",
      }),
      "Lượt truy cập": item.value,
    })) || [];

  const accountsData =
    data?.data?.accountsInYear?.map((item: any) => ({
      month: new Date(0, item.month - 1).toLocaleString("vi-VN", {
        month: "short",
      }),
      "Tài khoản mới": item.value,
    })) || [];

  const statistics = [
    {
      title: "Tổng số gia đình",
      value: data?.data?.totalFamilies?.toLocaleString("vi-VN") || "0",
      color: "#7B1FA2",
      bgColor: "#F3E5F5",
    },
    {
      title: "Tổng số tài khoản",
      value: data?.data?.totalAccounts?.toLocaleString("vi-VN") || "0",
      color: "#00796B",
      bgColor: "#E0F2F1",
    },
    {
      title: "Tổng lượt truy cập",
      value: data?.data?.totalViews?.toLocaleString("vi-VN") || "0",
      color: "#388E3C",
      bgColor: "#E8F5E9",
    },
    {
      title: "Tài khoản mới trong tháng",
      value: data?.data?.accountsInMonth?.toLocaleString("vi-VN") || "0",
      color: "#F57C00",
      bgColor: "#FFF3E0",
    },
  ];

  return (
    <AppShell padding="xl">
      <Title order={2} style={{ color: "#6D4C41", marginBottom: "20px" }}>
        📊 Thống kê truy cập 🌍
      </Title>

      {/* Hiển thị loader khi dữ liệu đang tải */}
      {isLoading || isFetching ? (
        <Center style={{ height: "300px" }}>
          <Loader size="lg" color="blue" />
        </Center>
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <SimpleGrid cols={4} spacing="md">
            {statistics.map((stat, index) => (
              <Card
                key={index}
                shadow="md"
                p="lg"
                radius="lg"
                style={{
                  backgroundColor: stat.bgColor,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0px 4px 15px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Text size="md" style={{ fontWeight: 600, color: stat.color }}>
                  {stat.title}
                </Text>
                {stat.value !== null ? (
                  <Text size="xl" style={{ fontWeight: 700, color: "#1E88E5" }}>
                    {stat.value}
                  </Text>
                ) : (
                  <Skeleton height={25} width="60%" />
                )}
              </Card>
            ))}
          </SimpleGrid>

          {/* Chia đôi màn hình, mỗi bên một biểu đồ */}
          <Grid gutter="md" style={{ marginTop: "100px" }}>
            {/* Biểu đồ cột: Lượt truy cập theo tháng */}
            <Grid.Col span={6}>
              <Stack>
                <Text size="lg" style={{ fontWeight: 600, color: "#6D4C41" }}>
                  🌍 Lượt truy cập theo tháng
                </Text>
                {viewsData.length > 0 ? (
                  <BarChart
                    h={400}
                    data={viewsData}
                    dataKey="month"
                    series={[{ name: "Lượt truy cập", color: "blue.7" }]}
                    withLegend
                    withTooltip
                  />
                ) : (
                  <Skeleton height={300} />
                )}
              </Stack>
            </Grid.Col>

            {/* Biểu đồ đường: Tài khoản mới theo tháng */}
            <Grid.Col span={6}>
              <Stack>
                <Text size="lg" style={{ fontWeight: 600, color: "#6D4C41" }}>
                  👤 Tài khoản mới theo tháng
                </Text>
                {accountsData.length > 0 ? (
                  <LineChart
                    h={400}
                    data={accountsData}
                    dataKey="month"
                    series={[{ name: "Tài khoản mới", color: "red.7" }]}
                    withLegend
                    withTooltip
                  />
                ) : (
                  <Skeleton height={300} />
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </>
      )}
    </AppShell>
  );
};

export default route;
