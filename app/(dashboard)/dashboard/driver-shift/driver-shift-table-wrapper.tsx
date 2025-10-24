"use client";
import { useGetDriverShifts, useGetDriverShiftReport, useEditDriverShift, useGetDriverShiftLocations, type ApiResponse, type DriverShift, type DriverShiftReport, type Location } from "@/hooks/api/useDrivershift";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {getDriverShiftColumns, columnsDriverReports} from "@/components/tables/driver-shift-tables/columns";
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
    const queryClient = useQueryClient();
    const axiosAuth = useAxiosAuth();

    const { data: driverShiftData, isFetching: isFetchingDriverShift, refetch: refetchDriverShift } = useGetDriverShifts({
        limit: pageLimit,
        page: page,
        q: searchDebounce,
    }, {
        enabled: false, // Disable automatic fetching
    });

    const { data: driverShiftReportData, isFetching: isFetchingDriverReport, refetch: refetchDriverReport } = useGetDriverShiftReport({
        limit: pageLimit,
        page: page,
        q: searchDebounce,
    }, {
        enabled: false, // Disable automatic fetching
    });

    // Hook untuk get locations
    const { data: locationsData } = useGetDriverShiftLocations();
    
    // Debug locations data
    React.useEffect(() => {
        console.log("Locations data:", locationsData);
    }, [locationsData]);

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
                    initialData[item.id] = {
                        shift_type: item.shifts[0].shift_type,
                        custom_start_time: item.shifts[0].custom_start_time,
                        custom_end_time: item.shifts[0].custom_end_time,
                        location_id: item.shifts[0].location_id,
                    };
                }
            });
            setEditingData(initialData);
        }
    };

    // Save changes
    const saveChanges = async () => {
        try {
            console.log("Saving changes:", editingData);
            
            // Save each modified row
            for (const [rowId, changes] of Object.entries(editingData)) {
                console.log(`Processing row ${rowId}:`, changes);
                
                // Find the shift ID for this driver
                const driver = driverShiftData?.items?.find((item: any) => item.id === parseInt(rowId));
                const shiftId = driver?.shifts?.[0]?.id;
                
                console.log(`Driver found:`, driver, `Shift ID:`, shiftId);
                
                if (shiftId && changes) {
                    // Use axios directly to update the shift
                    console.log(`Patching shift ${shiftId} with data:`, changes);
                    await axiosAuth.patch(`/driver-shifts/${shiftId}`, changes);
                }
            }
            
            // Reset edit mode
            setIsEditMode(false);
            setEditingData({});
            
            // Refetch data
            refetchDriverShift();
            
        } catch (error) {
            console.error("Error saving changes:", error);
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

    // Fetch data when search query changes
    React.useEffect(() => {
        if (activeTab === "driver-shift") {
            refetchDriverShift();
        } else if (activeTab === "driver-reports") {
            refetchDriverReport();
        }
    }, [searchDebounce, refetchDriverShift, refetchDriverReport]);

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
                <TabsList>
                    {lists.map((list) => (
                        <TabsTrigger key={list.value} value={list.value}>
                            {list.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="flex items-center justify-between gap-4 flex-wrap mt-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap w-full lg:!w-auto">
                        <SearchInput
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            placeholder="Cari Driver Shift"
                        />
                        {activeTab === "driver-shift" && (
                            <Button 
                                onClick={toggleEditMode}
                                variant={isEditMode ? "default" : "outline"}
                                className="ml-4"
                            >
                                {isEditMode ? "Simpan" : "Edit Data"}
                            </Button>
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
                                ["SHIFT_PAGI", "SHIFT_SIANG", "SHIFT_MALAM"]
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