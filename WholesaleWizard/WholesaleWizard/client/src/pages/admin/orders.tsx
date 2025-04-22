import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { TabsContent } from "@/components/ui/tabs";
import AdminLayout from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, ChevronDown, CheckCircle, Clock, Package, Truck } from "lucide-react";
import { Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminOrders = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update order: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Filter orders based on search term and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order.id.toString().includes(searchTerm) || 
      order.userId.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Group orders by status for the dashboard
  const pendingOrders = orders?.filter(order => order.status === "pending")?.length || 0;
  const processingOrders = orders?.filter(order => order.status === "processing")?.length || 0;
  const shippedOrders = orders?.filter(order => order.status === "shipped")?.length || 0;
  const deliveredOrders = orders?.filter(order => order.status === "delivered")?.length || 0;
  
  // Total revenue
  const totalRevenue = orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;
  
  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateOrderStatusMutation.mutate({ id, status });
  };
  
  // Handle view order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <TabsContent value="orders" className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Orders</h2>
          <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90">Export Orders</Button>
        </div>
        
        {/* Order Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pending</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                  <div className="text-2xl font-bold">{pendingOrders}</div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Processing</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <Package className="h-5 w-5 mr-2 text-blue-500" />
                  <div className="text-2xl font-bold">{processingOrders}</div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Shipped</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <Truck className="h-5 w-5 mr-2 text-purple-500" />
                  <div className="text-2xl font-bold">{shippedOrders}</div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Delivered</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  <div className="text-2xl font-bold">{deliveredOrders}</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Order ID</th>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="bg-white border-b">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                    </tr>
                  ))
                ) : filteredOrders?.length === 0 ? (
                  <tr className="bg-white border-b">
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders?.map((order) => (
                    <tr key={order.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">#ORD-{order.id}</td>
                      <td className="px-6 py-4">
                        Customer #{order.userId}
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          order.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' 
                            : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            : order.status === 'shipped'
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                            : order.status === 'delivered'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center text-[#0f766e]"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                              <SheetHeader>
                                <SheetTitle>Order #ORD-{order.id}</SheetTitle>
                                <SheetDescription>
                                  {formatDate(order.orderDate)}
                                </SheetDescription>
                              </SheetHeader>
                              
                              {selectedOrder && (
                                <div className="py-6">
                                  <div className="flex justify-between items-center mb-6">
                                    <div>
                                      <h3 className="font-medium">Customer</h3>
                                      <p className="text-sm text-slate-500">Customer #{selectedOrder.userId}</p>
                                    </div>
                                    <Select 
                                      value={selectedOrder.status}
                                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-6">
                                    <div>
                                      <h3 className="font-medium mb-2">Shipping Address</h3>
                                      <p className="text-sm bg-slate-50 p-3 rounded-md">
                                        {selectedOrder.shippingAddress || "No shipping address provided"}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <h3 className="font-medium mb-2">Billing Address</h3>
                                      <p className="text-sm bg-slate-50 p-3 rounded-md">
                                        {selectedOrder.billingAddress || "No billing address provided"}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <h3 className="font-medium mb-2">Payment Method</h3>
                                      <p className="text-sm bg-slate-50 p-3 rounded-md">
                                        {selectedOrder.paymentMethod || "No payment method provided"}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <h3 className="font-medium mb-2">Order Items</h3>
                                      {selectedOrder.items?.length > 0 ? (
                                        <div className="space-y-2">
                                          {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="bg-slate-50 p-3 rounded-md flex justify-between">
                                              <div>
                                                <p className="font-medium">{item.product?.name}</p>
                                                <p className="text-xs text-slate-500">
                                                  {item.quantity} x {item.unitType} @ ${item.unitPrice.toFixed(2)}
                                                </p>
                                              </div>
                                              <p className="font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-slate-500">No items found</p>
                                      )}
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-md">
                                      <div className="flex justify-between mb-2">
                                        <p className="text-sm">Subtotal</p>
                                        <p className="text-sm font-medium">${selectedOrder.totalAmount.toFixed(2)}</p>
                                      </div>
                                      <div className="flex justify-between mb-2">
                                        <p className="text-sm">Tax</p>
                                        <p className="text-sm font-medium">Included</p>
                                      </div>
                                      <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                                        <p className="font-medium">Total</p>
                                        <p className="font-bold">${selectedOrder.totalAmount.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <SheetFooter>
                                <SheetClose asChild>
                                  <Button variant="outline">Close</Button>
                                </SheetClose>
                              </SheetFooter>
                            </SheetContent>
                          </Sheet>
                          
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="h-9 w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>
    </AdminLayout>
  );
};

export default AdminOrders;
