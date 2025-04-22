import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CartPage from "@/pages/cart-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/components/chatbot/ChatBot";

function Router() {
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id">
        {params => <ProductDetailPage id={parseInt(params.id)} />}
      </Route>
      <Route path="/cart" component={CartPage} />
      
      {/* Admin routes */}
      <ProtectedRoute 
        path="/admin" 
        component={AdminDashboard} 
        requiredRole={UserRole.ADMIN} 
      />
      <ProtectedRoute 
        path="/admin/products" 
        component={AdminProducts} 
        requiredRole={UserRole.ADMIN} 
      />
      <ProtectedRoute 
        path="/admin/orders" 
        component={AdminOrders} 
        requiredRole={UserRole.ADMIN} 
      />
      <ProtectedRoute 
        path="/admin/customers" 
        component={AdminCustomers} 
        requiredRole={UserRole.ADMIN} 
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Header />
          <main className="min-h-screen">
            <Router />
          </main>
          <Footer />
          <ChatBot />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
