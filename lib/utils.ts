import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Active, DataRef, Over } from "@dnd-kit/core";
import { ColumnDragData } from "@/components/kanban/board-column";
import { TaskDragData } from "@/components/kanban/task-card";
import { isObject, transform } from "lodash";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { navItems } from "@/constants/data";
import 'dayjs/locale/id'; 

dayjs.extend(duration);
dayjs.locale('id');

type DraggableData = ColumnDragData | TaskDragData;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Task") {
    return true;
  }

  return false;
}

export const convertEmptyStringsToNull = (obj: any) => {
  return transform(obj, (result: any, value: any, key: any) => {
    if (isObject(value)) {
      result[key] = convertEmptyStringsToNull(value);
    } else {
      result[key] = value === "" ? null : value;
    }
  });
};

export const convertTime = (time: number | null) => {
  if (time === null) return "-";

  const duration = dayjs.duration(time, "seconds");
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  let displayString = "";
  if (days !== 0) {
    displayString += ` ${days} Hari`;
  }

  if (hours !== 0) {
    displayString += ` ${hours} jam`;
  }

  if (minutes !== 0) {
    displayString += ` ${minutes} menit`;
  }

  if (seconds !== 0) {
    displayString += ` ${seconds} detik`;
  }

  return displayString;
};

export const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export function makeUrlsClickable(str: string) {
  const urlRegex = /(\bhttps?:\/\/[^\s]+(\.[^\s]+)*(\/[^\s]*)?\b)/g;
  return str.replace(
    urlRegex,
    (url: any) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:blue">${url}</a>`,
  );
}

export function getNavItemsByRole(role?: string) {
  if (role === "super_admin") {
    return navItems;
  }

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(role || "admin"),
  );

  // Filter items within each menu based on role
  const navItemsWithFilteredSubItems = filteredNavItems.map((item) => {
    if (item.items) {
      return {
        ...item,
        items: item.items.filter((subItem) =>
          subItem.roles.includes(role || "admin"),
        ),
      };
    }
    return item;
  });

  // Remove menus that have no items after filtering
  return navItemsWithFilteredSubItems.filter((item) => {
    if (item.items) {
      return item.items.length > 0; // Only show menu if it has items
    }
    return true; // Show menu without items (like single page menus)
  });
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case "iphone":
      return "iPhone";
    case "camera":
      return "Camera";
    case "outdoor":
      return "Outdoor";
    case "starlink":
      return "Starlink";
    default:
      return category;
  }
}

export function getProductStatusLabel(status: string): string {
  switch (status) {
    case "available":
      return "Available";
    case "unavailable":
      return "Unavailable";
    default:
      return status;
  }
}

export const formatDateTime = (
  date: Date,
  locale: string = "en-GB",
  timeZone: string = "Asia/Jakarta",
) => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return new Intl.DateTimeFormat(locale, options).format(date) + " WIB";
};

export const formatDate = (date?: string | Date, withTime = true) => {
  if (!date) return "-";
  return withTime
    ? dayjs(date).format("dddd, DD MMMM YYYY HH:mm")
    : dayjs(date).format("dddd, DD MMMM YYYY");
};

export const formatDateIndonesian = (date?: string | Date, withTime = true) => {
  if (!date) return "-";
  
  const dayNames = {
    Sunday: "Minggu",
    Monday: "Senin", 
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu"
  };
  
  const monthNames = {
    January: "Januari",
    February: "Februari", 
    March: "Maret",
    April: "April",
    May: "Mei",
    June: "Juni",
    July: "Juli",
    August: "Agustus",
    September: "September",
    October: "Oktober",
    November: "November",
    December: "Desember"
  };
  
  // Force dayjs to use English locale for consistent formatting
  const dayjsDate = dayjs(date).locale('en');
  const dayName = dayNames[dayjsDate.format("dddd") as keyof typeof dayNames];
  const monthName = monthNames[dayjsDate.format("MMMM") as keyof typeof monthNames];
  
  if (withTime) {
    return `${dayName}, ${dayjsDate.format("DD")} ${monthName} ${dayjsDate.format("YYYY")} ${dayjsDate.format("HH:mm")}`;
  } else {
    return `${dayName}, ${dayjsDate.format("DD")} ${monthName} ${dayjsDate.format("YYYY")}`;
  }
};

/**
 * Convert date string (YYYY-MM-DD) to ISO 8601 format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns ISO 8601 formatted date string
 */
export const convertDateToISO = (dateString: string): string => {
  if (!dateString) return '';
  // Convert YYYY-MM-DD to ISO 8601 format
  return new Date(dateString + 'T00:00:00.000Z').toISOString();
};

export const formatDateWithTimezone = (
  date?: string | Date | null,
  withTime = true,
  numeric = false
): string => {
  if (!date) return "-";

  const d = dayjs(date);
  if (!d.isValid()) return String(date);

  return d
    .add(7, "hour")
    .format((numeric ? "DD:MM:YYYY" : "DD MMMM YYYY") + (withTime ? " HH:mm" : "")) +
    (withTime && !numeric ? " WIB" : "");
};
