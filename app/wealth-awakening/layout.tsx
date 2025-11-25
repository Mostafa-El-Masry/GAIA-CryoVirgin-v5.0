export const metadata = {
  title: "Wealth Awakening · Wall Street Drive | GAIA",
};

export default function WealthAwakeningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-[80vw]">
      {children}
    </div>
  );
}
