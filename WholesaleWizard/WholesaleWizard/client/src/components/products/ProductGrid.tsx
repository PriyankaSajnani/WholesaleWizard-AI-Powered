import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  categoryId?: number;
}

const ProductGrid = ({ categoryId }: ProductGridProps) => {
  const queryUrl = categoryId 
    ? `/api/products?categoryId=${categoryId}` 
    : "/api/products";
    
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [queryUrl],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <Skeleton className="w-full h-48" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading products: {error.message}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
