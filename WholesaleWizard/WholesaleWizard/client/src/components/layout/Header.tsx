import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/components/cart/CartContext";
import { Search, ShoppingBag, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { UserRole } from "@shared/schema";

const Header = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { cartItems } = useCart();
  const [accountType, setAccountType] = useState<"retail" | "wholesale">("retail");
  
  // Set account type based on user role
  useEffect(() => {
    if (user && user.role === UserRole.WHOLESALE) {
      setAccountType("wholesale");
    } else {
      setAccountType("retail");
    }
  }, [user]);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountType(e.target.checked ? "wholesale" : "retail");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center">
                <svg className="h-8 w-8 text-[#0f766e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 11l5-5m5 0l5 5m-9-9h.01M14 8h.01" />
                </svg>
                <span className="ml-2 text-xl font-bold text-[#0f766e]">GreenGrocer</span>
              </Link>
              
              {user && (
                <div className="hidden md:flex space-x-1 items-center ml-6">
                  <span className="text-slate-400 text-xs">Account Type:</span>
                  <div className="relative inline-block w-16 h-6 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      id="toggle" 
                      className="absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer right-8 checked:right-0 checked:border-[#0f766e]"
                      checked={accountType === "wholesale"}
                      onChange={handleToggleChange}
                      disabled={user.role !== UserRole.WHOLESALE}
                    />
                    <label 
                      htmlFor="toggle" 
                      className={`block overflow-hidden h-6 rounded-full bg-slate-200 cursor-pointer ${accountType === "wholesale" ? "bg-[#0f766e]" : ""}`}
                    ></label>
                    <span className="absolute text-[9px] font-medium left-1 top-1 text-white">Retail</span>
                    <span className="absolute text-[9px] font-medium right-0 top-1 text-white mr-1">Wholesale</span>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link href="/products" className={`text-slate-600 hover:text-[#0f766e] text-sm font-medium ${location === "/products" ? "text-[#0f766e]" : ""}`}>
                  Products
                </Link>
                <Link href="/products?category=1" className="text-slate-600 hover:text-[#0f766e] text-sm font-medium">
                  Categories
                </Link>
                <Link href="/" className="text-slate-600 hover:text-[#0f766e] text-sm font-medium">
                  About
                </Link>
                <Link href="/" className="text-slate-600 hover:text-[#0f766e] text-sm font-medium">
                  Contact
                </Link>
                {user?.role === UserRole.ADMIN && (
                  <Link href="/admin" className={`text-slate-600 hover:text-[#0f766e] text-sm font-medium ${location.startsWith("/admin") ? "text-[#0f766e]" : ""}`}>
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-[#0f766e]">
                <Search className="h-6 w-6" />
              </button>
              <Link href="/cart" className="text-slate-600 hover:text-[#0f766e] relative">
                <ShoppingBag className="h-6 w-6" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f59e0b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm font-medium">{user.firstName || user.username}</span>
                  <Button 
                    variant="outline" 
                    className="border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button 
                    variant="outline" 
                    className="hidden md:block border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
              )}
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="block lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      GreenGrocer wholesale and retail store
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4 mt-6">
                    <SheetClose asChild>
                      <Link href="/products" className="text-lg">Products</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products?category=1" className="text-lg">Categories</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/" className="text-lg">About</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/" className="text-lg">Contact</Link>
                    </SheetClose>
                    {user?.role === UserRole.ADMIN && (
                      <SheetClose asChild>
                        <Link href="/admin" className="text-lg">Admin</Link>
                      </SheetClose>
                    )}
                    {user ? (
                      <>
                        <div className="text-lg font-medium">
                          Hello, {user.firstName || user.username}
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/auth">
                          <Button 
                            variant="outline" 
                            className="border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white"
                          >
                            Login
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile account toggle */}
      {user && (
        <div className="md:hidden flex justify-center py-2 bg-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 text-xs">Account Type:</span>
            <div className="relative inline-block w-16 h-6 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="toggle-mobile" 
                id="toggle-mobile" 
                className="absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer right-8 checked:right-0 checked:border-[#0f766e]"
                checked={accountType === "wholesale"}
                onChange={handleToggleChange}
                disabled={user.role !== UserRole.WHOLESALE}
              />
              <label 
                htmlFor="toggle-mobile" 
                className={`block overflow-hidden h-6 rounded-full bg-slate-200 cursor-pointer ${accountType === "wholesale" ? "bg-[#0f766e]" : ""}`}
              ></label>
              <span className="absolute text-[9px] font-medium left-1 top-1 text-white">Retail</span>
              <span className="absolute text-[9px] font-medium right-0 top-1 text-white mr-1">Wholesale</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
