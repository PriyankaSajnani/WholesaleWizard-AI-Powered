import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Home, Star, Minus, Plus, Info, Check, Truck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/components/cart/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductGrid from "@/components/products/ProductGrid";

interface ProductDetailPageProps {
  id: number;
}

const ProductDetailPage = ({ id }: ProductDetailPageProps) => {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState("");
  
  // Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });
  
  // Fetch categories for breadcrumb
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Set default selected unit when product data is loaded
  useState(() => {
    if (product && product.unitOptions && product.unitOptions.length > 0 && !selectedUnit) {
      setSelectedUnit(product.unitOptions[0].value);
    }
  });
  
  // Find category name
  const categoryName = categories?.find(cat => product && cat.id === product.categoryId)?.name || "Category";
  
  // Price calculations
  const price = product ? (user?.role === UserRole.WHOLESALE ? product.wholesalePrice : product.retailPrice) : 0;
  const originalPrice = product?.originalPrice || 0;
  const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
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
    if (product && selectedUnit) {
      addToCart({
        productId: product.id,
        quantity,
        unitType: selectedUnit
      });
      
      toast({
        title: "Added to cart",
        description: `${quantity} ${selectedUnit} of ${product.name} added to your cart`,
      });
    } else {
      toast({
        title: "Error",
        description: "Please select a unit option",
        variant: "destructive",
      });
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90">
            Return to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
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
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/products?category=${product.categoryId}`}>{categoryName}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              {product.isBestseller && (
                <span className="absolute top-2 left-2 bg-[#f59e0b] text-white text-xs px-2 py-1 rounded-full z-10">Bestseller</span>
              )}
              {product.isLimited && (
                <span className="absolute top-2 left-2 bg-[#f59e0b] text-white text-xs px-2 py-1 rounded-full z-10">Limited</span>
              )}
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{product.rating}</span>
                </div>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-sm text-slate-500">In Stock: {product.stock} {product.unit}s</span>
              </div>
              
              <p className="text-slate-600 mb-6">{product.description}</p>
              
              <div className="flex flex-wrap items-center mb-6">
                {product.isOrganic && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">Organic</span>
                )}
                {product.isLocal && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">Local</span>
                )}
                {product.origin && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">Origin: {product.origin}</span>
                )}
              </div>
              
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold text-[#0f766e] mr-2">${price.toFixed(2)}</span>
                {originalPrice > 0 && (
                  <>
                    <span className="text-lg text-slate-500 line-through mr-2">${originalPrice.toFixed(2)}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">Save {discount}%</span>
                  </>
                )}
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Select Package Size:</p>
                <Select
                  value={selectedUnit}
                  onValueChange={setSelectedUnit}
                >
                  <SelectTrigger className="w-full">
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
              </div>
              
              <div className="flex items-center mb-6">
                <p className="text-sm text-slate-500 mr-4">Quantity:</p>
                <div className="flex items-center border border-slate-200 rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#0f766e] rounded-r-none"
                    onClick={decreaseQuantity}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#0f766e] rounded-l-none"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button 
                  className="w-full bg-[#0f766e] hover:bg-[#0f766e]/90"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Link href="/cart">
                  <Button className="w-full" variant="outline">
                    View Cart
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  <span>Fast shipping available on orders over $100</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  <span>Quality guaranteed or your money back</span>
                </div>
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Wholesale discounts available for business customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-10">
          <Tabs defaultValue="details">
            <TabsList className="w-full border-b">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="nutrition" className="flex-1">Nutrition</TabsTrigger>
              <TabsTrigger value="storage" className="flex-1">Storage & Handling</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-6">
              <h3 className="text-lg font-medium mb-4">Product Details</h3>
              <p className="text-slate-600 mb-4">{product.description}</p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Premium quality {product.name}</li>
                {product.isOrganic && <li>USDA Certified Organic</li>}
                {product.isLocal && <li>Locally grown and harvested</li>}
                {product.origin && <li>Sourced from {product.origin}</li>}
                <li>Available in multiple package sizes</li>
                <li>Carefully inspected for quality assurance</li>
              </ul>
            </TabsContent>
            <TabsContent value="nutrition" className="p-6">
              <h3 className="text-lg font-medium mb-4">Nutrition Information</h3>
              <p className="text-slate-600 mb-4">
                Nutrition information varies by product. This product is a natural food item that is unprocessed and contains essential nutrients.
              </p>
              <div className="border border-slate-200 rounded-md p-4">
                <h4 className="font-medium mb-2">General Nutritional Benefits:</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li>Rich in essential vitamins and minerals</li>
                  <li>No added preservatives or chemicals</li>
                  <li>Fresh and natural product</li>
                  {product.isOrganic && <li>Organic produce contains fewer pesticides</li>}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="storage" className="p-6">
              <h3 className="text-lg font-medium mb-4">Storage & Handling</h3>
              <p className="text-slate-600 mb-4">
                Proper storage and handling ensures the longest shelf life and best quality for your purchase.
              </p>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-md p-4">
                  <h4 className="font-medium mb-2">Recommended Storage:</h4>
                  <p className="text-slate-600">
                    For optimal freshness, refrigerate immediately upon receipt. Keep at 34-40°F (1-4°C) unless otherwise specified.
                  </p>
                </div>
                <div className="border border-slate-200 rounded-md p-4">
                  <h4 className="font-medium mb-2">Handling:</h4>
                  <p className="text-slate-600">
                    Wash thoroughly before consumption. Handle with clean hands to prevent contamination.
                  </p>
                </div>
                <div className="border border-slate-200 rounded-md p-4">
                  <h4 className="font-medium mb-2">Shelf Life:</h4>
                  <p className="text-slate-600">
                    When properly stored, product should maintain quality for 5-7 days after delivery.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related Products */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <ProductGrid categoryId={product.categoryId} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
