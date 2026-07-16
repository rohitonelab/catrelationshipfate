import { pgTable, text, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionStateEnum = pgEnum("session_state", [
  "waiting_a",
  "waiting_b",
  "complete",
]);

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  partnerBToken: text("partner_b_token").notNull().unique(),
  state: sessionStateEnum("state").notNull().default("waiting_a"),
  partnerAName: text("partner_a_name"),
  partnerBName: text("partner_b_name"),
  answersA: jsonb("answers_a").$type<number[]>(),
  answersB: jsonb("answers_b").$type<number[]>(),
  verdict: jsonb("verdict").$type<VerdictData>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;

export interface VerdictCard {
  type:
    | "couple_title"
    | "secret_strength"
    | "mild_complaint"
    | "funniest_contradiction"
    | "future_prediction"
    | "court_sentence";
  emoji: string;
  title: string;
  description: string;
  catReaction: string | null;
}

export interface VerdictData {
  partnerAName: string;
  partnerBName: string;
  alignmentScore: number;
  diceRoll: { die1: number; die2: number; total: number };
  cards: VerdictCard[];
}
