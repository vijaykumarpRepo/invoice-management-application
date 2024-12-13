"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard page
    router.push("/dashboard");
  }, [router]);

  // Optional: Add a loading state or message
  return <p>Redirecting to the dashboard...</p>;
}
