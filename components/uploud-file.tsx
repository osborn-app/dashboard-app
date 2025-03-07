"use client";

import { useState } from "react";
import { UploadButton } from "./uploudthing";
import { Image } from "lucide-react";
import imageCompression from "browser-image-compression";
import { PreviewImage } from "./modal/preview-image";
import CustomImage from "./custom-image";
import { last } from "lodash";

interface UploadFileProps {
  form: any;
  name: string;
  lastPath: string;
  initialData: any;
}

const UploadFile = ({ form, name, initialData, lastPath }: UploadFileProps) => {
  const [isUploaded, setIsUploaded] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const onHandlePreview = (file: any) => {
    setContent(file?.photo || file?.transactionProofUrl || file?.data || file);
    setOpen(true);
  };

  // Aggressive compression options
  const compressionOptions = {
    maxSizeMB: 2, // Reduced to 300KB maximum
    maxWidthOrHeight: 1280, // Reduced maximum dimension
    useWebWorker: true,
    quality: 0.4, // Reduced quality
    initialQuality: 0.4, // Initial quality for compression
    alwaysKeepResolution: false, // Allow resolution reduction
    // Additional optimization options
    preserveExif: false, // Remove EXIF data
    strict: true, // Strict mode to ensure size limit
    fileType: "image/jpeg", // Convert to JPEG for better compression
  };

  // Enhanced compression function
  const handleCompression = async (file: File): Promise<File> => {
    setIsCompressing(true);
    try {
      let compressedFile = await imageCompression(file, compressionOptions);

      // If still too large, try second pass with more aggressive settings
      if (compressedFile.size > 2000 * 1024) {
        // If larger than 300KB
        const moreAggressiveOptions = {
          ...compressionOptions,
          maxSizeMB: 500, // Further reduce to 200KB
          quality: 0.2, // More aggressive quality reduction
          maxWidthOrHeight: 1024, // Further reduce dimensions
        };
        compressedFile = await imageCompression(
          compressedFile,
          moreAggressiveOptions,
        );
      }

      // Log compression results
      const originalSizeMB = file.size / (1024 * 1024);
      const compressedSizeMB = compressedFile.size / (1024 * 1024);
      const compressionRatio = (
        (1 - compressedSizeMB / originalSizeMB) *
        100
      ).toFixed(1);

      console.log("Original size:", originalSizeMB.toFixed(2), "MB");
      console.log("Compressed size:", compressedSizeMB.toFixed(2), "MB");
      console.log("Compression ratio:", compressionRatio + "%");

      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <>
      <div className="p-2 relative cursor-pointer border-opacity-25 w-full border-gray-800 border border-dashed -ml-[6px] gap-2 md:h-[200px] md:w-[300px] w-[500px] h-[300px] flex flex-col justify-center items-center">
        <PreviewImage
          isOpen={open}
          onClose={() => setOpen(false)}
          content={content}
        />
        {!isUploaded && !initialData?.transactionProofUrl && (
          <div className="flex flex-col -mt-8 absolute size-16">
            <div className="flex flex-col items-center">
              <Image className="mx-auto text-gray-600 size-16 -mt-5" />
              {isCompressing ? (
                <div className="mt-2">Compressing image...</div>
              ) : (
                <UploadButton
                  className="mt-2"
                  endpoint="imageUploader"
                  onBeforeUploadBegin={async (files) => {
                    const compressedFiles = await Promise.all(
                      files.map(async (file) => {
                        if (file.type.startsWith("image/")) {
                          return await handleCompression(file);
                        }
                        return file;
                      }),
                    );
                    return compressedFiles;
                  }}
                  onClientUploadComplete={(res) => {
                    setIsUploaded(res[0].ufsUrl);
                    const uploadedUrl = res[0].ufsUrl;
                    form.setValue(name, uploadedUrl);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {(isUploaded || initialData?.transactionProofUrl) && (
          <CustomImage
            onClick={() => {
              setOpen(true);
              onHandlePreview(isUploaded || initialData?.transactionProofUrl);
            }}
            width={500}
            height={300}
            className="object-contain w-full h-full"
            alt=""
            srcSet={`${isUploaded || initialData?.transactionProofUrl} 500w,${
              isUploaded || initialData?.transactionProofUrl
            } 1000w`}
            sizes="(max-width: 600px) 480px, 800px"
            src={isUploaded || initialData?.transactionProofUrl}
          />
        )}
      </div>
    </>
  );
};

export default UploadFile;
