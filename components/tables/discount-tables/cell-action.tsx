"use client";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/constants/data";
import { useDeleteDiscount } from "@/hooks/api/useDiscount";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CellActionProps {
    data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const id = data?.id;
    const queryClient = useQueryClient();

    const { mutate: deleteDiscount, isPending } = useDeleteDiscount();

    const onConfirm = async () => {
        setLoading(true);
        deleteDiscount(id, {
            onSuccess: () => {
                toast({
                    variant: "success",
                    title: "Diskon berhasil dihapus!",
                });
                setOpen(false);
                setLoading(false);
            },
            onError: (error) => {
                toast({
                    variant: "destructive",
                    title: "Oops! Ada error.",
                    description: `Something went wrong: ${error.message}`,
                });
                setLoading(false);
            },
            onSettled: () => {
                setLoading(false);
            },
        });
    };

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onConfirm}
                loading={loading || isPending}
            />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        className="text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(true);
                        }}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
