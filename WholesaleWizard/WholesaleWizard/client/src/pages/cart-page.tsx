import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/components/cart/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBasket, ChevronRight, CreditCard, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { UserRole } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Checkout form schema
const checkoutFormSchema = z.object({
  shippingAddress: z.string().min(5, "Shipping address is required"),
  billingAddress: z.string().min(5, "Billing address is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const CartPage = () => {
  const { cartItems, updateCartItem, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = user?.role === UserRole.WHOLESALE
      ? item.product?.wholesalePrice || 0
      : item.product?.retailPrice || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.07; // 7% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  // Checkout form
  const checkoutForm = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: user?.address || "",
      billingAddress: user?.address || "",
      paymentMethod: "creditCard",
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (formData: CheckoutFormValues) => {
      if (!user) {
        throw new Error("You must be logged in to checkout");
      }
      
      const orderData = {
        ...formData,
        totalAmount: total,
      };
      
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: () => {
      setIsCheckoutOpen(false);
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCheckoutSubmit = (data: CheckoutFormValues) => {
    createOrderMutation.mutate(data);
  };

  // Handle quantity adjustments
  const handleIncreaseQuantity = (id: number, currentQuantity: number) => {
    updateCartItem(id, currentQuantity + 1);
  };
  
  const handleDecreaseQuantity = (id: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItem(id, currentQuantity - 1);
    }
  };
  
  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <ShoppingBasket className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Your Cart is Empty</h1>
            <p className="text-slate-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Link href="/products">
              <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Cart Items ({cartItems.length})</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => clearCart()}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
              
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <img 
                        src={item.product?.image} 
                        alt={item.product?.name} 
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium text-lg mb-1">{item.product?.name}</h3>
                      <p className="text-sm text-slate-500 mb-2">
                        Unit Type: {item.product?.unitOptions.find(opt => opt.value === item.unitType)?.label || item.unitType}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2 mb-2 md:mb-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="mr-4">
                            <span className="font-bold text-[#0f766e]">
                              ${((user?.role === UserRole.WHOLESALE 
                                ? item.product?.wholesalePrice 
                                : item.product?.retailPrice) * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">
                              (${(user?.role === UserRole.WHOLESALE 
                                ? item.product?.wholesalePrice 
                                : item.product?.retailPrice).toFixed(2)} each)
                            </span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/products">
                <Button variant="outline" className="space-x-2">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  <span>Continue Shopping</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Order Summary Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax (7%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
                
                <div className="text-xs text-slate-500 mt-2">
                  {user?.role === UserRole.WHOLESALE ? (
                    <p>Wholesale pricing applied</p>
                  ) : (
                    <p>Retail pricing applied</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex items-center rounded-md border border-dashed p-3 w-full">
                  <Input 
                    placeholder="Enter coupon code" 
                    className="border-0 focus-visible:ring-0 text-sm p-0 h-auto"
                  />
                  <Button variant="ghost" size="sm" className="text-[#0f766e]">
                    Apply
                  </Button>
                </div>
                
                {user ? (
                  <Sheet open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                    <SheetTrigger asChild>
                      <Button className="w-full bg-[#0f766e] hover:bg-[#0f766e]/90 space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Proceed to Checkout</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md">
                      <SheetHeader>
                        <SheetTitle>Checkout</SheetTitle>
                        <SheetDescription>
                          Complete your order by providing shipping and payment details.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6">
                        <Form {...checkoutForm}>
                          <form onSubmit={checkoutForm.handleSubmit(onCheckoutSubmit)} className="space-y-6">
                            <FormField
                              control={checkoutForm.control}
                              name="shippingAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Shipping Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your shipping address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={checkoutForm.control}
                              name="billingAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Billing Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your billing address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={checkoutForm.control}
                              name="paymentMethod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Payment Method</FormLabel>
                                  <FormControl>
                                    <select 
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      {...field}
                                    >
                                      <option value="creditCard">Credit Card</option>
                                      <option value="paypal">PayPal</option>
                                      <option value="bankTransfer">Bank Transfer</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="space-y-2">
                              <h4 className="font-medium">Order Summary</h4>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shipping:</span>
                                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2">
                                  <span>Total:</span>
                                  <span>${total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <SheetFooter>
                              <Button 
                                type="submit" 
                                className="w-full bg-[#0f766e] hover:bg-[#0f766e]/90"
                                disabled={createOrderMutation.isPending}
                              >
                                {createOrderMutation.isPending ? "Processing..." : "Complete Order"}
                              </Button>
                            </SheetFooter>
                          </form>
                        </Form>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full bg-[#0f766e] hover:bg-[#0f766e]/90">
                      Login to Checkout
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
