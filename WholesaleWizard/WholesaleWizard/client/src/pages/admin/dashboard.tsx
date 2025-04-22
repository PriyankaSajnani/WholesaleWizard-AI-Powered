import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "./layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Product, Order, User } from "@shared/schema";

const AdminDashboard = () => {
  // Fetch data for dashboard
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Calculate KPIs
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalUsers = users?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;
  
  // Sample data for charts
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];
  
  const categoryData = [
    { name: 'Fruits', value: 400 },
    { name: 'Vegetables', value: 300 },
    { name: 'Dairy', value: 200 },
    { name: 'Bakery', value: 150 },
    { name: 'Meat', value: 100 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <AdminLayout>
      <TabsContent value="dashboard" className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="space-x-2">
            <Button variant="outline">Export</Button>
            <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90">Refresh</Button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <span className="i-lucide-arrow-up mr-1" />
                    +12.5% from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <span className="i-lucide-arrow-up mr-1" />
                    +8.2% from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <span className="i-lucide-arrow-up mr-1" />
                    +4 new this month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <span className="i-lucide-arrow-up mr-1" />
                    +7 new this month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue for the past 7 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Distribution of sales across product categories</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart width={400} height={400}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Sales']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="ml-auto">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Order ID</th>
                      <th scope="col" className="px-6 py-3">Customer</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Amount</th>
                      <th scope="col" className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.slice(0, 5).map((order) => (
                      <tr key={order.id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">#{order.id}</td>
                        <td className="px-6 py-4">Customer #{order.userId}</td>
                        <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">View All Orders</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </AdminLayout>
  );
};

export default AdminDashboard;
