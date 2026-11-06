CREATE TYPE "public"."evaluation_status" AS ENUM('recording', 'questions', 'awaiting_trainer', 'approved', 'needs_revision');--> statement-breakpoint
CREATE TABLE "evaluation_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial" text NOT NULL,
	"user_id" uuid NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evaluation_certificates_serial_unique" UNIQUE("serial"),
	CONSTRAINT "evaluation_certificates_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "project_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "evaluation_status" DEFAULT 'recording' NOT NULL,
	"slides_path" text,
	"slides_name" text,
	"video_path" text,
	"camera_path" text,
	"audio_path" text,
	"duration_sec" integer,
	"transcript" text,
	"questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"report" jsonb,
	"ai_score" integer,
	"trainer_id" uuid,
	"trainer_note" text,
	"submitted_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evaluation_certificates" ADD CONSTRAINT "evaluation_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_certificates" ADD CONSTRAINT "evaluation_certificates_evaluation_id_project_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."project_evaluations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_evaluations" ADD CONSTRAINT "project_evaluations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_evaluations" ADD CONSTRAINT "project_evaluations_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evaluations_user_idx" ON "project_evaluations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "evaluations_status_idx" ON "project_evaluations" USING btree ("status");