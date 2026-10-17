import { integer, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";
export const scores = sqliteTable("scores", {
 id: text("id").primaryKey(), playerKey: text("player_key").notNull(),
 nickname: text("nickname").notNull(), score: integer("score").notNull(),
 distance: integer("distance").notNull(), createdAt: integer("created_at").notNull(),
}, table => [uniqueIndex("scores_player").on(table.playerKey), index("scores_ranking").on(table.score,table.distance,table.createdAt)]);
export const runTickets = sqliteTable("run_tickets", {
 id: text("id").primaryKey(), seed: integer("seed").notNull(), playerKey: text("player_key").notNull(),
 createdAt: integer("created_at").notNull(), usedAt: integer("used_at"),
}, table => [index("tickets_age").on(table.createdAt)]);
export const rateLimits = sqliteTable("rate_limits", {
 id: text("id").primaryKey(), count: integer("count").notNull(), expiresAt: integer("expires_at").notNull(),
});
