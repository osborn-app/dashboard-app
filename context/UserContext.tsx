"use client";
import { createContext, useContext, ReactNode, useMemo } from "react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";

type UserContextType = {
  user: Session["user"] | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: Session["user"] | null;
}) => {
  const { data } = useSession();

  const value = useMemo(
    () => ({ user: (data?.user as Session["user"]) ?? initialUser ?? null }),
    [data?.user, initialUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
