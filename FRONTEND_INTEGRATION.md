# Frontend-Backend API Integration Guide

## Overview

This document describes the complete frontend-backend connection setup for the Tech Talks Career Mentor application.

## Architecture

### API Client Layer (`src/lib/api/client.ts`)

Central HTTP request handler with:
- ✅ Automatic token attachment from localStorage
- ✅ Standard error handling
- ✅ Response parsing with TypeScript types
- ✅ Helper methods: `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`, `apiPatch()`

### Service Layer (`src/lib/api/services/`)

Domain-specific services that wrap API calls:
- **`authService.ts`** - Login, signup, token management
- **`categoryService.ts`** - Category CRUD operations
- **`skillService.ts`** - Skill CRUD operations
- **`careerPathService.ts`** - Career path management, enrollment, progress

## Configuration

### Environment Variables

**File**: `.env.local`

```bash
# API Base URL (must start with NEXT_PUBLIC_ to be available in browser)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Usage Examples

### Authentication Service

```typescript
import { login, signup, getAuthToken, clearAuthToken, isAuthenticated } from "@/lib/api/services/authService";

// Login
try {
  const user = await login("user@example.com", "password123");
  console.log("Logged in as:", user.name);
} catch (err) {
  console.error("Login error:", err.message);
}

// Signup
try {
  const user = await signup("John Doe", "john@example.com", "password123");
  console.log("Account created for:", user.name);
} catch (err) {
  console.error("Signup error:", err.message);
}

// Check authentication
if (isAuthenticated()) {
  const token = getAuthToken();
  console.log("User is logged in, token:", token);
}

// Logout
clearAuthToken();
```

### Category Service

```typescript
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategorySkills,
} from "@/lib/api/services/categoryService";

// Get all categories
try {
  const categories = await getAllCategories(false); // false = don't include skills
  categories.forEach(cat => console.log(cat.name));
} catch (err) {
  console.error("Error:", err.message);
}

// Get category with its skills
try {
  const category = await getCategoryById("category-id", true); // true = include skills
  console.log(`${category.name} has ${category.skills?.length || 0} skills`);
} catch (err) {
  console.error("Error:", err.message);
}

// Create category
try {
  const newCategory = await createCategory(
    "Frontend Development",
    "Master frontend technologies"
  );
  console.log("Created:", newCategory.id);
} catch (err) {
  console.error("Error:", err.message);
}

// Update category
try {
  const updated = await updateCategory("category-id", {
    name: "Advanced Frontend",
    description: "Advanced frontend techniques"
  });
  console.log("Updated:", updated.name);
} catch (err) {
  console.error("Error:", err.message);
}

// Delete category
try {
  await deleteCategory("category-id");
  console.log("Deleted successfully");
} catch (err) {
  console.error("Error:", err.message);
}

// Get skills for category
try {
  const skills = await getCategorySkills("category-id");
  console.log(`Found ${skills.length} skills in this category`);
} catch (err) {
  console.error("Error:", err.message);
}
```

### Skill Service

```typescript
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillsByCategory,
} from "@/lib/api/services/skillService";

// Get all skills
try {
  const skills = await getAllSkills();
  console.log(`Found ${skills.length} skills total`);
} catch (err) {
  console.error("Error:", err.message);
}

// Filter skills by category
try {
  const skills = await getAllSkills("Frontend Development");
  console.log("Frontend skills:", skills);
} catch (err) {
  console.error("Error:", err.message);
}

// Get single skill
try {
  const skill = await getSkillById("skill-id");
  console.log("Skill:", skill.name, "in category:", skill.category?.name);
} catch (err) {
  console.error("Error:", err.message);
}

// Create skill
try {
  const newSkill = await createSkill("React", "category-id");
  console.log("Created skill:", newSkill.name);
} catch (err) {
  console.error("Error:", err.message);
}

// Update skill
try {
  const updated = await updateSkill("skill-id", {
    name: "React 19",
    categoryId: "new-category-id" // optional
  });
  console.log("Updated:", updated.name);
} catch (err) {
  console.error("Error:", err.message);
}

// Delete skill
try {
  await deleteSkill("skill-id");
  console.log("Deleted successfully");
} catch (err) {
  console.error("Error:", err.message);
}

// Get skills by category
try {
  const skills = await getSkillsByCategory("category-id");
  console.log(`Found ${skills.length} skills in this category`);
} catch (err) {
  console.error("Error:", err.message);
}
```

### Career Path Service

```typescript
import {
  getAllCareerPaths,
  getUserCareerPaths,
  getCareerPathById,
  createCareerPath,
  updateCareerPath,
  deleteCareerPath,
  enrollUserInCareerPath,
  updateCareerProgress,
  unenrollUserFromCareerPath,
} from "@/lib/api/services/careerPathService";

// Get all career paths
try {
  const paths = await getAllCareerPaths();
  console.log(`Found ${paths.length} career paths`);
} catch (err) {
  console.error("Error:", err.message);
}

// Get user's enrolled paths
try {
  const myPaths = await getUserCareerPaths("user-id");
  console.log("Your career paths:", myPaths);
} catch (err) {
  console.error("Error:", err.message);
}

// Enroll in career path
try {
  const enrollment = await enrollUserInCareerPath("user-id", "path-id");
  console.log("Enrolled! Progress:", enrollment.progress);
} catch (err) {
  console.error("Error:", err.message);
}

// Update progress
try {
  const updated = await updateCareerProgress("user-id", "path-id", 50);
  console.log("Progress updated to:", updated.progress + "%");
} catch (err) {
  console.error("Error:", err.message);
}

// Unenroll from career path
try {
  await unenrollUserFromCareerPath("user-id", "path-id");
  console.log("Unenrolled successfully");
} catch (err) {
  console.error("Error:", err.message);
}
```

## Component Pattern - Error Handling & Loading States

### Recommended Pattern

```typescript
"use client";

import { useEffect, useState } from "react";
import { getAllCategories } from "@/lib/api/services/categoryService";

export default function MyComponent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAllCategories();
        setData(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load";
        setError(message);
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## CORS Configuration

Since this is a **same-origin Next.js app** (frontend and backend are on the same domain), CORS is not required.

### For External Frontends (If Deploying Separately)

If the frontend and backend are deployed on different domains, add CORS to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization" },
        ],
      },
    ];
  },
};
```

## Error Handling

All services throw errors with descriptive messages. Pattern for error handling:

```typescript
try {
  const result = await serviceFunction();
} catch (err) {
  if (err instanceof Error) {
    console.error("Error message:", err.message);
    
    // For API errors
    if ("status" in err) {
      const apiErr = err as any;
      console.error("HTTP Status:", apiErr.status);
      console.error("Response data:", apiErr.data);
    }
  }
}
```

## Testing the Connection

### Manual Testing

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test login**:
   - Navigate to http://localhost:3000/login
   - Use existing credentials or create account
   - Check browser console for any errors

3. **Test categories display**:
   - Import CategoriesDisplay component
   - Verify categories load and expand properly

4. **Check network requests**:
   - Open DevTools Network tab
   - Check for XHR/Fetch requests to `/api/`
   - Verify Authorization header with Bearer token

## Debugging

### Common Issues

**1. CORS errors**:
- Check `NEXT_PUBLIC_API_BASE_URL` matches server URL
- If different domains, ensure backend CORS is configured

**2. 401 Unauthorized**:
- Token may have expired
- Check localStorage for `auth_token`
- Try logging in again

**3. 404 Not Found**:
- Verify API endpoint exists on backend
- Check API_ROUTES.md for correct endpoint path

**4. Token not attached**:
- Client side code only has access in browser (not server components)
- Use "use client" directive in components
- Token is auto-attached from localStorage

## Files Summary

| File | Purpose |
|------|---------|
| `.env.local` | API configuration |
| `src/lib/api/client.ts` | Core HTTP client |
| `src/lib/api/services/authService.ts` | Authentication |
| `src/lib/api/services/categoryService.ts` | Category operations |
| `src/lib/api/services/skillService.ts` | Skill operations |
| `src/lib/api/services/careerPathService.ts` | Career path operations |
| `src/app/components/CategoriesDisplay.tsx` | Example component |

## Next Steps

1. ✅ Test all API endpoints with login/signup
2. ✅ Add categories and skills through admin panel (if available)
3. ✅ Create career path pages using the services
4. ✅ Build dashboard with enrollment features
5. ✅ Add user profile page to show enrolled paths and progress
