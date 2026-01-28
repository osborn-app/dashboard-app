import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import { Tabs } from "@/components/ui/tabs";
import UserTableWrapper from "./user-table-wrapper";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getUsers } from "@/client/userClient";
import UserCreateButton from "./user-create-button";

export const metadata: Metadata = {
  title: "Users | Osborn",
  description: "Users page",
};

type paramsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

const breadcrumbItems = [{ title: "Users", link: "/dashboard/users" }];

export default async function page({ searchParams }: paramsProps) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({ role: "operation" }),
  });

  const defaultTab = searchParams.role ?? "operation";

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title="Users" />
          <UserCreateButton />
        </div>
        <Separator />
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <UserTableWrapper />
          </HydrationBoundary>
        </Tabs>
      </div>
    </>
  );
}
