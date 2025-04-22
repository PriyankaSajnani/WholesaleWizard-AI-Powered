import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  WHOLESALE = "wholesale",
  RETAIL = "retail"
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default(UserRole.RETAIL),
  companyName: text("company_name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  address: text("address"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  companyName: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  icon: true,
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  categoryId: integer("category_id").notNull(),
  retailPrice: doublePrecision("retail_price").notNull(),
  wholesalePrice: doublePrecision("wholesale_price").notNull(),
  stock: integer("stock").notNull(),
  unit: text("unit").notNull(),
  unitOptions: jsonb("unit_options").notNull(), // JSON for different unit options e.g. case, lb, unit
  status: text("status").notNull().default("active"),
  isBestseller: boolean("is_bestseller").default(false),
  isLimited: boolean("is_limited").default(false),
  isOrganic: boolean("is_organic").default(false),
  isLocal: boolean("is_local").default(false),
  origin: text("origin"),
  rating: real("rating"),
  originalPrice: doublePrecision("original_price"),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  image: true,
  categoryId: true,
  retailPrice: true,
  wholesalePrice: true,
  stock: true,
  unit: true,
  unitOptions: true,
  status: true,
  isBestseller: true,
  isLimited: true,
  isOrganic: true,
  isLocal: true,
  origin: true,
  rating: true,
  originalPrice: true,
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: doublePrecision("total_amount").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),
  paymentMethod: text("payment_method"),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  totalAmount: true,
  shippingAddress: true,
  billingAddress: true,
  paymentMethod: true,
});

// Order Items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  unitType: text("unit_type").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  unitPrice: true,
  unitType: true,
});

// Cart Items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitType: text("unit_type").notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
  unitType: true,
});

// Types for frontend usage
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
