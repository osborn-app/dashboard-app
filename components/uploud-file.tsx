"use client";

import { useState } from "react";
import { UploadButton } from "./uploudthing";
import { Image } from "lucide-react";

interface UploadFileProps {
  form: any;
  name: string;
  lastPath: string;
  initialData: any;
}

const UploadFile = ({ form, name, initialData, lastPath }: UploadFileProps) => {
  const [isUploaded, setIsUploaded] = useState("");
  return (
    <>
      {lastPath !== "preview" && initialData?.status !== "done" && (
        <div className="p-2 ml-3 relative border-opacity-25 border-gray-800 border border-dashed -ml-[5px] gap-2  md:h-[200px]   md:w-[300px] :w-[500px] h-[300px] flex flex-col justify-center items-center">
          {!isUploaded && (
            <div className="flex flex-col -mt-8 absolute size-16">
              <div className="flex flex-col items-center ">
                <Image className="mx-auto text-gray-600  size-16 -mt-5" />
                <UploadButton
                  className="mt-2"
                  disabled={lastPath === "preview"}
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setIsUploaded(res[0].ufsUrl);
                    // Store the URL directly in form
                    const uploadedUrl = res[0].ufsUrl;
                    form.setValue(name, uploadedUrl);
                  }}
                />
              </div>
            </div>
          )}
          {isUploaded ? (
            <img
              width={500}
              className="object-cover w-full h-full"
              height={300}
              src={isUploaded || initialData?.transactionProofUrl}
            />
          ) : null}
        </div>
      )}
    </>
  );
};

export default UploadFile;
