export default function Dataloading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-b-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
    </div>
  );
}
