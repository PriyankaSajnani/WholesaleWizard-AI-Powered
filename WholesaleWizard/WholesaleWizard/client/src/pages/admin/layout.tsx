import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Bell,
  Search,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserRole } from "@shared/schema";
import { Redirect } from "wouter";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  // Get current tab from path
  const getTabValue = () => {
    if (location === "/admin") return "dashboard";
    if (location === "/admin/products") return "products";
    if (location === "/admin/orders") return "orders";
    if (location === "/admin/customers") return "customers";
    return "dashboard";
  };
  
  // Redirect if not admin
  if (!user || user.role !== UserRole.ADMIN) {
    return <Redirect to="/" />;
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    switch (value) {
      case "dashboard":
        navigate("/admin");
        break;
      case "products":
        navigate("/admin/products");
        break;
      case "orders":
        navigate("/admin/orders");
        break;
      case "customers":
        navigate("/admin/customers");
        break;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="sticky top-0 z-30 bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center">
              <svg className="h-8 w-8 text-[#f59e0b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 11l5-5m5 0l5 5m-9-9h.01M14 8h.01" />
              </svg>
              <span className="ml-2 text-lg font-bold hidden sm:inline">GreenGrocer Admin</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search..." 
                className="pl-8 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-[#0f766e]"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-6 w-6 text-slate-300 cursor-pointer hover:text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-slate-200">
                <AvatarFallback className="text-slate-800">
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden md:inline">{user?.firstName || user?.username}</span>
            </div>
            
            <Sheet>
              <SheetTrigger className="md:hidden">
                <Menu className="h-6 w-6 text-slate-300" />
              </SheetTrigger>
              <SheetContent side="left" className="bg-slate-800 text-white border-r border-slate-700">
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-6">
                    <svg className="h-8 w-8 text-[#f59e0b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 11l5-5m5 0l5 5m-9-9h.01M14 8h.01" />
                    </svg>
                    <span className="ml-2 text-lg font-bold">GreenGrocer Admin</span>
                  </div>
                  
                  <div className="mb-6">
                    <div className="relative w-full mb-4">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input 
                        placeholder="Search..." 
                        className="pl-8 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-[#0f766e]"
                      />
                    </div>
                    
                    <ul className="space-y-2">
                      <li>
                        <Link 
                          href="/admin" 
                          className={`flex items-center p-2 rounded-md text-sm ${location === "/admin" ? "bg-[#0f766e] text-white" : "hover:bg-slate-700"}`}
                        >
                          <LayoutDashboard className="h-5 w-5 mr-2" />
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/admin/products" 
                          className={`flex items-center p-2 rounded-md text-sm ${location === "/admin/products" ? "bg-[#0f766e] text-white" : "hover:bg-slate-700"}`}
                        >
                          <Package className="h-5 w-5 mr-2" />
                          Products
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/admin/orders" 
                          className={`flex items-center p-2 rounded-md text-sm ${location === "/admin/orders" ? "bg-[#0f766e] text-white" : "hover:bg-slate-700"}`}
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Orders
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/admin/customers" 
                          className={`flex items-center p-2 rounded-md text-sm ${location === "/admin/customers" ? "bg-[#0f766e] text-white" : "hover:bg-slate-700"}`}
                        >
                          <Users className="h-5 w-5 mr-2" />
                          Customers
                        </Link>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-auto">
                    <Link 
                      href="/" 
                      className="flex items-center p-2 rounded-md text-sm hover:bg-slate-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      Back to Store
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-64 hidden md:block bg-slate-800 text-white p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin" 
                className={`flex items-center p-2 rounded-md ${location === "/admin" ? "bg-[#0f766e] text-white" : "hover:bg-slate-700"}`}
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/products" 
                className={`flex items-center p-2 rounded-md ${location === "/admin/products" ? "bg-[#0f766e] text-white" : "hover:bg-slate-700"}`}
              >
                <Package className="h-5 w-5 mr-2" />
                Products
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/orders" 
                className={`flex items-center p-2 rounded-md ${location === "/admin/orders" ? "bg-[#0f766e] text-white" : "hover:bg-slate-700"}`}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Orders
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/customers" 
                className={`flex items-center p-2 rounded-md ${location === "/admin/customers" ? "bg-[#0f766e] text-white" : "hover:bg-slate-700"}`}
              >
                <Users className="h-5 w-5 mr-2" />
                Customers
              </Link>
            </li>
          </ul>
          
          <div className="border-t border-slate-700 mt-6 pt-6">
            <Link 
              href="/" 
              className="flex items-center p-2 rounded-md hover:bg-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Back to Store
            </Link>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 px-4 py-8">
          <div className="container mx-auto">
            <Tabs value={getTabValue()} onValueChange={handleTabChange}>
              <TabsList className="mb-8 hidden">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>
              
              {children}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
