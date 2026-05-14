-- Drop old role_permissions table
DROP TABLE IF EXISTS "role_permissions";

-- CreateTable roles
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateTable model_has_roles (user ↔ role pivot)
CREATE TABLE "model_has_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    CONSTRAINT "model_has_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable model_has_permissions (direct user ↔ permission)
CREATE TABLE "model_has_permissions" (
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    CONSTRAINT "model_has_permissions_pkey" PRIMARY KEY ("user_id","permission_id")
);

-- CreateTable role_has_permissions (role ↔ permission pivot)
CREATE TABLE "role_has_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    CONSTRAINT "role_has_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- AddForeignKey
ALTER TABLE "model_has_roles" ADD CONSTRAINT "model_has_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "model_has_roles" ADD CONSTRAINT "model_has_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "model_has_permissions" ADD CONSTRAINT "model_has_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "model_has_permissions" ADD CONSTRAINT "model_has_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_has_permissions" ADD CONSTRAINT "role_has_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_has_permissions" ADD CONSTRAINT "role_has_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
