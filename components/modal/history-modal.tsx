"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, User, FileText, Calendar, ArrowRight, Plus, Minus, ChevronDown, ChevronRight } from "lucide-react";
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
  old_data?: string;
  new_data?: string;
  change_data?: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  orderId,
  tableName = 'orders',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  const auditLogs = auditLogsData?.items || [];

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedItems(newExpanded);
  };

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

  const formatFieldName = (fieldName: string) => {
    const fieldMap: { [key: string]: string } = {
      'customer_id': 'Customer ID',
      'fleet_id': 'ID Armada',
      'product_id': 'Product ID',
      'start_date': 'Tanggal Mulai',
      'duration': 'Durasi',
      'total_price': 'Total Harga',
      'status': 'Status',
      'payment_status': 'Status Pembayaran',
      'updated_at': 'Waktu Update',
      'addons': 'Add-ons',
      'additional_services': 'Layanan Tambahan'
    };
    
    return fieldMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderChangeData = (changeData: string) => {
    if (!changeData) return null;

    try {
      const changes = JSON.parse(changeData);
      const changeEntries = Object.entries(changes);

      if (changeEntries.length === 0) return null;

      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Detail Perubahan:
          </h4>
          <div className="space-y-2">
            {changeEntries.map(([field, change], index) => {
              const fieldLabel = formatFieldName(field);
              
              if (typeof change === 'string' && change.includes('→')) {
                // Simple change format: "old → new"
                const [oldValue, newValue] = change.split(' → ');
                return (
                  <div key={index} className="text-xs bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                    <div className="font-medium text-gray-800 mb-1">{fieldLabel}</div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        {oldValue === 'null' ? 'Tidak ada' : oldValue}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        {newValue === 'null' ? 'Tidak ada' : newValue}
                      </span>
                    </div>
                  </div>
                );
              } else if (typeof change === 'object' && change !== null && 'from' in change && 'to' in change) {
                // Object change format: {"from": old, "to": new}
                const changeObj = change as { from: any; to: any };
                
                // Special handling for arrays (like addons, additional_services)
                const renderArrayValue = (value: any) => {
                  if (Array.isArray(value)) {
                    if (value.length === 0) return 'Tidak ada';
                    return `${value.length} item(s)`;
                  }
                  return value === null ? 'Tidak ada' : String(value);
                };

                // Special rendering for array changes
                const renderArrayChange = (fromValue: any, toValue: any) => {
                  if (Array.isArray(fromValue) || Array.isArray(toValue)) {
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                            {Array.isArray(fromValue) ? `${fromValue.length} item(s)` : 'Tidak ada'}
                          </span>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                            {Array.isArray(toValue) ? `${toValue.length} item(s)` : 'Tidak ada'}
                          </span>
                        </div>
                        
                        {/* Show detailed changes for arrays */}
                        {Array.isArray(fromValue) && fromValue.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <div className="font-medium mb-1">Sebelum:</div>
                            <div className="space-y-1">
                              {fromValue.map((item: any, idx: number) => (
                                <div key={idx} className="bg-red-50 p-2 rounded text-xs">
                                  {item.name || item.addon_id || `Item ${idx + 1}`}
                                  {item.price && ` - Rp ${item.price.toLocaleString('id-ID')}`}
                                  {item.quantity && ` (${item.quantity}x)`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {Array.isArray(toValue) && toValue.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <div className="font-medium mb-1">Sesudah:</div>
                            <div className="space-y-1">
                              {toValue.map((item: any, idx: number) => (
                                <div key={idx} className="bg-green-50 p-2 rounded text-xs">
                                  {item.name || item.addon_id || `Item ${idx + 1}`}
                                  {item.price && ` - Rp ${item.price.toLocaleString('id-ID')}`}
                                  {item.quantity && ` (${item.quantity}x)`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        {renderArrayValue(changeObj.from)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        {renderArrayValue(changeObj.to)}
                      </span>
                    </div>
                  );
                };
                
                                  return (
                    <div key={index} className="text-xs bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                      <div className="font-medium text-gray-800 mb-1">{fieldLabel}</div>
                      {renderArrayChange(changeObj.from, changeObj.to)}
                    </div>
                  );
              } else {
                // Fallback for other formats
                return (
                  <div key={index} className="text-xs bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-800 mb-1">{fieldLabel}</div>
                    <div className="text-gray-600">
                      {JSON.stringify(change)}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error parsing change data:', error);
      return (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Error parsing perubahan data
        </div>
      );
    }
  };

  const renderDataSummary = (data: string, type: 'old' | 'new') => {
    if (!data) return null;

    try {
      const parsedData = JSON.parse(data);
      const label = type === 'old' ? 'Data Sebelumnya' : 'Data Baru';
      const bgColor = type === 'old' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
      const textColor = type === 'old' ? 'text-red-700' : 'text-green-700';

      return (
        <div className={`text-xs ${bgColor} p-3 rounded border-l-4 ${type === 'old' ? 'border-red-200' : 'border-green-200'}`}>
          <div className={`font-medium ${textColor} mb-2`}>{label}</div>
          <div className="space-y-1">
            {Object.entries(parsedData).map(([key, value]) => {
              if (key === 'id' || key === 'created_at' || key === 'updated_at') return null;
              
              const fieldLabel = formatFieldName(key);
              let displayValue = value;
              
              if (key === 'start_date' && value && typeof value === 'string') {
                try {
                  displayValue = format(new Date(value), 'dd MMM yyyy HH:mm', { locale: id });
                } catch {
                  displayValue = value;
                }
              } else if (key === 'total_price' && value && typeof value === 'number') {
                displayValue = `Rp ${value.toLocaleString('id-ID')}`;
              } else if (key === 'addons' && Array.isArray(value)) {
                displayValue = value.length > 0 ? `${value.length} addon(s)` : 'Tidak ada';
              } else if (key === 'additional_services' && Array.isArray(value)) {
                displayValue = value.length > 0 ? `${value.length} layanan` : 'Tidak ada';
              }

              return (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{fieldLabel}:</span>
                  <span className="font-medium">{String(displayValue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Error parsing data
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
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
            <ScrollArea className="h-[70vh]">
              <div className="space-y-3 pr-4">
                {auditLogs.map((log: AuditLog, index: number) => {
                  const isExpanded = expandedItems.has(log.id);
                  
                  return (
                    <div key={log.id} className="border rounded-lg bg-white overflow-hidden">
                      {/* Header - Always visible */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExpanded(log.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={getActionVariant(log.action)}>
                              {getActionLabel(log.action)}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{log.user_name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              {formatDate(log.created_at)}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Content - Only visible when expanded */}
                      {isExpanded && (
                        <div className="border-t bg-gray-50 p-4 space-y-4">
                          {log.action === 'UPDATE' && (
                            <>
                              {log.change_data && renderChangeData(log.change_data)}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {log.old_data && renderDataSummary(log.old_data, 'old')}
                                {log.new_data && renderDataSummary(log.new_data, 'new')}
                              </div>
                            </>
                          )}

                          {log.action === 'CREATE' && log.new_data && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-green-600" />
                                Data Awal:
                              </h4>
                              {renderDataSummary(log.new_data, 'new')}
                            </div>
                          )}

                          {log.action === 'DELETE' && log.old_data && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Minus className="h-4 w-4 text-red-600" />
                                Data yang Dihapus:
                              </h4>
                              {renderDataSummary(log.old_data, 'old')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
