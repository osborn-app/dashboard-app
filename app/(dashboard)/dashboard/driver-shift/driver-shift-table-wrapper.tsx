"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit3, Save, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DriverShiftDataTable, createDriverShiftColumns } from "@/components/tables/driver-shift-tables";
import { dummyDriverShifts, DriverShift } from "./dummy-data";
import { toast } from "@/components/ui/use-toast";

export default function DriverShiftTableWrapper() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [driverShifts, setDriverShifts] = useState<DriverShift[]>(dummyDriverShifts);
  const [originalData, setOriginalData] = useState<DriverShift[]>(dummyDriverShifts);

  // Filter data berdasarkan tanggal dan search term
  const filteredData = useMemo(() => {
    let filtered = driverShifts;
    
    // Filter berdasarkan tanggal
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    filtered = filtered.filter(shift => shift.tanggal === selectedDateStr);
    
    // Filter berdasarkan search term
    if (searchTerm) {
      filtered = filtered.filter(shift =>
        shift.namaDriver.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [driverShifts, selectedDate, searchTerm]);

  // Handle update shift
  const handleUpdateShift = (id: string, field: keyof DriverShift, value: string) => {
    setDriverShifts(prev => 
      prev.map(shift => 
        shift.id === id ? { ...shift, [field]: value } : shift
      )
    );
  };

  // Handle delete shift
  const handleDeleteShift = (id: string) => {
    setDriverShifts(prev => prev.filter(shift => shift.id !== id));
    toast({
      title: "Berhasil",
      description: "Shift driver berhasil dihapus",
    });
  };

  // Handle edit mode toggle
  const handleEditModeToggle = () => {
    if (isEditMode) {
      // Save changes
      setOriginalData([...driverShifts]);
      toast({
        title: "Berhasil",
        description: "Perubahan jadwal berhasil disimpan",
      });
    } else {
      // Enter edit mode
      setOriginalData([...driverShifts]);
    }
    setIsEditMode(!isEditMode);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setDriverShifts([...originalData]);
    setIsEditMode(false);
    toast({
      title: "Dibatalkan",
      description: "Perubahan dibatalkan",
    });
  };

  // Get columns based on current mode
  const columns = createDriverShiftColumns({
    isEditMode,
    onUpdateShift: handleUpdateShift,
    onDeleteShift: handleDeleteShift,
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Cari Drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
          </div>
          
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: id })
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Edit/Save Button */}
        <div className="flex items-center space-x-2">
          {isEditMode && (
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Batal</span>
            </Button>
          )}
          <Button
            onClick={handleEditModeToggle}
            className="flex items-center space-x-2"
          >
            {isEditMode ? (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan</span>
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                <span>Edit Jadwal</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DriverShiftDataTable
        columns={columns}
        data={filteredData}
        isEditMode={isEditMode}
        onUpdateShift={handleUpdateShift}
        onDeleteShift={handleDeleteShift}
      />
    </div>
  );
}
