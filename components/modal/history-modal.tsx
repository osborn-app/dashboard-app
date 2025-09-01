"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, User, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useGetAuditLogsByTableAndRecord } from "@/hooks/api/useAuditLogs";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  tableName?: string;
}

interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  user_name: string;
  created_at: string;
  old_data?: any;
  new_data?: any;
  change_data?: any;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  orderId,
  tableName = 'orders',
}) => {
  const { data: auditLogsData, isLoading: loading, error } = useGetAuditLogsByTableAndRecord(
    tableName,
    orderId,
    {
      limit: 50,
      order_by: 'created_at',
      order_direction: 'DESC'
    },
    {
      enabled: isOpen && !!orderId,
    }
  );

  const auditLogs = auditLogsData?.data || [];

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'Dibuat';
      case 'UPDATE':
        return 'Diupdate';
      case 'DELETE':
        return 'Dihapus';
      default:
        return action;
    }
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      case 'DELETE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: id });
    } catch {
      return dateString;
    }
  };

  const parseJsonData = (data: string) => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const renderDataChanges = (oldData: any, newData: any) => {
    if (!oldData || !newData) return null;

    const old = parseJsonData(oldData);
    const new_ = parseJsonData(newData);
    
    if (!old || !new_) return null;

    const changes: string[] = [];

    // Check for common field changes
    if (old.customer_id !== new_.customer_id) {
      changes.push(`Customer ID: ${old.customer_id} → ${new_.customer_id}`);
    }
    if (old.fleet_id !== new_.fleet_id) {
      changes.push(`Fleet ID: ${old.fleet_id} → ${new_.fleet_id}`);
    }
    if (old.product_id !== new_.product_id) {
      changes.push(`Product ID: ${old.product_id} → ${new_.product_id}`);
    }
    if (old.start_date !== new_.start_date) {
      changes.push(`Start Date: ${old.start_date} → ${new_.start_date}`);
    }
    if (old.duration !== new_.duration) {
      changes.push(`Duration: ${old.duration} → ${new_.duration}`);
    }
    if (old.total_price !== new_.total_price) {
      changes.push(`Total Price: ${old.total_price} → ${new_.total_price}`);
    }
    if (old.status !== new_.status) {
      changes.push(`Status: ${old.status} → ${new_.status}`);
    }

    return changes.length > 0 ? (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Perubahan:</h4>
        <ul className="space-y-1">
          {changes.map((change, index) => (
            <li key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              {change}
            </li>
          ))}
        </ul>
      </div>
    ) : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
                   <DialogTitle className="flex items-center gap-2">
           <Clock className="h-5 w-5" />
           Riwayat Perubahan {tableName === 'orders' ? 'Order' : 'Product Order'}
         </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error: {error.message || 'Gagal memuat riwayat perubahan'}
            </div>
          ) : auditLogs.length === 0 ? (
                         <div className="text-center py-8 text-gray-500">
               Belum ada riwayat perubahan untuk {tableName === 'orders' ? 'order' : 'product order'} ini
             </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {auditLogs.map((log: AuditLog, index: number) => (
                  <div key={log.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={getActionVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{log.user_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(log.created_at)}
                      </div>
                    </div>

                    {log.action === 'UPDATE' && (
                      <>
                        <Separator className="my-3" />
                        {renderDataChanges(log.old_data, log.new_data)}
                      </>
                    )}

                    {log.action === 'CREATE' && log.new_data && (
                      <>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Data Awal:</h4>
                            <div className="text-xs text-gray-600 bg-green-50 p-2 rounded">
                             <FileText className="h-4 w-4 inline mr-2" />
                             {tableName === 'orders' ? 'Order' : 'Product Order'} berhasil dibuat
                           </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
