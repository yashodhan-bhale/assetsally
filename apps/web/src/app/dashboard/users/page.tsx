"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/users/staff");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
