CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `run_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`seed` integer NOT NULL,
	`player_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`used_at` integer
);
--> statement-breakpoint
CREATE INDEX `tickets_age` ON `run_tickets` (`created_at`);--> statement-breakpoint
CREATE TABLE `scores` (
	`id` text PRIMARY KEY NOT NULL,
	`player_key` text NOT NULL,
	`nickname` text NOT NULL,
	`score` integer NOT NULL,
	`distance` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scores_player` ON `scores` (`player_key`);--> statement-breakpoint
CREATE INDEX `scores_ranking` ON `scores` (`score`,`distance`,`created_at`);