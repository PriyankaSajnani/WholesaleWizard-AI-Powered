import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TabsContent } from "@/components/ui/tabs";
import AdminLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Trash2, Search, Plus, X } from "lucide-react";
import { Product, Category, InsertProduct } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Form schema for product
const productFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url("Must be a valid URL"),
  categoryId: z.number().min(1, "Category is required"),
  retailPrice: z.number().min(0.01, "Price must be greater than 0"),
  wholesalePrice: z.number().min(0.01, "Price must be greater than 0"),
  originalPrice: z.number().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  unitOptions: z.any(), // This will be handled separately
  status: z.string().min(1, "Status is required"),
  isBestseller: z.boolean().default(false),
  isLimited: z.boolean().default(false),
  isOrganic: z.boolean().default(false),
  isLocal: z.boolean().default(false),
  origin: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const AdminProducts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unitOptions, setUnitOptions] = useState<{ value: string; label: string; price: number }[]>([]);
  
  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Filter products based on search term
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Product form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      categoryId: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      originalPrice: 0,
      stock: 0,
      unit: "unit",
      status: "active",
      isBestseller: false,
      isLimited: false,
      isOrganic: false,
      isLocal: false,
      origin: "",
      rating: 4.5,
    },
  });
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const res = await apiRequest("POST", "/api/products", productData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: number; productData: any }) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, productData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ProductFormValues) => {
    // Convert string values to numbers where needed
    const productData = {
      ...data,
      unitOptions: unitOptions,
    };
    
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };
  
  // Handle adding a unit option
  const addUnitOption = () => {
    setUnitOptions([...unitOptions, { value: "", label: "", price: 0 }]);
  };
  
  // Handle removing a unit option
  const removeUnitOption = (index: number) => {
    const newOptions = [...unitOptions];
    newOptions.splice(index, 1);
    setUnitOptions(newOptions);
  };
  
  // Handle updating a unit option
  const updateUnitOption = (index: number, key: string, value: any) => {
    const newOptions = [...unitOptions];
    newOptions[index] = { ...newOptions[index], [key]: key === 'price' ? Number(value) : value };
    setUnitOptions(newOptions);
  };
  
  // Handle editing a product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      image: product.image,
      categoryId: product.categoryId,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      originalPrice: product.originalPrice || 0,
      stock: product.stock,
      unit: product.unit,
      status: product.status,
      isBestseller: product.isBestseller,
      isLimited: product.isLimited,
      isOrganic: product.isOrganic,
      isLocal: product.isLocal,
      origin: product.origin || "",
      rating: product.rating || 4.5,
    });
    setUnitOptions(product.unitOptions);
    setIsDialogOpen(true);
  };
  
  // Handle opening dialog for new product
  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      image: "",
      categoryId: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      originalPrice: 0,
      stock: 0,
      unit: "unit",
      status: "active",
      isBestseller: false,
      isLimited: false,
      isOrganic: false,
      isLocal: false,
      origin: "",
      rating: 4.5,
    });
    setUnitOptions([]);
    setIsDialogOpen(true);
  };
  
  // Handle deleting a product
  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <TabsContent value="products" className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Products</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90" onClick={handleNewProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? "Update the details of an existing product" 
                    : "Fill in the details to add a new product to your inventory"}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter product description" 
                              rows={3} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter image URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="retailPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retail Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="wholesalePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wholesale Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price ($) (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., case, lb, unit" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="limited">Limited</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Unit Options</h4>
                      <div className="space-y-2">
                        {unitOptions.map((option, index) => (
                          <div key={index} className="flex space-x-2 items-center">
                            <Input
                              placeholder="Value (e.g., case)"
                              value={option.value}
                              onChange={(e) => updateUnitOption(index, 'value', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Label (e.g., Case (40 ct))"
                              value={option.label}
                              onChange={(e) => updateUnitOption(index, 'label', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Price"
                              value={option.price}
                              onChange={(e) => updateUnitOption(index, 'price', e.target.value)}
                              className="w-24"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeUnitOption(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addUnitOption}
                          className="mt-2"
                        >
                          Add Unit Option
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="isBestseller"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Bestseller</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isLimited"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Limited</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isOrganic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Organic</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isLocal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Local</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Washington" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (1-5)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                min="1" 
                                max="5" 
                                placeholder="4.5" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-[#0f766e] hover:bg-[#0f766e]/90"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                      {createProductMutation.isPending || updateProductMutation.isPending
                        ? "Saving..."
                        : editingProduct
                        ? "Update Product"
                        : "Add Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Image</th>
                  <th scope="col" className="px-6 py-3">Product</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Stock</th>
                  <th scope="col" className="px-6 py-3">Retail Price</th>
                  <th scope="col" className="px-6 py-3">Wholesale Price</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProducts ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="bg-white border-b">
                      <td className="px-6 py-4"><Skeleton className="h-10 w-10" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))
                ) : filteredProducts?.length === 0 ? (
                  <tr className="bg-white border-b">
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts?.map((product) => (
                    <tr key={product.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <div>{product.name}</div>
                        <div className="text-xs text-slate-500">#{product.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        {categories?.find(c => c.id === product.categoryId)?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        {product.stock} {product.unit}s
                      </td>
                      <td className="px-6 py-4">${product.retailPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">${product.wholesalePrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : product.status === 'limited' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-slate-800"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-red-500"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

export default AdminProducts;
