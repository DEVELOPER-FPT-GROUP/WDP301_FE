import { useState } from "react";
import { Button, Group, Loader } from "@mantine/core";
import { IconFileExport } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import { notifications } from "@mantine/notifications";

// Sample account data structure
const sampleAccountData = [
  { name: "Nguyễn Văn An", username: "annguyen", password: "An@123456" },
  { name: "Trần Thị Bình", username: "binhtran", password: "Binh@123456" },
  { name: "Phạm Minh Cường", username: "cuongpham", password: "Cuong@123456" },
  { name: "Lê Thị Dung", username: "dungle", password: "Dung@123456" },
  { name: "Võ Đình Hải", username: "haivo", password: "Hai@123456" },
];

interface ExportAccountsButtonProps {
  memberData?: any[];
}

const ExportAccountsButton = ({ memberData }: ExportAccountsButtonProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);

      // In a real app, you would map the actual member data to accounts
      // For now, we'll use the sample data
      const dataToExport = sampleAccountData.map((account, index) => ({
        STT: index + 1,
        "Họ và tên": account.name,
        "Tài khoản": account.username,
        "Mật khẩu": account.password,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Set column widths
      const wscols = [
        { wch: 5 }, // STT
        { wch: 25 }, // Họ và tên
        { wch: 20 }, // Tài khoản
        { wch: 20 }, // Mật khẩu
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
        message: "Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại sau.",
        color: "red",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      leftSection={
        exporting ? (
          <Loader size="xs" color="white" />
        ) : (
          <IconFileExport size={18} />
        )
      }
      color="green"
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? "Đang xuất..." : "Xuất tài khoản (Excel)"}
    </Button>
  );
};

export default ExportAccountsButton;
