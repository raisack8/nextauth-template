CREATE TABLE "app_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"username" text NOT NULL,
	"is_linked" boolean DEFAULT false NOT NULL,
	"anonymous_id" text,
	"google_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "app_users_email_unique" UNIQUE("email"),
	CONSTRAINT "app_users_anonymous_id_unique" UNIQUE("anonymous_id"),
	CONSTRAINT "app_users_google_id_unique" UNIQUE("google_id")
);
