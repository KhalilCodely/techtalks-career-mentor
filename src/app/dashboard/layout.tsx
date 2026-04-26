import type { ReactNode } from "react";
import Navbar from "../components/NavBar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
    </>
  );
}

