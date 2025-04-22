import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

interface ProductFilterProps {
  title?: string;
  onSortChange?: (value: string) => void;
  onViewChange?: (value: "grid" | "list") => void;
}

const ProductFilter = ({
  title = "Featured Products",
  onSortChange,
  onViewChange,
}: ProductFilterProps) => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };
  
  const handleViewChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    if (onViewChange) {
      onViewChange(mode);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between mb-6">
      <div className="mb-4 md:mb-0">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {user && (
          <div className="flex items-center">
            <span className="text-sm text-[#0f766e] mr-2">Showing</span>
            <span className="font-medium text-sm">
              {user.role === UserRole.WHOLESALE ? "Wholesale" : "Retail"} Pricing
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <Select
          value={sortBy}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Sort by: Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Sort by: Featured</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="hidden md:flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === "list" ? "text-slate-400 hover:text-[#0f766e]" : "text-[#0f766e]"}
            onClick={() => handleViewChange("grid")}
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === "grid" ? "text-slate-400 hover:text-[#0f766e]" : "text-[#0f766e]"}
            onClick={() => handleViewChange("list")}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
