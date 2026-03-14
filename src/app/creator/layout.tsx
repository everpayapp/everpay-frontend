// ~/everpay-frontend/src/app/creator/layout.tsx
import NavBar from "../NavBar";
import CreatorGiftToast from "./components/CreatorGiftToast";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      <NavBar />
      <CreatorGiftToast />
      <main className="px-6 pt-6">{children}</main>
    </div>
  );
}
