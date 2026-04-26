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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/skills/:id
 * Get a single skill by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill ID is required",
        },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!skill) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: formatSkill(skill),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/skills/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch skill",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/skills/:id
 * Update a skill by ID (admin only)
 * Body: { name?: string, category?: string }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    requireAdmin(request);

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill ID is required",
        },
        { status: 400 }
      );
    }

    const existingSkill = await prisma.skill.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, category } = body;

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Name must be a string",
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

    const nextName = name !== undefined ? name.trim() : existingSkill.name;

    if (!nextName) {
      return NextResponse.json(
        {
          success: false,
          error: "Name cannot be empty",
        },
        { status: 400 }
      );
    }

    let nextCategoryId = existingSkill.categoryId;

    if (category !== undefined) {
      const categoryName = category.trim();
      if (!categoryName) {
        nextCategoryId = null;
      } else {
        const categoryRecord = await prisma.category.upsert({
          where: { name: categoryName },
          update: {},
          create: { name: categoryName },
        });
        nextCategoryId = categoryRecord.id;
      }
    }

    const duplicate = await prisma.skill.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: nextName,
          mode: "insensitive",
        },
        categoryId: nextCategoryId,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill with this name and category already exists",
        },
        { status: 409 }
      );
    }

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        name: nextName,
        categoryId: nextCategoryId,
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
        data: formatSkill(updatedSkill),
        message: "Skill updated successfully",
      },
      { status: 200 }
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

    console.error("PUT /api/skills/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update skill",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/skills/:id
 * Delete a skill by ID (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    requireAdmin(request);

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill ID is required",
        },
        { status: 400 }
      );
    }

    const existingSkill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    await prisma.skill.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Skill deleted successfully",
      },
      { status: 200 }
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

    console.error("DELETE /api/skills/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete skill",
      },
      { status: 500 }
    );
  }
}
