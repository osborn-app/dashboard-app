"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface CustomDateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomDateTimePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal dan waktu",
  disabled = false,
}: CustomDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"date" | "time">("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [selectedTime, setSelectedTime] = useState({
    hour: value ? new Date(value).getHours() : 0,
    minute: value ? new Date(value).getMinutes() : 0,
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setStep("time");
    }
  };

  const handleTimeConfirm = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(selectedTime.hour);
      finalDate.setMinutes(selectedTime.minute);
      finalDate.setSeconds(0);
      onChange(finalDate);
      setOpen(false);
      setStep("date");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setStep("date");
    // Reset to current value
    if (value) {
      setSelectedDate(new Date(value));
      setSelectedTime({
        hour: new Date(value).getHours(),
        minute: new Date(value).getMinutes(),
      });
    }
  };

  const displayValue = value
    ? format(new Date(value), "dd MMMM yyyy, HH:mm", { locale: id })
    : "";

  return (
    <>
      <div className="relative">
        <Input
          readOnly
          value={displayValue}
          placeholder={placeholder}
          onClick={() => !disabled && setOpen(true)}
          className="h-12 text-base cursor-pointer pr-10"
          disabled={disabled}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {step === "date" ? "📅 Pilih Tanggal" : "🕐 Pilih Waktu"}
            </DialogTitle>
          </DialogHeader>

          {step === "date" ? (
            <div className="py-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={id}
                className="rounded-md border w-full"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
          ) : (
            <div className="py-6 space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Tanggal: {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: id }) : ""}
                </p>
              </div>

              {/* Hour Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Jam</label>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setSelectedTime({ ...selectedTime, hour })}
                      className={`
                        h-12 rounded-lg font-medium transition-all
                        ${
                          selectedTime.hour === hour
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }
                      `}
                    >
                      {hour.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Menit</label>
                <div className="grid grid-cols-6 gap-2">
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => setSelectedTime({ ...selectedTime, minute })}
                      className={`
                        h-12 rounded-lg font-medium transition-all
                        ${
                          selectedTime.minute === minute
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }
                      `}
                    >
                      {minute.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Waktu yang dipilih:</p>
                <p className="text-xl font-bold text-blue-600">
                  {selectedTime.hour.toString().padStart(2, "0")}:
                  {selectedTime.minute.toString().padStart(2, "0")}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {step === "time" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("date")}
                className="flex-1"
              >
                ← Kembali
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Batal
            </Button>
            {step === "time" && (
              <Button
                type="button"
                onClick={handleTimeConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Selesai
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

