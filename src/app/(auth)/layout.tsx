export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, oklch(0.78 0.14 70) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, oklch(0.65 0.06 65) 0%, transparent 50%)`,
      }} />
      <div className="relative w-[340px]">
        <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
