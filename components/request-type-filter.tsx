"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestTypeFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

const RequestTypeFilter = ({ value, onValueChange }: RequestTypeFilterProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Pilih Tipe Request" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Request</SelectItem>
        <SelectItem value="product">Product Orders</SelectItem>
        <SelectItem value="fleet">Fleet Orders</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default RequestTypeFilter;
