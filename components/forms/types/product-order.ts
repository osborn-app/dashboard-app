import { z } from "zod";

export interface ProductOrderFormProps {
  initialData?: any;
  isEdit?: boolean | null;
  isPreview?: boolean;
  productOrderId?: string;
  showHistoryButton?: boolean;
  onHistoryClick?: () => void;
}

export interface DetailPrice {
  sub_total_price: number;
  total_tax: number;
  total_price: number;
  discount_amount: number;
}

export const productOrderSchema = z.object({
  customer: z.string().min(1, "Customer is required").or(z.undefined()),
  product: z.string().min(1, "Product is required").or(z.undefined()),
  date: z.any(),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().optional(),
  discount: z.string().optional(),
  insurance_id: z.string().optional(),
  is_with_driver: z.boolean().optional(),
  is_out_of_town: z.boolean().optional(),
  service_price: z.string().optional(),
  rental_type: z.object({
    is_daily: z.boolean().default(true),
    is_weekly: z.boolean().default(false),
    is_monthly: z.boolean().default(false),
  }).optional(),
  selected_price_type: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  start_request: z.object({
    is_self_pickup: z.boolean(),
    driver_id: z.string().optional(),
    distance: z.union([z.string(), z.number()]).optional(),
    address: z.string().optional(),
  }),
  end_request: z.object({
    is_self_pickup: z.boolean(),
    driver_id: z.string().optional(),
    distance: z.union([z.string(), z.number()]).optional(),
    address: z.string().optional(),
  }),
  additionals: z.array(z.object({
    name: z.string().min(1, "deskripsi layanan"),
    price: z.string()
      .optional()
      .refine((val) => {
        // If value is empty or undefined, it's valid (will be filtered out later)
        if (!val || val.trim() === "") return true;
        
        // If value exists, validate it's a valid number (including negative numbers)
        const cleanVal = val.replace(/,/g, "");
        const num = Number(cleanVal);
        return !isNaN(num); // Allow negative numbers, just ensure it's a valid number
      }, { message: "Harga harus berupa angka yang valid" })
      .transform((val) => {
        // If value is empty or undefined, return undefined
        if (!val || val.trim() === "") return undefined;
        
        // Transform valid values to numbers (including negative)
        const cleanVal = val.replace(/,/g, "");
        const num = Number(cleanVal);
        return num;
      }),
  })).optional(),

}).refine((data) => {
  // Additional validation for required fields when creating
  if (!data.customer || !data.product || !data.date || !data.duration) {
    return false;
  }
  return true;
}, {
  message: "Please fill all required fields",
  path: ["form"]
});

export type ProductOrderFormValues = z.infer<typeof productOrderSchema>; 