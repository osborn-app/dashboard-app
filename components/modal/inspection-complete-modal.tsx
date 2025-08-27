"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Upload, X, Camera } from "lucide-react";
import Spinner from "@/components/spinner";

interface InspectionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteWithoutPhoto: () => Promise<void>;
  onCompleteWithPhoto: (file: File) => Promise<void>;
  isLoading?: boolean;
}

type ModalState = "select-option" | "upload-photo";

export default function InspectionCompleteModal({
  isOpen,
  onClose,
  onCompleteWithoutPhoto,
  onCompleteWithPhoto,
  isLoading = false,
}: InspectionCompleteModalProps) {
  const [modalState, setModalState] = useState<ModalState>("select-option");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle complete without photo
  const handleCompleteWithoutPhoto = async () => {
    try {
      await onCompleteWithoutPhoto();
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  // Handle complete with photo
  const handleCompleteWithPhoto = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await onCompleteWithPhoto(selectedFile);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setUploading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setModalState("select-option");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onClose();
  };

  // Handle back to option selection
  const handleBackToOptions = () => {
    setModalState("select-option");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Selesai Inspeksi
          </DialogTitle>
        </DialogHeader>

        {modalState === "select-option" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pilih cara untuk menyelesaikan inspeksi:
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleCompleteWithoutPhoto}
                disabled={isLoading}
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Selesai Tanpa Foto
              </Button>

              <Button
                onClick={() => setModalState("upload-photo")}
                disabled={isLoading}
                variant="outline"
                className="w-full justify-start"
              >
                <Camera className="mr-2 h-4 w-4" />
                Upload Foto & Selesai
              </Button>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="ghost" onClick={handleClose}>
                Tutup
              </Button>
            </div>
          </div>
        )}

        {modalState === "upload-photo" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload foto hasil perbaikan untuk melengkapi inspeksi:
            </p>

            <div className="space-y-3">
              <div>
                <Label htmlFor="repair-photo" className="text-sm font-medium">
                  Pilih Foto Perbaikan
                </Label>
                <Input
                  id="repair-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer mt-1"
                  disabled={uploading}
                />
              </div>

              {/* Preview Image */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preview Foto:</Label>
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview foto perbaikan"
                      className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        URL.revokeObjectURL(previewUrl);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCompleteWithPhoto}
                disabled={!selectedFile || uploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {uploading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Selesai
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToOptions}
                disabled={uploading}
              >
                Batal
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={uploading}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
