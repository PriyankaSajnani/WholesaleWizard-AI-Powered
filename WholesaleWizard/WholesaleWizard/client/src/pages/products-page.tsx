import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";
import CategoryNav from "@/components/products/CategoryNav";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter from "@/components/products/ProductFilter";

const ProductsPage = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryIdParam = searchParams.get("category");
  const categoryId = categoryIdParam ? parseInt(categoryIdParam) : undefined;
  
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Get category details if categoryId is provided
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const currentCategory = categories?.find(cat => cat.id === categoryId);
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    // In a real application, we would refetch products based on the sort value
  };
  
  // Handle view mode change
  const handleViewChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/"><Home className="h-4 w-4" /></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            {currentCategory && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink>{currentCategory.name}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Categories */}
        <CategoryNav />
        
        {/* Product Filter */}
        <ProductFilter 
          title={currentCategory ? `${currentCategory.name}` : "All Products"} 
          onSortChange={handleSortChange}
          onViewChange={handleViewChange}
        />
        
        {/* Product Grid */}
        <ProductGrid categoryId={categoryId} />
        
        {/* Pagination */}
        <div className="flex justify-center mt-8 mb-10">
          <nav className="flex items-center">
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 mr-2 hover:border-[#0f766e] hover:text-[#0f766e]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#0f766e] bg-[#0f766e] text-white mr-2">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-700 mr-2 hover:border-[#0f766e] hover:text-[#0f766e]">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-700 mr-2 hover:border-[#0f766e] hover:text-[#0f766e]">3</button>
            <span className="text-slate-500 px-2">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-700 mr-2 hover:border-[#0f766e] hover:text-[#0f766e]">12</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-[#0f766e] hover:text-[#0f766e]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
