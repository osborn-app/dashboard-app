"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "../ui/use-toast";
import { PasswordInput } from "../password-input";

const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(5, { message: "Password minimal 5 karakter" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const errorParams = searchParams.get("error");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    const role = localStorage.getItem("selectedRole");
    signIn("credentials", {
      email: data.email,
      password: data.password,
      role: role,
      callbackUrl: callbackUrl ?? "/dashboard",
    });
  };

  useEffect(() => {
    // Check if the URL has an error parameter
    if (searchParams.has("error")) {
      // Create a new URL object from the current URL
      const url = new URL(window.location.href);

      // Remove the error parameter
      url.searchParams.delete("error");

      // Replace the current URL with the new one without the error parameter
      router.replace(url.pathname + url.search, undefined);
    }
  }, [router, searchParams]);
  useEffect(() => {
    if (errorParams) {
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Email atau password salah",
        });
      });
    }
  }, [errorParams]);
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Masukkan email..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Masukkan password..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={!form.formState.isValid}
            className="mt-6 ml-auto w-full bg-main text-white hover:bg-main/90"
            type="submit"
          >
            Masuk
          </Button>
        </form>
      </Form>
    </>
  );
}
