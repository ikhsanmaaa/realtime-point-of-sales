"use client";

import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { Button } from "../ui/button";

export default function LandingPage() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <div className="bg-muted flex justify-center items-center h-screen flex-col space-y-4">
      <h1 className="text-4xl font-semibold ">{profile.name}</h1>
      <Link href={`/${profile.role}`}>
        <Button className="bg-teal-500 text-white">Access Dashboard</Button>
      </Link>
    </div>
  );
}
