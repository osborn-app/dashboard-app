import type { Metadata } from "next";
import DriverShiftClient from "./driver-shift-client";

export const metadata: Metadata = {
  title: "Driver Shift | Transgo",
  description: "Kelola jadwal shift driver dan lihat laporan performa",
};

export default function DriverShiftPage() {
  return <DriverShiftClient />;
}