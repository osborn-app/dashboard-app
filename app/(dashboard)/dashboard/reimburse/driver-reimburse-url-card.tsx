"use client";

import { useToast } from "@/components/ui/use-toast";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function DriverReimburseUrlCard() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/driver-reimburse`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      variant: "success",
      title: "Link berhasil disalin!",
      description: "Link form reimburse driver sudah tersalin ke clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">
            📋 Form Reimburse Driver
          </h3>
          <p className="text-xs text-blue-700 mb-3">
            Bagikan link ini ke driver untuk mengisi form reimburse
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border border-blue-200 rounded px-3 py-2 text-sm text-blue-900 font-mono overflow-x-auto">
              {typeof window !== 'undefined' ? `${window.location.origin}/driver-reimburse` : '/driver-reimburse'}
            </code>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 ${
                copied 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white text-sm rounded transition-colors whitespace-nowrap flex items-center gap-2`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Salin Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

