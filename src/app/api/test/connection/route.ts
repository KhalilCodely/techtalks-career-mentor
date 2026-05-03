/**
 * API Connection Test Route
 * Endpoint: GET /api/test/connection
 * 
 * This route tests the frontend-backend connection and returns diagnostic information
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllCategories } from "@/lib/services/categoryService";
import { getAllSkills } from "@/lib/services/skillService";

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {
      database: { status: "pending", message: "" },
      categories: { status: "pending", message: "", data: null },
      skills: { status: "pending", message: "", data: null },
    },
  };

  try {
    // Test 1: Category Service
    try {
      const categories = await getAllCategories(false);
      results.tests.categories = {
        status: "success",
        message: `Successfully fetched ${categories.length} categories`,
        data: categories.slice(0, 2), // Return first 2 for preview
      };
    } catch (err) {
      results.tests.categories = {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
        data: null,
      };
    }

    // Test 2: Skill Service
    try {
      const skills = await getAllSkills();
      results.tests.skills = {
        status: "success",
        message: `Successfully fetched ${skills.length} skills`,
        data: skills.slice(0, 2), // Return first 2 for preview
      };
    } catch (err) {
      results.tests.skills = {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
        data: null,
      };
    }

    // Test 3: Database connectivity
    if (
      results.tests.categories.status === "success" ||
      results.tests.skills.status === "success"
    ) {
      results.tests.database = {
        status: "success",
        message: "Database connection is working",
      };
    } else {
      results.tests.database = {
        status: "error",
        message: "Database connection failed - all data fetches failed",
      };
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "API connection test completed",
      ...results,
    },
    { status: 200 }
  );
}
