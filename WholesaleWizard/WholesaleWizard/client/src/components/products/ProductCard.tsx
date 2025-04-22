import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Minus, Plus } from "lucide-react";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/components/cart/CartContext";
import { UserRole } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(product.unitOptions[0]?.value || "");
  
  // Price calculations
  const price = user?.role === UserRole.WHOLESALE ? product.wholesalePrice : product.retailPrice;
  const originalPrice = product.originalPrice || 0;
  const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  // Selected unit option
  const unitOption = product.unitOptions.find(option => option.value === selectedUnit);
  const unitLabel = unitOption?.label || "";
  
  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  // Handle adding to cart
  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      quantity,
      unitType: selectedUnit
    });
  };

  return (
    <Card className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        {product.isBestseller && (
          <span className="absolute top-2 left-2 bg-[#f59e0b] text-white text-xs px-2 py-1 rounded-full">Bestseller</span>
        )}
        {product.isLimited && (
          <span className="absolute top-2 left-2 bg-[#f59e0b] text-white text-xs px-2 py-1 rounded-full">Limited</span>
        )}
        <Link href={`/products/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-48 object-cover cursor-pointer"
          />
        </Link>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium cursor-pointer hover:text-[#0f766e]">{product.name}</h3>
          </Link>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-slate-600 ml-1">{product.rating}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-slate-500 text-sm mb-1">{product.description}</p>
          <div className="flex items-center text-xs text-slate-500">
            {product.isOrganic && (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full mr-2">Organic</span>
            )}
            {product.isLocal && (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full mr-2">Local</span>
            )}
            {product.origin && (
              <span>Origin: {product.origin}</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-baseline mb-4">
          <div className="mr-2">
            <span className="text-lg font-bold text-[#0f766e]">${price.toFixed(2)}</span>
            <span className="text-xs text-slate-500">/{product.unit}</span>
          </div>
          {originalPrice > 0 && (
            <>
              <div className="text-xs text-slate-500 line-through">${originalPrice.toFixed(2)}</div>
              <div className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Save {discount}%</div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <Select
            value={selectedUnit}
            onValueChange={setSelectedUnit}
          >
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {product.unitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="w-6 h-6 text-[#0f766e] rounded border border-slate-200"
              onClick={decreaseQuantity}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 mx-1 text-center text-sm">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="w-6 h-6 text-[#0f766e] rounded border border-slate-200"
              onClick={increaseQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <Button 
          className="w-full bg-[#0f766e] hover:bg-[#0f766e]/90 text-white"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
