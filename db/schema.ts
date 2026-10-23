import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  managedAssetsValue: text("managed_assets_value").notNull().default("+11M"),
  managedAssetsLabel: text("managed_assets_label").notNull().default("sob gestão"),
  updatedAt: text("updated_at").notNull().default(""),
});

export const adminUsers = sqliteTable("admin_users", {
  email: text("email").primaryKey(),
  createdAt: text("created_at").notNull(),
});
