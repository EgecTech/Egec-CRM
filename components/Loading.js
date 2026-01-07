import React from "react";

const Loading = React.memo(() => {
  return (
    <div
      className="flex items-center justify-center w-full h-full py-10"
      role="status"
      aria-label="Loading"
    >
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
        {/* Spinning gradient ring */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-500 border-r-orange-500 rounded-full animate-spin"></div>
        {/* Inner glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-sm"></div>
      </div>
    </div>
  );
});
Loading.displayName = "Loading";

export default Loading;
