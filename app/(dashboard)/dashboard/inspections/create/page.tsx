import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import InspectionsForm from "@/components/forms/inspections-form";

export default function CreateInspectionPage() {
  const breadcrumbItems = [
    { title: "Inspections", link: "/dashboard/inspections" },
    { title: "Create", link: "/dashboard/inspections/create" },
  ];

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title="Mulai Inspeksi" />
        </div>
        <Separator />
        <InspectionsForm />
      </div>
    </>
  );
}
