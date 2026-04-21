import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PROFILE_FIELDS = ["bio", "education", "experienceLevel", "careerGoal"] as const;

type ProfileInput = Partial<{
  bio: string | null;
  education: string | null;
  experienceLevel: string | null;
  careerGoal: string | null;
}>;

function parseProfileBody(body: unknown):
  | { ok: true; data: ProfileInput }
  | { ok: false; error: string } {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }

  const o = body as Record<string, unknown>;
  const data: ProfileInput = {};

  for (const key of PROFILE_FIELDS) {
    if (!(key in o)) continue;
    const v = o[key];
    if (v === null) {
      data[key] = null;
    } else if (typeof v === "string") {
      const t = v.trim();
      data[key] = t.length ? t : null;
    } else {
      return { ok: false, error: `Invalid type for ${key}` };
    }
  }

  if (
    data.experienceLevel != null &&
    data.experienceLevel.length > 50
  ) {
    return {
      ok: false,
      error: "experienceLevel must be at most 50 characters",
    };
  }

  return { ok: true, data };
}

function authErrorResponse(message: string) {
  if (message === "Server auth configuration is missing") {
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return NextResponse.json({ error: message }, { status: 401 });
}

/** GET — read current user's profile */
export async function GET(req: Request) {
  try {
    const { userId } = await getAuthenticatedUser(req);

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return authErrorResponse(message);
  }
}

/** POST — create profile for current user */
export async function POST(req: Request) {
  try {
    const { userId } = await getAuthenticatedUser(req);

    const existing = await prisma.profile.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 409 }
      );
    }

    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const parsed = parseProfileBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const profile = await prisma.profile.create({
      data: {
        userId,
        bio: parsed.data.bio ?? null,
        education: parsed.data.education ?? null,
        experienceLevel: parsed.data.experienceLevel ?? null,
        careerGoal: parsed.data.careerGoal ?? null,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return authErrorResponse(message);
  }
}

/** PATCH — update current user's profile */
export async function PATCH(req: Request) {
  try {
    const { userId } = await getAuthenticatedUser(req);

    const existing = await prisma.profile.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseProfileBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: parsed.data,
    });

    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return authErrorResponse(message);
  }
}

/** DELETE — remove current user's profile */
export async function DELETE(req: Request) {
  try {
    const { userId } = await getAuthenticatedUser(req);

    const existing = await prisma.profile.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.profile.delete({ where: { userId } });

    return NextResponse.json({ message: "Profile deleted" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return authErrorResponse(message);
  }
}
