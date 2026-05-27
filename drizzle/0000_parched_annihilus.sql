CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" varchar(200) NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(200) NOT NULL,
	"phone" varchar(50),
	"country" varchar(100),
	"category" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"locale" varchar(8) DEFAULT 'ko' NOT NULL,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"category" varchar(50) NOT NULL,
	"published_at" timestamp with time zone,
	"is_published" boolean DEFAULT false NOT NULL,
	"thumbnail_url" text,
	"external_url" text,
	"title_ko" varchar(300) NOT NULL,
	"summary_ko" text NOT NULL,
	"body_ko" text,
	"title_en" varchar(300),
	"summary_en" text,
	"body_en" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploaded_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" varchar(50) NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"filename" varchar(300) NOT NULL,
	"content_type" varchar(100),
	"size_bytes" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "news_posts_published_at_idx" ON "news_posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "news_posts_is_published_idx" ON "news_posts" USING btree ("is_published");