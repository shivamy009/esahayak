ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "buyer_history" DROP CONSTRAINT "buyer_history_changed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "buyers" DROP CONSTRAINT "buyers_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "buyer_history" ALTER COLUMN "changed_by" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "owner_id" SET DATA TYPE varchar(255);