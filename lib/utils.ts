import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Active, DataRef, Over } from "@dnd-kit/core";
import { ColumnDragData } from "@/components/kanban/board-column";
import { TaskDragData } from "@/components/kanban/task-card";
import { isObject, transform } from "lodash";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { navItems } from "@/constants/data";
dayjs.extend(duration);

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
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(role || "admin"),
  );

  return filteredNavItems;
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
