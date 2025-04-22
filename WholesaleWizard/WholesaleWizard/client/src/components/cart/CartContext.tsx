import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  unitType: string;
  product?: any; // Product details from API
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;
  addToCart: (item: { productId: number; quantity: number; unitType: string }) => void;
  updateCartItem: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: CartProviderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  
  const {
    data: cartItems = [],
    isLoading,
    error,
    refetch
  } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user, // Only fetch if user is logged in
  });
  
  // If user is not logged in, use local storage cart
  useEffect(() => {
    if (!user) {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setLocalCart(JSON.parse(storedCart));
      }
    }
  }, [user]);
  
  // Save local cart to localStorage whenever it changes
  useEffect(() => {
    if (!user && localCart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(localCart));
    }
  }, [localCart, user]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (item: { productId: number; quantity: number; unitType: string }) => {
      const res = await apiRequest("POST", "/api/cart", item);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "The item has been added to your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add item to cart: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart updated",
        description: "The cart has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update cart: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove item from cart: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "Your cart has been cleared.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to clear cart: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Local cart functions
  const addToLocalCart = (item: { productId: number; quantity: number; unitType: string }) => {
    setLocalCart(prev => {
      // Check if item already exists in cart
      const existingItemIndex = prev.findIndex(
        cartItem => cartItem.productId === item.productId && cartItem.unitType === item.unitType
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedCart = [...prev];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        // Add new item
        return [...prev, { 
          id: Date.now(), 
          userId: 0, 
          ...item 
        }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: "The item has been added to your cart.",
    });
  };
  
  const updateLocalCartItem = (id: number, quantity: number) => {
    setLocalCart(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
    
    toast({
      title: "Cart updated",
      description: "The cart has been updated.",
    });
  };
  
  const removeFromLocalCart = (id: number) => {
    setLocalCart(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };
  
  const clearLocalCart = () => {
    setLocalCart([]);
    localStorage.removeItem("cart");
    
    toast({
      title: "Cart cleared",
      description: "Your cart has been cleared.",
    });
  };

  // Wrapper functions that choose between API and local storage
  const addToCart = (item: { productId: number; quantity: number; unitType: string }) => {
    if (user) {
      addToCartMutation.mutate(item);
    } else {
      addToLocalCart(item);
    }
  };
  
  const updateCartItem = (id: number, quantity: number) => {
    if (user) {
      updateCartItemMutation.mutate({ id, quantity });
    } else {
      updateLocalCartItem(id, quantity);
    }
  };
  
  const removeFromCart = (id: number) => {
    if (user) {
      removeFromCartMutation.mutate(id);
    } else {
      removeFromLocalCart(id);
    }
  };
  
  const clearCart = () => {
    if (user) {
      clearCartMutation.mutate();
    } else {
      clearLocalCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: user ? cartItems : localCart,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
