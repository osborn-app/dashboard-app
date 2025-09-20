import { Metadata } from "next";
import UserAuthForm from "@/components/forms/user-auth-form";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | Transgo",
  description: "Please Login before access the dashboard",
};

export default async function AuthenticationPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.accessToken) {
    redirect("/dashboard");
  }

  // Redirect ke role selection page
  redirect("/role-selection");
}
