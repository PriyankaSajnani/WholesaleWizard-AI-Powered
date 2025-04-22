import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TabsContent } from "@/components/ui/tabs";
import AdminLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCog, Mail, Phone, MapPin } from "lucide-react";
import { User, UserRole } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";

const AdminCustomers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filtered users based on search term and role
  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Count users by role
  const retailUsersCount = users?.filter((user) => user.role === UserRole.RETAIL).length || 0;
  const wholesaleUsersCount = users?.filter((user) => user.role === UserRole.WHOLESALE).length || 0;
  const adminUsersCount = users?.filter((user) => user.role === UserRole.ADMIN).length || 0;

  // Handle viewing user details
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  // Get role badge class
  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-purple-100 text-purple-800";
      case UserRole.WHOLESALE:
        return "bg-blue-100 text-blue-800";
      case UserRole.RETAIL:
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <AdminLayout>
      <TabsContent value="customers" className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Customers</h2>
          <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90">Export Customers</Button>
        </div>

        {/* Customer Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Retail Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{retailUsersCount}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Wholesale Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{wholesaleUsersCount}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{adminUsersCount}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant={roleFilter === "all" ? "default" : "outline"}
              className={roleFilter === "all" ? "bg-[#0f766e] hover:bg-[#0f766e]/90" : ""}
              onClick={() => setRoleFilter("all")}
            >
              All
            </Button>
            <Button
              variant={roleFilter === UserRole.RETAIL ? "default" : "outline"}
              className={roleFilter === UserRole.RETAIL ? "bg-[#0f766e] hover:bg-[#0f766e]/90" : ""}
              onClick={() => setRoleFilter(UserRole.RETAIL)}
            >
              Retail
            </Button>
            <Button
              variant={roleFilter === UserRole.WHOLESALE ? "default" : "outline"}
              className={roleFilter === UserRole.WHOLESALE ? "bg-[#0f766e] hover:bg-[#0f766e]/90" : ""}
              onClick={() => setRoleFilter(UserRole.WHOLESALE)}
            >
              Wholesale
            </Button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Role</th>
                  <th scope="col" className="px-6 py-3">Company</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="bg-white border-b">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full mr-3" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                    </tr>
                  ))
                ) : filteredUsers?.length === 0 ? (
                  <tr className="bg-white border-b">
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredUsers?.map((user) => (
                    <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-semibold mr-3">
                            {user.firstName?.[0] || user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-slate-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.companyName || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center text-[#0f766e]"
                          onClick={() => handleViewUser(user)}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Sheet */}
        <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            {selectedUser && (
              <>
                <SheetHeader>
                  <SheetTitle>Customer Details</SheetTitle>
                  <SheetDescription>
                    Customer ID: #{selectedUser.id}
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6">
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xl font-semibold mr-4">
                      {selectedUser.firstName?.[0] || selectedUser.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">@{selectedUser.username}</p>
                      <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(selectedUser.role)}`}>
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Contact Information</h3>
                      <div className="bg-slate-50 rounded-md p-3 space-y-2">
                        <div className="flex items-start">
                          <Mail className="h-4 w-4 text-slate-500 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm">{selectedUser.email}</p>
                          </div>
                        </div>
                        
                        {selectedUser.phone && (
                          <div className="flex items-start">
                            <Phone className="h-4 w-4 text-slate-500 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium">Phone</p>
                              <p className="text-sm">{selectedUser.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedUser.role === UserRole.WHOLESALE && selectedUser.companyName && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Company</h3>
                        <div className="bg-slate-50 rounded-md p-3">
                          <p className="text-sm">{selectedUser.companyName}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedUser.address && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Address</h3>
                        <div className="bg-slate-50 rounded-md p-3 flex items-start">
                          <MapPin className="h-4 w-4 text-slate-500 mt-0.5 mr-2" />
                          <p className="text-sm">{selectedUser.address}</p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Account Details</h3>
                      <div className="bg-slate-50 rounded-md p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Username:</span>
                          <span className="text-sm font-medium">{selectedUser.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">User ID:</span>
                          <span className="text-sm font-medium">#{selectedUser.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Close</Button>
                  </SheetClose>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </TabsContent>
    </AdminLayout>
  );
};

export default AdminCustomers;
