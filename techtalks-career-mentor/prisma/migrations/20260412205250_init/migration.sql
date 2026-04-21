-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('CAREER', 'SKILLS', 'COURSES');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bio" TEXT,
    "education" TEXT,
    "experience_level" VARCHAR(50),
    "career_goal" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(80),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "level" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_paths" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "career_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_career_paths" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "career_path_id" UUID NOT NULL,
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_career_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chats" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "provider" VARCHAR(120) NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "skill_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_profiles_experience_level" ON "profiles"("experience_level");

-- CreateIndex
CREATE INDEX "idx_skills_category" ON "skills"("category");

-- CreateIndex
CREATE UNIQUE INDEX "uq_skills_name_category" ON "skills"("name", "category");

-- CreateIndex
CREATE INDEX "idx_user_skills_user_id" ON "user_skills"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_skills_skill_id" ON "user_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_skills_user_skill" ON "user_skills"("user_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_career_paths_title" ON "career_paths"("title");

-- CreateIndex
CREATE INDEX "idx_user_career_paths_user_id" ON "user_career_paths"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_career_paths_career_path_id" ON "user_career_paths"("career_path_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_career_paths_user_path" ON "user_career_paths"("user_id", "career_path_id");

-- CreateIndex
CREATE INDEX "idx_ai_chats_user_created_at" ON "ai_chats"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_ai_recommendations_user_type" ON "ai_recommendations"("user_id", "type");

-- CreateIndex
CREATE INDEX "idx_ai_recommendations_created_at" ON "ai_recommendations"("created_at");

-- CreateIndex
CREATE INDEX "idx_courses_skill_id" ON "courses"("skill_id");

-- CreateIndex
CREATE INDEX "idx_courses_provider" ON "courses"("provider");

-- CreateIndex
CREATE INDEX "idx_user_progress_user_id" ON "user_progress"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_progress_course_id" ON "user_progress"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_progress_user_course" ON "user_progress"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_career_paths" ADD CONSTRAINT "user_career_paths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_career_paths" ADD CONSTRAINT "user_career_paths_career_path_id_fkey" FOREIGN KEY ("career_path_id") REFERENCES "career_paths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chats" ADD CONSTRAINT "ai_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
