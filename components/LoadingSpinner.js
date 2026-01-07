// components/LoadingSpinner.js
export default function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizes[size] || sizes.md} border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin`}></div>
    </div>
  );
}
