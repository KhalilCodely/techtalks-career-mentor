import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/career_path/:id
 * Get a single career path by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Career path ID is required",
        },
        { status: 400 }
      );
    }

    const careerPath = await prisma.careerPath.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            userId: true,
            progress: true,
            createdAt: true,
          },
        },
      },
    });

    if (!careerPath) {
      return NextResponse.json(
        {
          success: false,
          error: "Career path not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: careerPath,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/career_path/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch career path",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/career_path/:id
 * Update a career path by ID (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    requireAdmin(request);

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Career path ID is required",
        },
        { status: 400 }
      );
    }

    // Fetch only id and title for duplicate detection (avoid over-fetching)
    const existing = await prisma.careerPath.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Career path not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    // Build update data
    const updateData: Record<string, string | null> = {};

    if (title !== undefined) {
      if (typeof title !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Title must be a string",
          },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Description must be a string",
          },
          { status: 400 }
        );
      }
      updateData.description = description ? description.trim() : null;
    }

    // Check for duplicate title if being changed
    if (updateData.title && updateData.title !== existing.title) {
      const duplicate = await prisma.careerPath.findUnique({
        where: { title: updateData.title },
        select: { id: true },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            error: "Career path with this title already exists",
          },
          { status: 409 }
        );
      }
    }

    // Update career path
    const updated = await prisma.careerPath.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: "Career path updated successfully",
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

    console.error("PUT /api/career_path/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update career path",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/career_path/:id
 * Delete a career path by ID (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    requireAdmin(request);

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Career path ID is required",
        },
        { status: 400 }
      );
    }

    // Delete career path - Prisma throws P2025 if not found
    try {
      await prisma.careerPath.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('P2025')) {
        return NextResponse.json(
          {
            success: false,
            error: "Career path not found",
          },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Career path deleted successfully",
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

    console.error("DELETE /api/career_path/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete career path",
      },
      { status: 500 }
    );
  }
}
