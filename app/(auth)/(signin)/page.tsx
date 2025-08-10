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

  return (
    <div className="relative h-screen flex-col items-center justify-center">
      <div className="p-4 h-full flex items-center">
        <div className="mx-auto flex w-full flex-col justify-center sm:w-[350px]">
          <div className="flex items-center justify-center">
            <Image
              alt="logo"
              src="/image 3.svg"
              width={200}
              height={120}
              style={{ scale: "1.8", marginBottom: "10px" }}
            />
            {/* <Logo className="fill-main  w-full h-[120px] border-black border" /> */}
          </div>
          <div className="flex flex-col text-center">
            <h1 className="text-2xl md:text-2xl font-semibold tracking-tight">
              Selamat datang! <br />
              Silahkan Log in ke Dashboard
            </h1>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
