"use client";
import { Trash } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { PreviewImage } from "./modal/preview-image";
import { useState } from "react";
import CustomImage from "./custom-image";
import Image from "next/image";

export const IMG_MAX_LIMIT = 3;

export interface MulitpleImageUploadResponse {
  data?: FileList | null;
  url?: string;
}

interface MulitpleImageUploadProps {
  onChange?: any;
  onRemove: (value?: MulitpleImageUploadResponse) => void;
  value?: any;
  disabled?: boolean;
}

export default function MulitpleImageUpload({
  onChange,
  onRemove,
  value,
  disabled,
}: MulitpleImageUploadProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const onDeleteFile = (file: any) => {
    // onChange(null);

    const filteredFile = value?.filter((item: any) =>
      item?.id ? item.id !== file.id : item?.name !== file?.name,
    );
    onRemove(filteredFile);
  };
  const onUpdateFile = (file: any) => {
    const filesArr = Array.from(file?.data);
    onChange(filesArr);
  };

  const onHandlePreview = (file: any) => {
    setContent(file?.photo ? file?.photo : URL.createObjectURL(file));
    setOpen(true);
  };

  return (
    <>
      <PreviewImage
        isOpen={open}
        onClose={() => setOpen(false)}
        content={content}
      />
      <div className="mb-6">
        <Input
          type="file"
          id="file"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          accept="image/*"
          multiple
          disabled={disabled}
          onChange={(e) => onUpdateFile({ data: e.target.files })}
        />
      </div>
      <div className="flex flex-wrap gap-4 ">
        {value.map((item: any, index: number) => (
          <div
            key={(item?.name ? item.name : item?.url ? item.url : "item") + "-" + index}
            className="relative rounded-md cursor-pointer w-full h-[300px] sm:w-1/3 lg:w-1/4 xl:w-1/5"
          >
            {!disabled && (
              <div className="z-10 absolute top-2 right-2">
                <Button
                  type="button"
                  onClick={() => onDeleteFile(item)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
            <CustomImage
              onClick={() => {
                setOpen(true);
                onHandlePreview(item);
              }}
              className="object-contain w-full h-full"
              alt="Deskripsi gambar"
              srcSet={`${item?.photo || URL.createObjectURL(item)} 500w,${
                item?.photo || URL.createObjectURL(item)
              } 1000w`}
              sizes="(max-width: 600px) 480px, 800px"
              src={item?.photo || URL.createObjectURL(item)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
