import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import CategoryNav from "@/components/products/CategoryNav";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter from "@/components/products/ProductFilter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

const HomePage = () => {
  // Get featured products (using default endpoint)
  
  // Get categories for navigation
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="bg-slate-50">
      <section className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f766e] to-transparent opacity-90"></div>
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&h=400&q=80" 
            alt="Fresh produce" 
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 max-w-xl">Quality Produce for Businesses and Individuals</h1>
            <p className="text-white text-sm md:text-base max-w-lg mb-6">Access wholesale pricing on bulk orders or shop retail for your home needs.</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/products">
                <Button className="bg-white text-[#0f766e] hover:bg-slate-100 px-6 py-3 rounded-md font-medium">
                  Browse Products
                </Button>
              </Link>
              <Button className="bg-transparent border border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium">
                Wholesale Info
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <CategoryNav />
        
        {/* Featured Products */}
        <ProductFilter title="Featured Products" />
        <ProductGrid />
        
        {/* Pagination */}
        <div className="flex justify-center mt-8 mb-10">
          <nav className="flex items-center">
            <Button variant="outline" size="icon" className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button variant="outline" className="w-8 h-8 mr-2 bg-[#0f766e] text-white border-[#0f766e]">1</Button>
            <Button variant="outline" className="w-8 h-8 mr-2">2</Button>
            <Button variant="outline" className="w-8 h-8 mr-2">3</Button>
            <span className="text-slate-500 px-2">...</span>
            <Button variant="outline" className="w-8 h-8 mr-2">12</Button>
            <Button variant="outline" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </nav>
        </div>
        
        {/* Wholesale Features */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Our Wholesale Program?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#e6f7f5] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Volume Discounts</h3>
              <p className="text-slate-500 text-sm">Save up to 25% on your orders with our tiered pricing structure designed for businesses of all sizes.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#e6f7f5] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Flexible Delivery</h3>
              <p className="text-slate-500 text-sm">Schedule deliveries based on your business needs with our convenient daily, weekly, or monthly options.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#e6f7f5] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Quality Guarantee</h3>
              <p className="text-slate-500 text-sm">Every product comes with our freshness promise. Not satisfied? We'll replace it or refund your purchase.</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Button className="bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-white px-6 py-3 rounded-md font-medium">
              Apply For Wholesale Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
