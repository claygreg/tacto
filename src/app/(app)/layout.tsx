import { AppSidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/Header";
import { BreadcrumbProvider } from "@/hooks/use-breadcrumb";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="mx-auto w-full max-w-[1440px] px-[40px] flex-1 flex flex-col py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
