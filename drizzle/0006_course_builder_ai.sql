CREATE TYPE "public"."ai_generation_status" AS ENUM('generating', 'done', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "ai_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"status" "ai_generation_status" DEFAULT 'generating' NOT NULL,
	"brief" jsonb NOT NULL,
	"model" text NOT NULL,
	"lessons_total" integer DEFAULT 0 NOT NULL,
	"lessons_done" integer DEFAULT 0 NOT NULL,
	"lessons_failed" integer DEFAULT 0 NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"error" text,
	"heartbeat_at" timestamp with time zone,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "ai_status" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "ai_error" text;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_generations_program_idx" ON "ai_generations" USING btree ("program_id");