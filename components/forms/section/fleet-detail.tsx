import { Button, buttonVariants } from "@/components/ui/button";
import {
  Bike,
  LayoutDashboard,
  PaintBucket,
  RectangleHorizontal,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isEmpty } from "lodash";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { PreviewImage } from "@/components/modal/preview-image";
import { useState } from "react";

interface Photo {
  id: number;
  created_at: string;
  updated_at: string;
  photo: string;
}

interface Location {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  location: string;
  address: string;
  map_url: string;
  redirect_url: string;
}

interface Fleet {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  type: string;
  color: string;
  plate_number: string;
  price: number;
  photos: Photo[];
  location: Location | null;
  type_label: string;
}

interface FleetDetailProps {
  onClose: () => void;
  data: Fleet;
  innerRef?: any;
}

const FleetDetail: React.FC<FleetDetailProps> = ({ onClose, data, innerRef }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const onHandlePreview = (file: any) => {
    setContent(file);
    setOpen(true);
  };

  return (
    <div
      className="p-5 top-10 border rounded-md border-neutral-400  w-full basis-1/3"
      id="detail-sidebar" ref={innerRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-center font-semibold text-xl">Armada Detail</h4>
        <Button
          type="button"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "w-[65px] h-[40px]",
          )}
          onClick={onClose}
        >
          Tutup
        </Button>
      </div>
      <div className="flex flex-col justify-between ">
        <div>
          <div className="mb-5 gap-2 grid">
            <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                <LayoutDashboard />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Tipe
                </span>
                <span className="font-medium text-sm text-black">
                  {data?.type === "motorcycle"
                    ? "Motor"
                    : data?.type === "car"
                    ? "Mobil"
                    : "-"}
                </span>
              </div>
            </div>
            <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                <Bike />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Nama Armada
                </span>
                <span className="font-medium text-sm text-black">
                  {data?.name ?? "-"}
                </span>
              </div>
            </div>
            <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                <RectangleHorizontal />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Plat Motor
                </span>
                <span className="font-medium text-sm text-black">
                  {data?.plate_number ?? "-"}
                </span>
              </div>
            </div>
            <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                <PaintBucket />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Warna
                </span>
                <span className="font-medium text-sm text-black">
                  {data?.color ?? "-"}
                </span>
              </div>
            </div>
            {data?.location && (
              <div className="p-1 flex items-center  rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100 ">
                  <MapPin />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Lokasi
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data.location.name ?? "-"}
                  </span>
                  {data.location.address && (
                    <span className="font-normal text-xs text-neutral-500 mt-1">
                      {data.location.address}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          {isEmpty(data?.photos) ? (
            <p>Belum ada Foto</p>
          ) : (
            <Carousel className="max-w-xs mx-auto">
              <CarouselContent>
                {data?.photos.map((photo: any, index: any) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="w-[310px] h-[300px] flex-shrink-0 flex aspect-square items-center justify-center relative ">
                        {/* <CardContent className="flex aspect-square items-center justify-center p-6">

                      </CardContent> */}
                        <img
                          src={photo.photo}
                          alt={`Slide ${index}`}
                          className="object-cover cursor-pointer rounded-lg w-full h-full"
                          onClick={() => {
                            setOpen(true);
                            onHandlePreview(photo?.photo);
                          }}
                        />
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {data?.photos && data?.photos?.length > 1 && (
                <>
                  <CarouselPrevious
                    type="button"
                    className="-left-1 top-1/2 -translate-y-1/2 bg-accent"
                  />
                  <CarouselNext
                    type="button"
                    className="-right-1 top-1/2 -translate-y-1/2 bg-accent"
                  />
                </>
              )}
            </Carousel>
          )}
        </div>
      </div>
      <PreviewImage
        isOpen={open}
        onClose={() => setOpen(false)}
        content={content}
      />
    </div>
  );
};

export default FleetDetail;
