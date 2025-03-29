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

export const meta = () => [{ title: "Quản lý doanh thu" }];

const route = () => {
  const endpoint = "/trackings/revenue-orders/summary";
  const { data, isLoading, isFetching, refetch } = useGetApi({
    queryKey: ["revenue"],
    endpoint,
  });

  // Xử lý dữ liệu từ API
  const revenueData =
    data?.data?.revenueInYear?.map((item: any) => ({
      month: new Date(0, item.month - 1).toLocaleString("vi-VN", {
        month: "short",
      }),
      "Doanh thu (VND)": item.value,
    })) || [];

  const orderData =
    data?.data?.orderInYear?.map((item: any) => ({
      month: new Date(0, item.month - 1).toLocaleString("vi-VN", {
        month: "short",
      }),
      "Số đơn hàng": item.value,
    })) || [];

  const statistics = [
    {
      title: "Tổng doanh thu",
      value:
        data?.data?.totalRevenue !== undefined
          ? data?.data?.totalRevenue?.toLocaleString("vi-VN") + " VND"
          : null,
      color: "#7B1FA2",
      bgColor: "#F3E5F5",
    },
    {
      title: "Số lượng đơn hàng",
      value:
        data?.data?.totalOrder !== undefined
          ? data?.data?.totalOrder?.toLocaleString("vi-VN")
          : null,
      color: "#00796B",
      bgColor: "#E0F2F1",
    },
    {
      title: "Đơn hàng trong tháng",
      value:
        data?.data?.orderInMonth !== undefined
          ? data?.data?.orderInMonth?.toLocaleString("vi-VN")
          : null,
      color: "#388E3C",
      bgColor: "#E8F5E9",
    },
    {
      title: "Doanh thu trong tháng",
      value:
        data?.data?.revenueInMonth !== undefined
          ? data?.data?.revenueInMonth?.toLocaleString("vi-VN") + " VND"
          : null,
      color: "#F57C00",
      bgColor: "#FFF3E0",
    },
  ];

  return (
    <AppShell padding="xl">
      <Title order={2} style={{ color: "#6D4C41", marginBottom: "20px" }}>
        📊 Quản lý doanh thu 📈
      </Title>

      {/* Hiển thị loader khi dữ liệu đang tải */}
      {isLoading || isFetching ? (
        <Center style={{ height: "300px" }}>
          <Loader size="lg" color="blue" />
        </Center>
      ) : (
        <>
          {/* Hiển thị số liệu */}
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

          {/* Chia đôi màn hình, mỗi bên một đồ thị */}
          <Grid gutter="md" style={{ marginTop: "100px" }}>
            {/* Biểu đồ cột: Doanh thu theo tháng */}
            <Grid.Col span={6}>
              <Stack>
                <Text size="lg" style={{ fontWeight: 600, color: "#6D4C41" }}>
                  📅 Doanh thu theo tháng
                </Text>
                {revenueData.length > 0 ? (
                  <BarChart
                    h={400}
                    data={revenueData}
                    dataKey="month"
                    series={[{ name: "Doanh thu (VND)", color: "blue.7" }]}
                    withLegend
                    withTooltip
                  />
                ) : (
                  <Skeleton height={300} />
                )}
              </Stack>
            </Grid.Col>

            {/* Biểu đồ đường: Xu hướng số đơn hàng */}
            <Grid.Col span={6}>
              <Stack>
                <Text size="lg" style={{ fontWeight: 600, color: "#6D4C41" }}>
                  📦 Số đơn hàng theo tháng
                </Text>
                {orderData.length > 0 ? (
                  <LineChart
                    h={400}
                    data={orderData}
                    dataKey="month"
                    series={[{ name: "Số đơn hàng", color: "red.7" }]}
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
