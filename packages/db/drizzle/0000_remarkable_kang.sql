CREATE TABLE `alert_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`certification_type_id` text NOT NULL,
	`enabled` integer,
	`alert_days` integer NOT NULL,
	`warning_days` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`certification_type_id`) REFERENCES `certification_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `caces_certifications` (
	`id` text PRIMARY KEY NOT NULL,
	`certification_id` text NOT NULL,
	`category` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `certification_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`has_category` integer,
	`is_active` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certification_types_name_unique` ON `certification_types` (`name`);--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`certification_type_id` text NOT NULL,
	`obtained_date` integer NOT NULL,
	`expiration_date` integer,
	`document_path` text,
	`is_active` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`certification_type_id`) REFERENCES `certification_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `driving_authorizations` (
	`id` text PRIMARY KEY NOT NULL,
	`certification_id` text NOT NULL,
	`authorization_date` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_number` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text,
	`phone` text,
	`arrival_date` integer NOT NULL,
	`contract_type` text NOT NULL,
	`role_id` text NOT NULL,
	`warehouse_id` text NOT NULL,
	`is_active` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employees_employee_number_unique` ON `employees` (`employee_number`);--> statement-breakpoint
CREATE TABLE `medical_visits` (
	`id` text PRIMARY KEY NOT NULL,
	`certification_id` text NOT NULL,
	`visit_type` text NOT NULL,
	`visit_date` integer NOT NULL,
	`result` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `online_trainings` (
	`id` text PRIMARY KEY NOT NULL,
	`certification_id` text NOT NULL,
	`training_date` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `snoozed_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`certification_id` text NOT NULL,
	`reason` text,
	`snoozed_until` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer,
	`created_at` integer,
	`updated_at` integer
);
