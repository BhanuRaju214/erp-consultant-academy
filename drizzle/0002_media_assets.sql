CREATE TYPE "public"."media_kind" AS ENUM('image', 'document', 'video', 'other');--> statement-breakpoint
CREATE TYPE "public"."media_status" AS ENUM('pending', 'ready', 'errored');--> statement-breakpoint
CREATE TYPE "public"."media_visibility" AS ENUM('public', 'authenticated', 'private');--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "media_kind" NOT NULL,
	"status" "media_status" DEFAULT 'ready' NOT NULL,
	"visibility" "media_visibility" DEFAULT 'authenticated' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text DEFAULT 'application/octet-stream' NOT NULL,
	"size_bytes" bigint,
	"storage" text NOT NULL,
	"storage_key" text,
	"mux_upload_id" text,
	"mux_asset_id" text,
	"mux_playback_id" text,
	"duration_seconds" integer,
	"error" text,
	"course_id" uuid,
	"uploaded_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_storage_key_idx" ON "media_assets" USING btree ("storage","storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_mux_upload_idx" ON "media_assets" USING btree ("mux_upload_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_mux_asset_idx" ON "media_assets" USING btree ("mux_asset_id");--> statement-breakpoint
CREATE INDEX "media_assets_kind_idx" ON "media_assets" USING btree ("kind","created_at");