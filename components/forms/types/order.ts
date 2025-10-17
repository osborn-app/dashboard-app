/**
 * file ini berisi type yang akan digunakan di Order Module
 *
 */

import { formSchema } from "../validation/orderSchema";
import { z } from "zod";

export type OrderFormValues = z.infer<typeof formSchema> & {
  service_price: string;
  start_request: {
    distance: number;
    address: string;
  };
  end_request: {
    distance: number;
    address: string;
  };
};

export interface OrderFormProps {
  initialData: any | null;
  isEdit?: boolean | null;
  showHistoryButton?: boolean;
  onHistoryClick?: () => void;
}

interface DetailFleet {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  type: string;
  color: string | null;
  plate_number: string;
  price: number;
}

interface DetailInsurance {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  price: number;
}

export interface DetailPrice {
  discount: number;
  driver_price: number;
  fleet: DetailFleet;
  grand_total: number;
  insurance: DetailInsurance;
  insurance_price: number;
  rent_price: number;
  service_price: number;
  sub_total: number;
  tax: number;
  total: number;
  total_driver_price: number;
  total_rent_price: number;
  total_weekend_price: number;
  weekend_days: any[];
  weekend_price: number;
  // Voucher fields from backend calculation
  applied_voucher_code?: string;
  applied_voucher_amount?: number;
  voucher_discount?: number;
}

export type Messages = {
  [key in keyof OrderFormValues]?: string;
} & {
  start_request?: {
    [key in keyof OrderFormValues["start_request"]]?: string | undefined;
  };
  end_request?: {
    [key in keyof OrderFormValues["end_request"]]?: string | undefined;
  };
};
