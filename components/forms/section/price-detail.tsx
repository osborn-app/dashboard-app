import { Icons } from "@/components/icons";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import dayjs from "dayjs";
import { ChevronDown, EyeIcon, Info, Link2 } from "lucide-react";
import { parseVoucherCode, getVoucherColorClass } from "@/lib/voucher-utils";

interface PriceDetailProps {
  form: any;
  detail: any;
  handleOpenApprovalModal: () => void;
  handleOpenRejectModal: () => void;
  showServicePrice: boolean;
  showAdditional: boolean;
  isEdit: boolean;
  initialData: any;
  confirmLoading: boolean;
  rejectLoading?: boolean;
  type?: string;
  messages?: any;
  innerRef?: any;
}

const ProductPriceDetail: React.FC<PriceDetailProps> = ({
  form,
  detail,
  handleOpenApprovalModal,
  handleOpenRejectModal,
  showServicePrice,
  showAdditional,
  isEdit,
  initialData,
  confirmLoading,
  rejectLoading,
  type,
  messages,
  innerRef,
}) => {
  // Watch discount field for real-time updates
  const discountValue = form.watch("discount");
  return (
    <div
      className="p-5 top-10 border rounded-md w-full basis-1/3"
      id="detail-sidebar"
      ref={innerRef}
    >
      <div className="">
        <h4 className="text-center font-semibold text-xl mb-4 mt-4">
          Rincian Harga{" "}
          {type === "product" 
            ? "Product Order"
            : form.getValues("is_with_driver") ? "Dengan Supir" : "Lepas Kunci"
          }
        </h4>
        <div className="flex flex-col justify-between gap-8 h-full">
          <div className="overflow-auto">
            <div className="border border-neutral-200 rounded-md p-[10px] mb-4 ">
              {type === "product" ? (
                <>
                  <p className="font-medium text-sm text-neutral-700 mb-1">
                    Nama Product
                  </p>
                  <div className="flex justify-between mb-1">
                    <p className="font-medium text-sm text-neutral-700">
                      {detail?.product?.name || initialData?.product?.name || detail?.product_name
                        ? `${detail?.product?.name || initialData?.product?.name || detail?.product_name} (per hari)`
                        : "Product"}
                    </p>
                    <p className="font-semibold text-base">
                      {formatRupiah(detail?.rent_price || detail?.product?.price || detail?.product_price || 0)}
                    </p>
                  </div>

                  {detail?.product && form.getValues("duration") && detail?.total_rent_price && (
                    <div className="flex justify-between mb-1">
                      <p className="font-medium text-sm text-neutral-700">
                        {form.getValues("duration")} Hari
                      </p>
                      <p className="font-semibold text-base">
                        {formatRupiah(detail?.total_rent_price)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {type !== "product" && form.getValues("is_with_driver") && (
                    <>
                      <p className="font-medium text-sm text-neutral-700">
                        Dengan Supir
                      </p>
                      <div className="flex justify-between">
                        <p className="font-medium text-sm text-neutral-700">
                          {form.getValues("is_out_of_town")
                            ? "Luar Kota"
                            : "Dalam Kota"}
                        </p>
                        <p className="font-semibold text-base">
                          {formatRupiah(detail?.total_driver_price ?? 0)}
                        </p>
                      </div>
                    </>
                  )}

                  {type !== "product" && (
                    <>
                      <p className="font-medium text-sm text-neutral-700 mb-1">
                        Nama Armada
                      </p>
                      <div className="flex justify-between mb-1">
                        <p className="font-medium text-sm text-neutral-700">
                          {detail?.fleet?.name
                            ? `${detail?.fleet?.name} (per 24 jam)`
                            : "Armada"}
                        </p>
                        <p className="font-semibold text-base">
                          {formatRupiah(detail?.fleet?.price ?? 0)}
                        </p>
                      </div>

                      {detail?.fleet && (
                        <div className="flex justify-between mb-1">
                          <p className="font-medium text-sm text-neutral-700">
                            {form.getValues("duration")} Hari
                          </p>
                          <p className="font-semibold text-base">
                            {formatRupiah(detail?.total_rent_price)}
                          </p>
                        </div>
                                             )}
                     </>
                   )}
                 </>
               )}
              <Separator className="mb-1" />
              {/* Voucher Input */}
              <div className="mb-2">
                <p className="font-medium text-sm text-neutral-700 mb-1">
                  Kode Voucher
                </p>
                <Input
                  placeholder="Masukkan kode voucher"
                  disabled={!isEdit}
                  className="uppercase"
                  value={form.getValues("voucher_code") || ""}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase();
                    form.setValue("voucher_code", upperValue);
                  }}
                />
                {/* Applied voucher info */}
                {detail?.applied_voucher_code && detail?.voucher_discount < 0 && (
                  <div className="flex justify-between mt-2">
                    <p className="font-medium text-sm text-neutral-700">
                      Potongan Voucher ({detail?.applied_voucher_code})
                    </p>
                    <p className="font-semibold text-base text-green-600">
                      {formatRupiah(detail?.voucher_discount)}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Voucher Detail Section */}
              {(detail?.applied_voucher_code || form.getValues("voucher_code")) && (
                <div className="mb-4">
                  <div className="border border-neutral-200 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📋</span>
                      <h5 className="font-semibold text-neutral-900">Detail Voucher</h5>
                    </div>
                    
                    {(() => {
                      const voucherCode = detail?.applied_voucher_code || form.getValues("voucher_code");
                      const voucherInfo = parseVoucherCode(voucherCode);
                      const colorClass = getVoucherColorClass(voucherInfo.color);
                      
                      return (
                        <div className={`p-3 rounded-lg border ${colorClass}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{voucherInfo.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{voucherInfo.benefit}</p>
                                <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium">
                                  {voucherInfo.type}
                                </span>
                              </div>
                              <p className="text-sm opacity-80">{voucherInfo.description}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                                {voucherCode}
                              </span>
                              <span className="text-xs opacity-70">
                                {detail?.applied_voucher_code ? 'Digunakan' : 'Belum Diterapkan'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              {type !== "product" && form.getValues("is_out_of_town") && (
                <>
                  <p className="font-medium text-sm text-neutral-700 mb-1">
                    Pemakaian
                  </p>
                  <div className="flex justify-between mb-1">
                    <p className="font-medium text-sm text-neutral-700">
                      Luar Kota
                    </p>
                    <p className="font-semibold text-base">
                      {formatRupiah(detail?.out_of_town_price ?? 0)}
                    </p>
                  </div>

                  <Separator className="mb-1" />
                </>
              )}
              {(showServicePrice || showAdditional) && (
                <p className="font-medium text-sm text-neutral-700 mb-1">
                  Biaya Layanan
                </p>
              )}
              {showServicePrice &&
                (!form.getValues("start_request.is_self_pickup") ||
                  !form.getValues("end_request.is_self_pickup")) && (
                  <div className="flex justify-between mb-1">
                    <p className="font-medium text-sm text-neutral-700">
                      {!form.getValues("start_request.is_self_pickup") &&
                      !form.getValues("end_request.is_self_pickup")
                        ? "Diantar & Dijemput"
                        : !form.getValues("start_request.is_self_pickup")
                        ? "Diantar"
                        : "Dijemput"}
                    </p>
                    <p className="font-semibold text-base">
                      {formatRupiah(detail?.service_price ?? 0)}
                    </p>
                  </div>
                )}
              {showAdditional && isEdit
                ? detail?.additional_services?.length !== 0 &&
                  detail?.additional_services?.map((item: any, index: any) => {
                    return (
                      <div className="flex justify-between mb-1" key={index}>
                        <p className="font-medium text-sm text-neutral-700">
                          {item.name}
                        </p>
                        <p className="font-semibold text-base">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                    );
                  })
                : initialData?.additional_services?.length !== 0 &&
                  initialData?.additional_services?.map(
                    (item: any, index: any) => {
                      return (
                        <div className="flex justify-between mb-1" key={index}>
                          <p className="font-medium text-sm text-neutral-700">
                            {item.name}
                          </p>
                          <p className="font-semibold text-base">
                            {formatRupiah(item.price)}
                          </p>
                        </div>
                      );
                    },
                  )}
              {(showAdditional || showServicePrice) && (
                <Separator className="mb-1" />
              )}
              
              {/* Display addons as separate section */}
              {(detail?.addons?.length > 0 || initialData?.addons?.length > 0) && (
                <>
                  <p className="font-medium text-sm text-neutral-700 mb-1">
                    Aksesoris Tambahan
                  </p>
                  {(detail?.addons || initialData?.addons)?.map((addon: any, index: any) => {
                    return (
                      <div className="flex justify-between mb-1" key={index}>
                        <p className="font-medium text-sm text-neutral-700">
                          {addon.name} (x{addon.quantity})
                        </p>
                        <p className="font-semibold text-base">
                          {formatRupiah(addon.price * addon.quantity)}
                        </p>
                      </div>
                    );
                  })}
                  <Separator className="mb-1" />
                </>
              )}
              
              {detail?.insurance && (
                <>
                  <p className="font-medium text-sm text-neutral-700 mb-1">
                    Biaya Asuransi
                  </p>
                  <div className="flex justify-between mb-1">
                    <p className="font-medium text-sm text-neutral-700">
                      {detail?.insurance?.name ?? "Tidak ada"}
                    </p>
                    <p className="font-semibold text-base">
                      {formatRupiah(detail?.insurance?.price ?? 0)}
                    </p>
                  </div>
                </>
              )}
              {type !== "product" && detail?.weekend_days?.length >= 1 && detail?.fleet && (
                <>
                  <p className="font-medium text-sm text-neutral-700 mb-1">
                    Harga Akhir Pekan
                  </p>
                  <div className="flex justify-between mb-1">
                    {detail?.weekend_days.length == 1 ? (
                      <p className="font-medium text-sm text-neutral-700">
                        {dayjs(detail?.weekend_days)
                          .locale("id")
                          .format("dddd, D MMMM YYYY")}
                      </p>
                    ) : (
                      <div className="flex">
                        <p className="font-medium text-sm text-neutral-700 mr-4">
                          {detail?.weekend_days.length} Hari
                        </p>
                        <DropdownWeekend
                          days={detail?.weekend_days}
                          weekendPrice={detail?.weekend_price}
                        />
                      </div>
                    )}
                    <p className="font-semibold text-base">
                      {formatRupiah(
                        (detail?.weekend_days?.length || 0) * (detail?.weekend_price || 0),
                      )}
                    </p>
                  </div>
                </>
              )}
              <Separator className="mb-1" />
              <div className="flex justify-between mb-1">
                <p className="font-medium text-sm text-neutral-700">Subtotal</p>
                <p className="font-semibold text-base">
                  {formatRupiah(detail?.sub_total ?? 0)}
                </p>
              </div>
            </div>
            <div className="border border-neutral-200 rounded-md p-[10px] ">
              <p className="text-base font-semibold mb-3 text-neutral-700 ">
                Diskon
              </p>
                             <div className="relative mb-1">
                 <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2 ">
                   %
                 </span>
                 <Input
                   disabled={!isEdit}
                   type="number"
                   className="pr-4"
                   value={discountValue ?? 0}
                   onChange={(e) => {
                     const value = e.target.valueAsNumber;
                     form.setValue("discount", 
                       isNaN(value) ? 0 : Math.max(0, Math.min(100, value))
                     );
                   }}
                   max={100}
                   min={0}
                 />
               </div>
              <div className="flex justify-between mb-1">
                <p className="font-medium text-sm text-neutral-700">
                  Potongan Diskon
                </p>
                <p className="font-semibold text-base">
                  {formatRupiah(detail?.discount ?? 0)}
                </p>
              </div>
              <Separator className="mb-1" />
              <div className="flex justify-between mb-1">
                <p className="font-medium text-sm text-neutral-700">
                  Total Sebelum Pajak
                </p>
                <p className="font-semibold text-base">
                  {formatRupiah(detail?.total ?? 0)}
                </p>
              </div>
              <div className="flex justify-between mb-1">
                <p className="font-medium text-sm text-neutral-700">
                  Pajak (2,5%)
                </p>
                <p className="font-semibold text-base">
                  {formatRupiah(detail?.tax ?? 0)}
                </p>
              </div>
              <Separator className="mb-1" />
              <div className="flex justify-between mb-1">
                <p className="font-medium text-sm text-neutral-700">
                  Total Pembayaran
                </p>
                <p className="font-semibold text-base">
                  {formatRupiah(detail?.grand_total ?? 0)}
                </p>
              </div>
            </div>
          </div>
          {type === "preview" && initialData?.status === "pending" && (
            <div className="flex flex-col gap-5   bottom-1">
              <div className="flex bg-neutral-100 p-4 gap-5 rounded-md">
                <Info className="h-10 w-10" />
                <p>
                  Invoice akan tersedia saat pesanan telah dikonfirmasi.
                  Pastikan semua data benar.
                </p>
              </div>
              <Button
                onClick={handleOpenRejectModal}
                className="w-full bg-red-50 text-red-500 hover:bg-red-50/90"
                type="button"
                disabled={rejectLoading}
              >
                {rejectLoading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  "Tolak Pesanan"
                )}
              </Button>
              <Button
                onClick={handleOpenApprovalModal}
                className="w-full  bg-main hover:bg-main/90"
                type="button"
                disabled={confirmLoading}
              >
                {confirmLoading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  "Konfirmasi Pesanan"
                )}
              </Button>
            </div>
          )}

          {type === "create" && (
            <div className="flex flex-col gap-5   bottom-1">
              <div className="flex bg-neutral-100 p-4 gap-5 rounded-md ">
                <Info className="h-10 w-10" />
                <p>
                  Invoice akan tersedia saat pesanan telah dikonfirmasi.
                  Pastikan semua data benar.
                </p>
              </div>
              <Button
                onClick={handleOpenApprovalModal}
                className="w-full  bg-main hover:bg-main/90"
                type="button"
                disabled={confirmLoading}
              >
                {confirmLoading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  "Konfirmasi Pesanan"
                )}
              </Button>
            </div>
          )}
          {(type === "detail" || type === "edit") &&
            initialData?.status !== "pending" &&
            initialData?.payment_pdf_url &&
            initialData?.payment_link && (
              <div className="flex items-center justify-between w-full border border-neutral-200 rounded-lg p-1   bottom-1">
                <div className="flex gap-4">
                  <div className="p-2 border border-slate-200 rounded-lg bg-neutral-50">
                    <Icons.pdf />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-700">
                      {initialData?.invoice_number}
                    </span>
                    <span className="text-sm font-medium text-neutral-700">
                      PDF
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-2">
                  <a
                    href={`https://${initialData?.payment_link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Link2 className="text-[#1F61D9]" />
                  </a>
                </div>
                <div className="p-2 border border-slate-200 rounded-lg">
                  <a
                    href={`https://${initialData?.payment_pdf_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <EyeIcon />
                  </a>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductPriceDetail;

interface DropdownWeekendProps {
  days: string[];
  weekendPrice?: number;
}

const DropdownWeekend: React.FC<DropdownWeekendProps> = ({
  days,
  weekendPrice,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {days?.map((day, index) => (
          <DropdownMenuItem key={index} className="justify-between w-[224px]">
            <p>{dayjs(day).locale("id").format("D MMMM YYYY")}</p>
            <span className="text-slate-500">
              {formatRupiah(weekendPrice as number)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
