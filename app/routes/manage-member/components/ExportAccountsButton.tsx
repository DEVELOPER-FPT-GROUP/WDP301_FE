import { useState } from "react";
import { Button, Group, Loader } from "@mantine/core";
import { IconFileExport } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import { notifications } from "@mantine/notifications";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { getDataFromToken } from "~/infrastructure/utils/common";

interface ExportAccountsButtonProps {
  memberData?: any[];
}

const ExportAccountsButton = ({ memberData }: ExportAccountsButtonProps) => {
  const [exporting, setExporting] = useState(false);
  const token = getDataFromToken();
  const familyId = token && token?.familyId;

  const {
    data: accountsData,
    isLoading,
    isError,
    refetch,
  } = useGetApi({
    queryKey: ["export-accounts", familyId],
    endpoint: `members/get-accounts-in-family/${familyId}`,
    enabled: !!familyId, // Only fetch when familyId is available
  });

  const handleExport = async () => {
    try {
      setExporting(true);

      // If data is not yet loaded, trigger a refetch
      if (!accountsData && !isLoading) {
        await refetch();
      }

      if (
        !accountsData ||
        !accountsData.data ||
        accountsData.data.length === 0
      ) {
        throw new Error("Không có dữ liệu tài khoản");
      }

      // Map the actual API data to the Excel format
      interface AccountData {
        fullName: string;
        username: string;
        password: string;
        gender: "male" | "female";
        generation: string;
        dateOfBirth?: string;
        dateOfDeath?: string;
        placeOfBirth?: string;
        placeOfDeath?: string;
      }

      interface ExportedAccountData {
        STT: number;
        "Họ và tên": string;
        "Tài khoản": string;
        "Mật khẩu": string;
        "Giới tính": string;
        "Thế hệ": string;
        "Ngày sinh": string;
        "Ngày mất": string;
        "Nơi sinh": string;
        "Nơi chôn cất": string;
      }

      const dataToExport: ExportedAccountData[] = accountsData.data.map(
        (account: AccountData, index: number) => ({
          STT: index + 1,
          "Họ và tên": account.fullName,
          "Tài khoản": account.username,
          "Mật khẩu": account.password,
          "Giới tính": account.gender === "male" ? "Nam" : "Nữ",
          "Thế hệ": account.generation,
          "Ngày sinh": account.dateOfBirth || "",
          "Ngày mất": account.dateOfDeath || "",
          "Nơi sinh": account.placeOfBirth || "",
          "Nơi chôn cất": account.placeOfDeath || "",
        })
      );

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Set column widths
      const wscols = [
        { wch: 5 }, // STT
        { wch: 25 }, // Họ và tên
        { wch: 20 }, // Tài khoản
        { wch: 15 }, // Mật khẩu
        { wch: 10 }, // Giới tính
        { wch: 10 }, // Thế hệ
        { wch: 15 }, // Ngày sinh
        { wch: 15 }, // Ngày mất
        { wch: 20 }, // Nơi sinh
        { wch: 20 }, // Nơi chôn cất
      ];
      ws["!cols"] = wscols;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Tài khoản thành viên");

      // Generate and download file
      XLSX.writeFile(
        wb,
        `tai-khoan-thanh-vien-${new Date().toISOString().split("T")[0]}.xlsx`
      );

      notifications.show({
        title: "Xuất thành công",
        message: "Danh sách tài khoản đã được xuất ra file Excel",
        color: "green",
      });
    } catch (error) {
      console.error("Export error:", error);
      notifications.show({
        title: "Xuất thất bại",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại sau.",
        color: "red",
      });
    } finally {
      setExporting(false);
    }
  };

  // Determine button state
  const isButtonDisabled = exporting || isLoading || isError || !familyId;

  return (
    <Button
      leftSection={
        exporting || isLoading ? (
          <Loader size="xs" color="white" />
        ) : (
          <IconFileExport size={18} />
        )
      }
      color="green"
      onClick={handleExport}
      disabled={isButtonDisabled}
    >
      {exporting
        ? "Đang xuất..."
        : isLoading
        ? "Đang tải dữ liệu..."
        : "Xuất tài khoản (Excel)"}
    </Button>
  );
};

export default ExportAccountsButton;
