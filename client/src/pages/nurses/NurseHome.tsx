import { HomeSidebar } from "@/pages/nurses/HomeSidebar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";

import { Separator } from "@/components/ui/separator";

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import RequestTable from "@/pages/nurses/RequestTable";
  

const NurseHome = () => {

  return (
    <SidebarProvider>
        <HomeSidebar />

        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                    Nurse Home
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                    <BreadcrumbPage>Approve appointments</BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            </header>

            <div className="flex justify-center items-center h-full px-10">
                <div className="min-w-full mx-4 p-4 border border-white rounded-lg shadow-md">
                    <RequestTable />
                </div>
            </div>
            
        </SidebarInset>

    </SidebarProvider>
  );
};

export default NurseHome;