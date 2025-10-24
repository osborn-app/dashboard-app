"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MessageCircle, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomerRanking } from "@/hooks/api/use-customer-ranking";

interface CustomerActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRanking | null;
}

export const CustomerActionModal: React.FC<CustomerActionModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleWhatsAppContact = () => {
    if (customer?.customer_phone) {
      // Format phone number for WhatsApp (remove any non-digit characters except +)
      const phoneNumber = customer.customer_phone.replace(/[^\d+]/g, '');
      // Open WhatsApp with the phone number
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      window.open(whatsappUrl, '_blank');
    }
    onClose();
  };

  const handleViewDetails = () => {
    if (customer?.customer_id) {
      router.push(`/dashboard/customers/${customer.customer_id}`);
    }
    onClose();
  };

  const getCustomerDisplayName = (customer: CustomerRanking) => {
    if (customer.customer_name) return customer.customer_name;
    if (customer.customer_email) return customer.customer_email;
    if (customer.customer_phone) return customer.customer_phone;
    return "Unknown Customer";
  };

  return (
    <Modal
      title="Pilih Aksi"
      description={`Apa yang ingin Anda lakukan dengan ${customer ? getCustomerDisplayName(customer) : 'customer ini'}?`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 space-y-4">
        {/* WhatsApp Contact Button */}
        <Button
          variant="outline"
          className="w-full justify-start h-12 text-left"
          onClick={handleWhatsAppContact}
          disabled={!customer?.customer_phone}
        >
          <MessageCircle className="mr-3 h-5 w-5 text-green-600" />
          <div className="flex flex-col items-start">
            <span className="font-medium">Hubungi CS via WhatsApp</span>
            <span className="text-xs text-muted-foreground">
              {customer?.customer_phone ? customer.customer_phone : 'Nomor telepon tidak tersedia'}
            </span>
          </div>
        </Button>

        {/* View Details Button */}
        <Button
          variant="outline"
          className="w-full justify-start h-12 text-left"
          onClick={handleViewDetails}
          disabled={!customer?.customer_id}
        >
          <User className="mr-3 h-5 w-5 text-blue-600" />
          <div className="flex flex-col items-start">
            <span className="font-medium">Lihat Detail Customer</span>
            <span className="text-xs text-muted-foreground">
              {customer?.customer_id ? `ID: ${customer.customer_id}` : 'ID customer tidak tersedia'}
            </span>
          </div>
        </Button>

        {/* Cancel Button */}
        <div className="pt-4 flex justify-end">
          <Button
            variant="destructive"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  );
};
