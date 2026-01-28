"use client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { UserCreateDialog } from "@/components/tables/user-tables/user-create-dialog";

export default function UserCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ variant: "main" }))}
      >
        <Plus className="mr-2 h-4 w-4" /> Add New
      </button>
      <UserCreateDialog isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
