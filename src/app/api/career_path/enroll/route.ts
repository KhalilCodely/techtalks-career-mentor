import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/career_path/enroll
 * Enroll a user in a career path
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, careerPathId } = body;

    if (!userId || !careerPathId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId and careerPathId are required",
        },
        { status: 400 }
      );
    }

    // Parallelize user and career path lookups (reduce from 4 sequential to ~2 calls)
    // Use select: { id: true } to avoid over-fetching
    const [user, careerPath] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
      prisma.careerPath.findUnique({
        where: { id: careerPathId },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    if (!careerPath) {
      return NextResponse.json(
        {
          success: false,
          error: "Career path not found",
        },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.userCareerPath.findUnique({
      where: {
        userId_careerPathId: {
          userId,
          careerPathId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: false,
          error: "User is already enrolled in this career path",
        },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.userCareerPath.create({
      data: {
        userId,
        careerPathId,
        progress: 0,
      },
      include: {
        careerPath: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: enrollment,
        message: "User enrolled successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/career_path/enroll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to enroll user in career path",
      },
      { status: 500 }
    );
  }
}
