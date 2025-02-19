import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface ImagePreviewProps {
  url: string;
  title?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ url, title = "Bukti Transaksi" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{title}</h3>

          {url ? (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={url}
                alt={title}
                fill
                className={`object-contain transition-opacity duration-300 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setIsLoading(false)}
                onError={() => setError(true)}
              />

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-pulse text-gray-400">Loading...</div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <p className="text-red-500">Gagal memuat gambar</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center">
              <p className="text-gray-400">Tidak ada gambar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImagePreview;
