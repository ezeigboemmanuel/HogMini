"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ClientNavbarController({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const hideNavbar = !!pathname && authPaths.some((p) => pathname.startsWith(p));

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
