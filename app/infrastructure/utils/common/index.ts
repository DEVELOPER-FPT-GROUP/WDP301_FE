import { jwtDecode } from "jwt-decode";
import { Constants } from "~/infrastructure/core/constants";

// tranform date to dd/mm/yyyy
export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
};

export const getDataFromToken = () => {
  const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);

  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    console.log(decoded);
    return decoded;
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};

export const formatNormalDate = (isoDate: string) => {
  const date = new Date(isoDate);
  // Get day, month, year
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  // Return formatted date
  return `${day}/${month}/${year}`;
};
