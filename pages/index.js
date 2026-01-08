// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Loading from "@/components/Loading";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      // Redirect authenticated users to CRM dashboard
      router.push("/crm/dashboard");
    } else {
      // Redirect unauthenticated users to login
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  return (
    <>
      <Head>
        <title>EduGate CRM - Educational Customer Management</title>
        <meta
          name="description"
          content="Educational CRM for managing student leads and counselor activities"
        />
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-slate-600">Loading EduGate CRM...</p>
        </div>
      </div>
    </>
  );
}
