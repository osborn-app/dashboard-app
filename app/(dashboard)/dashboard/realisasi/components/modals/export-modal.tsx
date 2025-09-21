"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Download, X } from "lucide-react";
import Swal from "sweetalert2";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'excel' | 'csv', exportType: 'all' | 'filtered') => void;
  isExporting?: boolean;
}

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting = false
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv' | null>(null);
  const [selectedExportType, setSelectedExportType] = useState<'all' | 'filtered'>('filtered');

  const handleExport = () => {
    if (!selectedFormat) {
      Swal.fire({
        title: "Peringatan!",
        text: "Silakan pilih format export terlebih dahulu",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#f59e0b",
        allowOutsideClick: true,
        allowEscapeKey: true,
      });
      return;
    }

    onExport(selectedFormat, selectedExportType);
  };

  const handleClose = () => {
    setSelectedFormat(null);
    setSelectedExportType('filtered');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="bg-blue-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data Transaksi
          </DialogTitle>
          <p className="text-blue-100 text-sm mt-1">
            Pilih format file untuk export data transaksi
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Pilih Data yang Diekspor:</h3>
            <div className="space-y-2">
              <div 
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedExportType === 'filtered' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedExportType('filtered')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedExportType === 'filtered' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedExportType === 'filtered' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Data Sesuai Filter</h4>
                    <p className="text-sm text-gray-600">Ekspor data berdasarkan pencarian, tanggal, dan kategori yang dipilih</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedExportType === 'all' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedExportType('all')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedExportType === 'all' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedExportType === 'all' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Semua Data</h4>
                    <p className="text-sm text-gray-600">Ekspor seluruh data transaksi tanpa filter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Pilih Format File:</h3>
            {/* Excel Option */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedFormat === 'excel' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFormat('excel')}
            >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                selectedFormat === 'excel' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Excel (.xlsx)</h3>
                <p className="text-sm text-gray-600">
                  Format spreadsheet dengan fitur lengkap, ideal untuk analisis data
                </p>
              </div>
              {selectedFormat === 'excel' && (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* CSV Option */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedFormat === 'csv' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedFormat('csv')}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                selectedFormat === 'csv' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">CSV (.csv)</h3>
                <p className="text-sm text-gray-600">
                  Format teks sederhana, kompatibel dengan semua aplikasi spreadsheet
                </p>
              </div>
              {selectedFormat === 'csv' && (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isExporting}
          >
            <X className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button 
            onClick={handleExport}
            disabled={!selectedFormat || isExporting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Mengekspor..." : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
