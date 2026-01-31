import NavBar from "../NavBar";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="pt-6 px-6">{children}</main>
    </>
  );
}
