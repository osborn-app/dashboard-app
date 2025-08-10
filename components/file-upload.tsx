"use client";
import { Trash } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Define IMG_MAX_LIMIT here instead of importing from product-form
export const IMG_MAX_LIMIT = 3;

interface UploadFileRes {
  fileName: string;
  name: string;
  fileSize: number;
  size: number;
  fileKey: string;
  key: string;
  fileUrl: string;
  url: string;
}

interface ImageUploadProps {
  onChange?: any;
  onRemove: (value: UploadFileRes[]) => void;
  value: UploadFileRes[];
}

export default function FileUpload({
  onChange,
  onRemove,
  value,
}: ImageUploadProps) {
  const onDeleteFile = (key: string) => {
    const files = value;
    let filteredFiles = files.filter((item) => item.key !== key);
    onRemove(filteredFiles);
  };

  // const onUpdateFile = (newFiles: UploadFileRes[]) => {
  //   onChange([...value, ...newFiles]);
  // };
  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {!!value.length &&
          value?.map((item) => (
            <div
              key={item.key}
              className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
            >
              <div className="z-10 absolute top-2 right-2">
                <Button
                  type="button"
                  onClick={() => onDeleteFile(item.key)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Image
                  fill
                  className="object-cover"
                  alt="Image"
                  src={item.fileUrl || ""}
                />
              </div>
            </div>
          ))}
      </div>
      <div>
        {value.length < IMG_MAX_LIMIT && <Input id="picture" type="file" />}
      </div>
    </div>
  );
}
