// components/LoginLayout.js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const LoginLayout = React.memo(({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-12 h-12 border-2 border-slate-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-2 border-transparent border-t-amber-500 border-r-orange-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
});
LoginLayout.displayName = "LoginLayout";

export default LoginLayout;
