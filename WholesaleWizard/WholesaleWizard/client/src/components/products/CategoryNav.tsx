import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryNav = () => {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <p className="text-red-500">Error loading categories: {error.message}</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <p className="text-slate-500">No categories found</p>
      </div>
    );
  }

  // Function to get icon class based on category icon string
  const getIconClass = (iconName: string) => {
    return `fas ${iconName} text-[#0f766e] text-xl`;
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${category.id}`}>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center cursor-pointer">
              <div className="h-12 w-12 mx-auto mb-2 bg-[#e6f7f5] rounded-full flex items-center justify-center">
                <i className={getIconClass(category.icon)}></i>
              </div>
              <h3 className="font-medium text-sm">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
