"use client";
import { useGetDriverShifts, useGetDriverShiftReport, useGetDriverShiftLocations, type ApiResponse, type DriverShift, type DriverShiftReport, type Location } from "@/hooks/api/useDrivershift";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {getDriverShiftColumns, columnsDriverReports} from "@/components/tables/driver-shift-tables/columns";
import { useToast } from "@/components/ui/use-toast";

// Function to get default time based on shift type
const getDefaultShiftTime = (shiftType: string): { start: string; end: string } => {
  const defaultTimes: Record<string, { start: string; end: string }> = {
    'libur': { start: '00:00', end: '00:00' },
    'shift_pagi': { start: '07:00', end: '15:00' },
    'shift_middle': { start: '11:00', end: '19:00' },
    'shift_sore': { start: '15:00', end: '23:00' },
    'full_shift': { start: '07:00', end: '23:00' },
  };
  return defaultTimes[shiftType] || { start: '07:00', end: '15:00' };
};
import { DriverShiftTable } from "@/components/tables/driver-shift-tables/driver-shift-table";
import { useQueryClient } from "@tanstack/react-query";
import SearchInput from "@/components/search-input";
import Spinner from "@/components/spinner";

const DriverShiftTableWrapper = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const pageLimit = Number(searchParams.get("limit")) || 10;
    const q = searchParams.get("q");
    const [searchQuery, setSearchQuery] = React.useState<string>(q ?? "");
    const [searchDebounce] = useDebounce(searchQuery, 500);
    const [activeTab, setActiveTab] = React.useState<string>("driver-shift");
    const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
    const [editingData, setEditingData] = React.useState<Record<number, any>>({});
    
    // Date filter state - default to today
    const today = new Date().toISOString().split('T')[0];
    const [singleDate, setSingleDate] = React.useState<string>(today);
    const queryClient = useQueryClient();
    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    
    // No mutations needed - only PATCH via axiosAuth

    const { data: driverShiftData, isFetching: isFetchingDriverShift, refetch: refetchDriverShift } = useGetDriverShifts({
        limit: pageLimit,
        page: page,
        q: searchDebounce,
        date: singleDate,
    }, {
        enabled: false, // Disable automatic fetching
    });

    const { data: driverShiftReportData, isFetching: isFetchingDriverReport, refetch: refetchDriverReport } = useGetDriverShiftReport({
        limit: pageLimit,
        page: page,
        q: searchDebounce,
        date: singleDate,
    }, {
        enabled: false, // Disable automatic fetching
    });

    // Hook untuk get locations
    const { data: locationsData } = useGetDriverShiftLocations({
        enabled: true, // Enable automatic fetching
    });
    

    const createQueryString = React.useCallback(
        (params: Record<string, string | number | null | undefined>) => {
            const newSearchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value === null || value === undefined) {
                    newSearchParams.delete(key);
                } else {
                    newSearchParams.set(key, String(value));
                }
            }
            return newSearchParams.toString();
        }, []);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    // Handle data change in edit mode
    const handleDataChange = (rowId: number, field: string, value: string) => {
        setEditingData(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [field]: value
            }
        }));
    };

    // Handle shift type change - auto update start/end time
    const handleShiftTypeChange = (rowId: number, shiftType: string) => {
        const defaultTime = getDefaultShiftTime(shiftType);
        setEditingData(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                shift_type: shiftType,
                custom_start_time: defaultTime.start,
                custom_end_time: defaultTime.end
            }
        }));
    };

    // Toggle edit mode
    const toggleEditMode = () => {
        if (isEditMode) {
            // Save changes
            saveChanges();
        } else {
            // Enter edit mode
            setIsEditMode(true);
            // Initialize editing data with current data
            const initialData: Record<number, any> = {};
            driverShiftData?.items?.forEach((item: any) => {
                if (item.shifts?.[0]) {
                    const shift = item.shifts[0];
                    initialData[item.id] = {
                        shift_type: shift.shift_type,
                        custom_start_time: shift.custom_start_time,
                        custom_end_time: shift.custom_end_time,
                        location_id: shift.location_id ? shift.location_id.toString() : "0", // Default to "Semua Cabang Transgo" (id: 0)
                        notes: shift.notes || ""
                    };
                } else {
                    // Driver without shift - initialize with default values
                    initialData[item.id] = {
                        shift_type: "shift_pagi",
                        custom_start_time: "07:00",
                        custom_end_time: "15:00",
                        location_id: "0", // Default to "Semua Cabang Transgo" (id: 0)
                        notes: ""
                    };
                }
            });
            setEditingData(initialData);
        }
    };

    // Save changes - only PATCH existing shifts, no POST/DELETE
    const saveChanges = async () => {
        try {
            let hasChanges = false;
            let driversWithoutShift = 0;
            
            // Save each modified row
            for (const [rowId, changes] of Object.entries(editingData)) {
                // Find the driver
                const driver = driverShiftData?.items?.find((item: any) => item.id === parseInt(rowId));
                const shiftId = driver?.shifts?.[0]?.id;
                
                // Only process if driver has existing shift (shiftId exists)
                if (!shiftId) {
                    driversWithoutShift++;
                    continue;
                }
                
                // Check if there are actual changes by comparing with original data
                const originalShift = driver.shifts[0];
                const hasActualChanges = (
                    changes.shift_type !== originalShift.shift_type ||
                    changes.location_id !== originalShift.location_id?.toString() ||
                    changes.custom_start_time !== originalShift.custom_start_time ||
                    changes.custom_end_time !== originalShift.custom_end_time ||
                    changes.notes !== (originalShift.notes || "")
                );
                
                if (!hasActualChanges) {
                    continue;
                }
                
                // Check if location_id is valid
                if (!changes.location_id || changes.location_id === 'undefined') {
                    continue;
                }
                
                // Prepare payload according to backend format
                // Ensure time format is HH:MM (24-hour format)
                const formatTime = (time: string) => {
                    if (!time) return null;
                    // If time is already in HH:MM format, return as is
                    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
                        return time;
                    }
                    // If time is in HH:MM:SS format, remove seconds
                    if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time)) {
                        return time.substring(0, 5);
                    }
                    return null;
                };
                
                const payload = {
                    shift_type: changes.shift_type,
                    location_id: parseInt(changes.location_id),
                    custom_start_time: formatTime(changes.custom_start_time),
                    custom_end_time: formatTime(changes.custom_end_time),
                    notes: changes.notes || ""
                };
                
                // PATCH existing shift
                try {
                    await axiosAuth.patch(`/driver-shifts/${shiftId}`, payload);
                    hasChanges = true;
                } catch (patchError) {
                    throw patchError;
                }
            }
            
            if (!hasChanges) {
                setIsEditMode(false);
                setEditingData({});
                return;
            }
            
            // Reset edit mode
            setIsEditMode(false);
            setEditingData({});
            
            // Show success message
            toast({
                title: "Berhasil",
                description: "Perubahan jadwal shift berhasil disimpan",
                variant: "default"
            });
            
            // Refetch data
            await refetchDriverShift();
            
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Unknown error";
            toast({
                title: "Error",
                description: `Gagal menyimpan perubahan: ${errorMessage}`,
                variant: "destructive"
            });
        }
    };

    // Fetch data based on active tab
    React.useEffect(() => {
        if (activeTab === "driver-shift") {
            refetchDriverShift();
        } else if (activeTab === "driver-reports") {
            refetchDriverReport();
        }
    }, [activeTab, refetchDriverShift, refetchDriverReport]);

    // Fetch data when search query or date filter changes
    React.useEffect(() => {
        if (activeTab === "driver-shift") {
            refetchDriverShift();
        } else if (activeTab === "driver-reports") {
            refetchDriverReport();
        }
    }, [searchDebounce, singleDate, refetchDriverShift, refetchDriverReport]);

    // Initial fetch
    React.useEffect(() => {
        if (activeTab === "driver-shift") {
            refetchDriverShift();
        }
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`${pathname}?${createQueryString({ type: value, page: 1 })}`);
    };

    const lists = [
        {
            name: "Driver Shift",
            value: "driver-shift",
        },
        {
            name: "Driver Reports",
            value: "driver-reports",
        },
    ];


    return (
        <>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <div className="flex items-end justify-between gap-4 flex-wrap mt-4">
                <TabsList>
                    {lists.map((list) => (
                        <TabsTrigger key={list.value} value={list.value}>
                            {list.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
                    
                    <div className="flex items-end gap-4 flex-wrap">
                        <SearchInput
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            placeholder="Cari Driver Shift"
                        />
                        
                        {/* Single Date Filter */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="date-filter" className="text-sm font-medium text-gray-700">Tanggal</label>
                            <input
                                id="date-filter"
                                name="date-filter"
                                type="date"
                                value={singleDate}
                                onChange={(e) => setSingleDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        {/* Edit Button */}
                        {activeTab === "driver-shift" && (
                            <div className="flex gap-2">
                                {isEditMode && (
                                    <Button 
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setEditingData({});
                                        }}
                                        variant="outline"
                                        className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                                    >
                                        ✕ Cancel
                                    </Button>
                                )}
                            <Button 
                                    onClick={() => {
                                        if (isEditMode) {
                                            saveChanges();
                                        } else {
                                            toggleEditMode();
                                        }
                                    }}
                                variant={isEditMode ? "default" : "outline"}
                                    className={`${
                                        isEditMode 
                                            ? "bg-green-600 hover:bg-green-700 text-white" 
                                            : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                    }`}
                            >
                                {isEditMode ? "Simpan" : "Edit Data"}
                            </Button>
                            </div>
                        )}
                    </div>
                </div>
                <TabsContent value="driver-shift">
                    {isFetchingDriverShift && <Spinner />}
                    {!isFetchingDriverShift && driverShiftData && (
                        <DriverShiftTable
                            columns={getDriverShiftColumns(
                                isEditMode, 
                                handleDataChange,
                                editingData,
                                locationsData || [], // locations data
                                ["shift_pagi", "shift_middle", "shift_sore", "full_shift", "libur"],
                                handleShiftTypeChange
                            )}
                            data={driverShiftData.items}
                            searchKey="name"
                            totalUsers={driverShiftData.meta?.total_items || 0}
                            pageCount={driverShiftData.pagination?.total_page || 0}
                            pageNo={page}
                        />
                    )}
                </TabsContent>
                <TabsContent value="driver-reports">
                    {isFetchingDriverReport && <Spinner />}
                    {!isFetchingDriverReport && driverShiftReportData && (
                        <DriverShiftTable
                            columns={columnsDriverReports}
                            data={driverShiftReportData.items}
                            searchKey="name"
                            totalUsers={driverShiftReportData.meta?.total_items || 0}
                            pageCount={driverShiftReportData.pagination?.total_page || 0}
                            pageNo={page}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </>
    );
};

export default DriverShiftTableWrapper;