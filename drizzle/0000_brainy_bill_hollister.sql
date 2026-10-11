CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`managed_assets_value` text DEFAULT '+11M' NOT NULL,
	`managed_assets_label` text DEFAULT 'sob gestão' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
