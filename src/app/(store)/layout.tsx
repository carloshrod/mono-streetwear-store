import { Navbar } from "@/components/shared/navbar";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-dvh">{children}</main>
    </>
  );
};

export default StoreLayout;
