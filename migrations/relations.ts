import { relations } from "drizzle-orm/relations";
import { users, emailCampaigns, categories, products, suppliers, locations, inventory, orders, customers, orderStatusHistory, orderItems, purchaseOrders, customerInteractions } from "./schema";

export const emailCampaignsRelations = relations(emailCampaigns, ({one}) => ({
	user: one(users, {
		fields: [emailCampaigns.createdBy],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	emailCampaigns: many(emailCampaigns),
	orders: many(orders),
	orderStatusHistories: many(orderStatusHistory),
	purchaseOrders: many(purchaseOrders),
	customerInteractions: many(customerInteractions),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	supplier: one(suppliers, {
		fields: [products.supplierId],
		references: [suppliers.id]
	}),
	inventories: many(inventory),
	orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));

export const suppliersRelations = relations(suppliers, ({many}) => ({
	products: many(products),
	purchaseOrders: many(purchaseOrders),
}));

export const inventoryRelations = relations(inventory, ({one}) => ({
	location: one(locations, {
		fields: [inventory.locationId],
		references: [locations.id]
	}),
	product: one(products, {
		fields: [inventory.productId],
		references: [products.id]
	}),
}));

export const locationsRelations = relations(locations, ({many}) => ({
	inventories: many(inventory),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user: one(users, {
		fields: [orders.assignedTo],
		references: [users.id]
	}),
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.id]
	}),
	orderStatusHistories: many(orderStatusHistory),
	orderItems: many(orderItems),
}));

export const customersRelations = relations(customers, ({many}) => ({
	orders: many(orders),
	customerInteractions: many(customerInteractions),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({one}) => ({
	user: one(users, {
		fields: [orderStatusHistory.changedBy],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [orderStatusHistory.orderId],
		references: [orders.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({one}) => ({
	user: one(users, {
		fields: [purchaseOrders.createdBy],
		references: [users.id]
	}),
	supplier: one(suppliers, {
		fields: [purchaseOrders.supplierId],
		references: [suppliers.id]
	}),
}));

export const customerInteractionsRelations = relations(customerInteractions, ({one}) => ({
	customer: one(customers, {
		fields: [customerInteractions.customerId],
		references: [customers.id]
	}),
	user: one(users, {
		fields: [customerInteractions.staffMember],
		references: [users.id]
	}),
}));