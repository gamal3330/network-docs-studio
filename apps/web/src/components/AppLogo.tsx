export function AppLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      alt="Network Docs Studio"
      className={`${className} rounded-md shadow-sm`}
      src="/logo.svg"
    />
  );
}
