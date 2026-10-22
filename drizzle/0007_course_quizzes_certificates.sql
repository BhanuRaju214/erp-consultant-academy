CREATE TABLE "program_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial" text NOT NULL,
	"user_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "program_certificates_serial_unique" UNIQUE("serial")
);
--> statement-breakpoint
ALTER TABLE "ai_generations" ADD COLUMN "quizzes_total" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD COLUMN "quizzes_done" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD COLUMN "quizzes_failed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "program_certificates" ADD CONSTRAINT "program_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_certificates" ADD CONSTRAINT "program_certificates_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "program_certificates_user_program_idx" ON "program_certificates" USING btree ("user_id","program_id");