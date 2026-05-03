/**
 * GET /api/skills/[id]
 * PUT /api/skills/[id]
 * DELETE /api/skills/[id]
 * Skill by ID endpoint for getting, updating, and deleting a specific skill
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSkillById,
  updateSkill,
  deleteSkill,
} from "@/lib/services/skillService";
import {
  validateUpdateSkillRequest,
} from "@/lib/validation/skill";

/**
 * GET /api/skills/[id]
 * Get a specific skill by ID
 * Query params:
 *   - include_category (optional): "true" to include category details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeCategory = searchParams.get("include_category") === "true";

    const skill = await getSkillById(id, includeCategory);

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
        data: skill,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/skills/[id] error:", error);
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
 * PUT /api/skills/[id]
 * Update a specific skill
 * Body: { name?: string, categoryId?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = validateUpdateSkillRequest(body);

    // Verify skill exists
    const existing = await getSkillById(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    const skill = await updateSkill(id, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: skill,
        message: "Skill updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/skills/[id] error:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 }
        );
      }

      if (error.message.includes("already exists")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 }
        );
      }

      if (
        error.message.includes("must be") ||
        error.message.includes("is required")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

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
 * DELETE /api/skills/[id]
 * Delete a specific skill
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify skill exists
    const existing = await getSkillById(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Skill not found",
        },
        { status: 404 }
      );
    }

    const skill = await deleteSkill(id);

    return NextResponse.json(
      {
        success: true,
        data: skill,
        message: "Skill deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/skills/[id] error:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 }
        );
      }

      if (error.message.includes("Cannot delete")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete skill",
      },
      { status: 500 }
    );
  }
}
