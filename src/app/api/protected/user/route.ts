import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

type JWTPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

/**
 * GET /api/protected/user
 * Get the logged-in user's profile information
 * Requires valid JWT token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Check for middleware headers first
    const middlewareUserId = request.headers.get("x-user-id");
    if (middlewareUserId) {
      const user = await prisma.user.findUnique({
        where: { id: middlewareUserId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: user,
        },
        { status: 200 }
      );
    }

    // Otherwise, verify JWT token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "No authorization header provided",
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
        },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
        },
        { status: 500 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 }
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        {
          success: false,
          error: "Token expired",
        },
        { status: 401 }
      );
    }

    console.error("GET /api/protected/user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user profile",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/protected/user
 * Update the logged-in user's profile information
 * Requires valid JWT token in Authorization header
 */
export async function PUT(request: NextRequest) {
  try {
    // Check for middleware headers first
    const middlewareUserId = request.headers.get("x-user-id");
    let userId = middlewareUserId;

    if (!userId) {
      // Otherwise, verify JWT token from Authorization header
      const authHeader = request.headers.get("authorization");

      if (!authHeader) {
        return NextResponse.json(
          {
            success: false,
            error: "No authorization header provided",
          },
          { status: 401 }
        );
      }

      const token = authHeader.replace(/^Bearer\s+/i, "").trim();

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid authorization header format",
          },
          { status: 401 }
        );
      }

      if (!process.env.JWT_SECRET) {
        return NextResponse.json(
          {
            success: false,
            error: "Server configuration error",
          },
          { status: 500 }
        );
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
        userId = decoded.userId;
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid or expired token",
          },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { bio, education, experienceLevel, careerGoal } = body;

    // Check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await prisma.profile.create({
        data: {
          userId,
          bio: bio || null,
          education: education || null,
          experienceLevel: experienceLevel || null,
          careerGoal: careerGoal || null,
        },
      });
    } else {
      // Update profile
      profile = await prisma.profile.update({
        where: { userId },
        data: {
          bio: bio !== undefined ? bio : profile.bio,
          education: education !== undefined ? education : profile.education,
          experienceLevel:
            experienceLevel !== undefined
              ? experienceLevel
              : profile.experienceLevel,
          careerGoal:
            careerGoal !== undefined ? careerGoal : profile.careerGoal,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/protected/user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/protected/user
 * Update user notification preferences (toggles)
 * Requires valid JWT token in Authorization header
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check for middleware headers first
    const middlewareUserId = request.headers.get("x-user-id");
    let userId = middlewareUserId;

    if (!userId) {
      // Otherwise, verify JWT token from Authorization header
      const authHeader = request.headers.get("authorization");

      if (!authHeader) {
        return NextResponse.json(
          {
            success: false,
            error: "No authorization header provided",
          },
          { status: 401 }
        );
      }

      const token = authHeader.replace(/^Bearer\s+/i, "").trim();

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid authorization header format",
          },
          { status: 401 }
        );
      }

      if (!process.env.JWT_SECRET) {
        return NextResponse.json(
          {
            success: false,
            error: "Server configuration error",
          },
          { status: 500 }
        );
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
        userId = decoded.userId;
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid or expired token",
          },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { emailNotifications, weeklyProgressReports, communityUpdates } = body;

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotifications:
          emailNotifications !== undefined
            ? emailNotifications
            : undefined,
        weeklyProgressReports:
          weeklyProgressReports !== undefined
            ? weeklyProgressReports
            : undefined,
        communityUpdates:
          communityUpdates !== undefined ? communityUpdates : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailNotifications: true,
        weeklyProgressReports: true,
        communityUpdates: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/protected/user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update preferences",
      },
      { status: 500 }
    );
  }
}
