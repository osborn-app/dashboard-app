export function getStatusVariant(status: string): string {
  switch (status) {
    case "pending":
      return "bg-red-50 text-red-500";
    case "waiting":
      return "bg-yellow-50 text-yellow-500";
    case "confirmed":
      return "bg-orange-50 text-orange-500";
    case "on_going":
      return "bg-blue-50 text-blue-500";
    case "on_progress":
      return "bg-blue-50 text-blue-500";
    case "done":
      return "bg-green-50 text-green-500";
    case "rejected":
      return "bg-red-50 text-red-500";
    case "failed":
      return "bg-gray-50 text-gray-500";
    default:
      return "";
  }
}

export enum ReimburseStatus {
  PENDING = "pending",
  REJECTED = "rejected",
  CONFIRMED = "confirmed",
  DONE = "done",
}
