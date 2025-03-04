import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

interface NotificationProps {
  title: string;
  message?: string;
  onClose?: () => void;
  onOpen?: () => void;
}

/**
 * Generic notification handler
 */
const notify = (
  type: "success" | "error" | "warning" | "info",
  { title, message, onClose, onOpen }: NotificationProps
) => {
  const icons = {
    success: <IconX />,
    error: <IconX />,
    warning: <IconX />,
    info: <IconX />,
  };

  const colors = {
    success: "green",
    error: "red",
    warning: "yellow",
    info: "blue",
  };

  notifications.show({
    position: "top-right",
    withCloseButton: true,
    onClose: onClose,
    onOpen: onOpen,
    autoClose: 5000,
    title: title || capitalize(type),
    message: message || null,
    color: colors[type],
    icon: icons[type],
    loading: false,
    radius: "md",
  });
};

/**
 * Utility to capitalize notification titles
 */
const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Predefined notification shortcuts
 */
const notifySuccess = (props: NotificationProps) => notify("success", props);
const notifyError = (props: NotificationProps) => notify("error", props);
const notifyWarning = (props: NotificationProps) => notify("warning", props);
const notifyInfo = (props: NotificationProps) => notify("info", props);

export { notifySuccess, notifyError, notifyWarning, notifyInfo };
