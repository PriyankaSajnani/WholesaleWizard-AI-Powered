import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { insertProductSchema, insertCategorySchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, UserRole } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is an admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.role === UserRole.ADMIN) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Set up API routes
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      let products;
      if (req.query.categoryId) {
        const categoryId = parseInt(req.query.categoryId as string);
        products = await storage.getProductsByCategory(categoryId);
      } else {
        products = await storage.getAllProducts();
      }
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItems = await storage.getCartItems(userId);
      
      // Get full product data for cart items
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      
      // Check if product exists
      const product = await storage.getProduct(cartItemData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if item already exists in cart
      const existingItems = await storage.getCartItems(userId);
      const existingItem = existingItems.find(
        item => item.productId === cartItemData.productId && item.unitType === cartItemData.unitType
      );
      
      if (existingItem) {
        // Update quantity of existing item
        const updatedItem = await storage.updateCartItem(existingItem.id, {
          quantity: existingItem.quantity + cartItemData.quantity,
        });
        
        const product = await storage.getProduct(updatedItem.productId);
        return res.json({
          ...updatedItem,
          product,
        });
      }
      
      // Add new item to cart
      const cartItem = await storage.createCartItem(cartItemData);
      res.status(201).json({
        ...cartItem,
        product,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if cart item exists and belongs to user
      const cartItems = await storage.getCartItems(userId);
      const cartItem = cartItems.find(item => item.id === id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Update cart item
      const updatedData = insertCartItemSchema.partial().parse({
        ...req.body,
        userId,
      });
      
      const updatedItem = await storage.updateCartItem(id, updatedData);
      const product = await storage.getProduct(updatedItem.productId);
      
      res.json({
        ...updatedItem,
        product,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if cart item exists and belongs to user
      const cartItems = await storage.getCartItems(userId);
      const cartItem = cartItems.find(item => item.id === id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const success = await storage.deleteCartItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Orders
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      let orders;
      
      if (req.user.role === UserRole.ADMIN) {
        // Admin can see all orders
        orders = await storage.getAllOrders();
      } else {
        // Users can only see their own orders
        orders = await storage.getOrdersByUser(req.user.id);
      }
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          
          // Get product details for each item
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return {
                ...item,
                product,
              };
            })
          );
          
          return {
            ...order,
            items: itemsWithProducts,
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is authorized to view this order
      if (req.user.role !== UserRole.ADMIN && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(order.id);
      
      // Get product details for each item
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      res.json({
        ...order,
        items: itemsWithProducts,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total amount
      let totalAmount = 0;
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        
        if (!product) {
          return res.status(400).json({ message: `Product not found: ${item.productId}` });
        }
        
        // Calculate price based on user role and unit type
        const price = req.user.role === UserRole.WHOLESALE ? product.wholesalePrice : product.retailPrice;
        totalAmount += price * item.quantity;
      }
      
      // Create order
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
        totalAmount,
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const orderItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          const price = req.user.role === UserRole.WHOLESALE ? product.wholesalePrice : product.retailPrice;
          
          const orderItemData = insertOrderItemSchema.parse({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: price,
            unitType: item.unitType,
          });
          
          return storage.createOrderItem(orderItemData);
        })
      );
      
      // Clear cart
      await storage.clearCart(userId);
      
      // Return order with items
      res.status(201).json({
        ...order,
        items: orderItems,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = insertOrderSchema.partial().parse(req.body);
      
      const order = await storage.updateOrder(id, orderData);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(order.id);
      
      res.json({
        ...order,
        items,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Users (Admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create chatbot endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { question, history } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }
      
      // Import OpenAI
      const OpenAI = require("openai");
      
      // Create an OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      // Prepare messages for the API call
      const messages = [
        {
          role: "system",
          content: "You are a friendly and helpful assistant for a grocery store called GreenGrocer that specializes in fresh produce. " + 
                   "Answer questions about products, wholesale programs, delivery options, pricing, returns, and other store policies. " +
                   "Keep responses concise and friendly. If you don't know the answer, suggest contacting customer service."
        }
      ];
      
      // Add conversation history if available
      if (history && Array.isArray(history)) {
        messages.push(...history);
      }
      
      // Add the current question
      messages.push({
        role: "user",
        content: question
      });
      
      // Call the OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: messages,
        max_tokens: 300
      });
      
      // Return the response
      res.json({ response: response.choices[0].message.content });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ message: "Error processing chatbot request" });
    }
  });

  // Initialize sample data
  await initializeData();

  const httpServer = createServer(app);
  return httpServer;

  // Helper function to initialize sample data
  async function initializeData() {
    // Check if we already have categories
    const existingCategories = await storage.getAllCategories();
    if (existingCategories.length > 0) {
      return; // Data already initialized
    }
    
    // Create sample categories
    const categories = [
      { name: "Fruits", description: "Fresh fruits from local and international farms", icon: "fa-apple-alt" },
      { name: "Vegetables", description: "Organic and conventional vegetables", icon: "fa-carrot" },
      { name: "Dairy", description: "Milk, cheese, and other dairy products", icon: "fa-cheese" },
      { name: "Bakery", description: "Fresh bread and baked goods", icon: "fa-bread-slice" },
      { name: "Meat", description: "Fresh and frozen meat products", icon: "fa-drumstick-bite" },
      { name: "Organic", description: "Certified organic products", icon: "fa-seedling" },
    ];
    
    const categoryMap = {};
    
    for (const category of categories) {
      const newCategory = await storage.createCategory(category);
      categoryMap[newCategory.name] = newCategory.id;
    }
    
    // Create sample products
    const products = [
      {
        name: "Organic Apples",
        description: "Fresh, crisp organic apples straight from the orchard.",
        image: "https://images.unsplash.com/photo-1546630392-e4faba405ecb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350&q=80",
        categoryId: categoryMap["Fruits"],
        retailPrice: 32.99,
        wholesalePrice: 24.99,
        originalPrice: 29.99,
        stock: 142,
        unit: "case",
        unitOptions: [
          { value: "case", label: "Case (40 ct)", price: 24.99 },
          { value: "half-case", label: "Half Case (20 ct)", price: 14.99 },
          { value: "lb", label: "Per lb", price: 2.49 }
        ],
        status: "active",
        isBestseller: true,
        isOrganic: true,
        origin: "Washington",
        rating: 4.8
      },
      {
        name: "Fresh Carrots",
        description: "Sweet, crunchy carrots perfect for cooking or snacking.",
        image: "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350&q=80",
        categoryId: categoryMap["Vegetables"],
        retailPrice: 22.00,
        wholesalePrice: 18.50,
        originalPrice: 22.00,
        stock: 450,
        unit: "case",
        unitOptions: [
          { value: "case", label: "Case (20 lb)", price: 18.50 },
          { value: "half-case", label: "Half Case (10 lb)", price: 10.99 },
          { value: "lb", label: "Per lb", price: 1.99 }
        ],
        status: "active",
        isLocal: true,
        rating: 4.5
      },
      {
        name: "Organic Strawberries",
        description: "Sweet, juicy organic strawberries, freshly picked.",
        image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350&q=80",
        categoryId: categoryMap["Fruits"],
        retailPrice: 38.00,
        wholesalePrice: 32.50,
        originalPrice: 38.00,
        stock: 84,
        unit: "flat",
        unitOptions: [
          { value: "flat", label: "Flat (8 qt)", price: 32.50 },
          { value: "half-flat", label: "Half Flat (4 qt)", price: 18.25 },
          { value: "quart", label: "Single Quart", price: 5.99 }
        ],
        status: "active",
        isLimited: true,
        isOrganic: true,
        origin: "California",
        rating: 4.9
      },
      {
        name: "Premium Milk",
        description: "Rich, creamy whole milk from grass-fed cows.",
        image: "https://images.unsplash.com/photo-1593114070538-560c8b7e83e5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350&q=80",
        categoryId: categoryMap["Dairy"],
        retailPrice: 34.99,
        wholesalePrice: 28.99,
        originalPrice: 34.99,
        stock: 90,
        unit: "case",
        unitOptions: [
          { value: "case", label: "Case (12 bottles)", price: 28.99 },
          { value: "half-case", label: "Half Case (6 bottles)", price: 15.99 },
          { value: "bottle", label: "Single Bottle", price: 2.99 }
        ],
        status: "active",
        isLocal: true,
        rating: 4.7
      }
    ];
    
    for (const product of products) {
      await storage.createProduct(product);
    }
    
    // Create admin user
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      await storage.createUser({
        username: "admin",
        password: await hashPassword("admin123"),
        email: "admin@greengrocer.com",
        role: UserRole.ADMIN,
        firstName: "Admin",
        lastName: "User"
      });
    }
    
    // Create wholesale user
    const existingWholesale = await storage.getUserByUsername("wholesale");
    if (!existingWholesale) {
      await storage.createUser({
        username: "wholesale",
        password: await hashPassword("wholesale123"),
        email: "wholesale@example.com",
        role: UserRole.WHOLESALE,
        companyName: "Restaurant Supply Co",
        firstName: "Wholesale",
        lastName: "Customer",
        phone: "555-123-4567",
        address: "123 Business St, Commerce City, CA 90001"
      });
    }
    
    // Create retail user
    const existingRetail = await storage.getUserByUsername("retail");
    if (!existingRetail) {
      await storage.createUser({
        username: "retail",
        password: await hashPassword("retail123"),
        email: "retail@example.com",
        role: UserRole.RETAIL,
        firstName: "Retail",
        lastName: "Customer",
        phone: "555-987-6543",
        address: "456 Main St, Anytown, CA 90002"
      });
    }
  }
}
