import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const formatSkill = (skill: {
  id: string;
  name: string;
  createdAt: Date;
  category: { name: string } | null;
}) => ({
  id: skill.id,
  name: skill.name,
  category: skill.category?.name ?? null,
  createdAt: skill.createdAt,
});

/**
 * GET /api/skills
 * Get all skills or filter by category name.
 * Query params: category (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category")?.trim();

    const skills = await prisma.skill.findMany({
      where: category
        ? {
            category: {
              is: {
                name: {
                  equals: category,
                  mode: "insensitive",
                },
              },
            },
          }
        : undefined,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: skills.map(formatSkill),
        count: skills.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch skills",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills
 * Create a new skill (admin only)
 * Body: { name: string, category: string }
 */
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const body = await request.json();
    const { name, category } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Skill name is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (category !== undefined && typeof category !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Category must be a string",
        },
        { status: 400 }
      );
    }

    const skillName = name.trim();
    const categoryName = category?.trim();

    if (!skillName) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill name cannot be empty",
        },
        { status: 400 }
      );
    }

    let categoryId: string | null = null;

    if (categoryName) {
      const categoryRecord = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = categoryRecord.id;
    }

    const existingSkill = await prisma.skill.findFirst({
      where: {
        name: {
          equals: skillName,
          mode: "insensitive",
        },
        categoryId,
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill with this name and category already exists",
        },
        { status: 409 }
      );
    }

    const newSkill = await prisma.skill.create({
      data: {
        name: skillName,
        categoryId,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: formatSkill(newSkill),
        message: "Skill created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No authorization header")) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized - Admin access required",
          },
          { status: 401 }
        );
      }

      if (error.message.includes("Forbidden")) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden - Admins only",
          },
          { status: 403 }
        );
      }
    }

    console.error("POST /api/skills error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create skill",
      },
      { status: 500 }
    );
  }
}
