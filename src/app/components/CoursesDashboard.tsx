"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { getAuth } from "@/lib/auth-client";

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  imageUrl: string | null;
  skillId: string;
  skill: { id: string; name: string; category: { id: string; name: string } | null };
  userProgress: { id: string; userId: string; courseId: string; completed: boolean; progress: number; createdAt: string; updatedAt: string } | null;
  createdAt: string;
  updatedAt: string;
};

type CoursesResponse = { success: boolean; data: Course[]; count?: number; error?: string };

export default function CoursesDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);

  useEffect(() => { const auth = getAuth(); if (!auth) { router.replace("/login"); return; } (async()=>{ setLoading(true); setError(""); try { const res = await fetch(`/api/courses?userId=${encodeURIComponent(auth.user.id)}`); const data = (await res.json()) as CoursesResponse; if (!res.ok || !data.success) throw new Error(data.error || "Failed to load courses"); setCourses(data.data || []);} catch(e){ setError(e instanceof Error ? e.message : "Unable to load courses right now."); } finally { setLoading(false);} })(); }, [router]);

  const handleCompletionToggle = async (course: Course) => { const auth = getAuth(); if (!auth?.token) { router.replace("/login"); return; } const nextCompleted = !course.userProgress?.completed; setSavingCourseId(course.id); setError(""); try { const res = await fetch("/api/user_progress", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ courseId: course.id, completed: nextCompleted, progress: nextCompleted ? 100 : 0 }) }); const payload = await res.json(); if (!res.ok || !payload.success || !payload.data) throw new Error(payload.error || "Unable to update course progress"); setCourses((current) => current.map((item) => item.id === course.id ? { ...item, userProgress: payload.data } : item)); } catch (e) { setError(e instanceof Error ? e.message : "Unable to update course completion."); } finally { setSavingCourseId(null); } };

  const visibleCourses = useMemo(() => courses, [courses]);

  return <div className="p-6 space-y-4">{error && <p>{error}</p>}{loading? <p>Loading...</p> : <div className="grid gap-4 md:grid-cols-2">{visibleCourses.map((course)=>{const progress=Math.min(100,Number(course.userProgress?.progress||0));return <div key={course.id} className="rounded-xl border p-4 bg-white dark:bg-zinc-900"><div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">{course.imageUrl ? <Image src={course.imageUrl} alt={course.title} fill className="object-cover" unoptimized /> : <div className="flex h-full items-center justify-center text-xs text-zinc-500">No image</div>}</div><h3 className="font-semibold">{course.title}</h3><p className="text-sm">{course.provider} • {course.skill.name}</p><p className="text-xs mt-2">Progress {Math.round(progress)}%</p><div className="mt-3 flex gap-2"><a href={course.url} target="_blank" rel="noreferrer" className="text-blue-600 inline-flex items-center gap-1">Open <ExternalLink className="h-4 w-4"/></a><button onClick={()=>void handleCompletionToggle(course)} disabled={savingCourseId===course.id} className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-50"> <CheckCircle2 className="h-4 w-4"/>{course.userProgress?.completed?"Mark incomplete":"Mark complete"}</button></div></div>;})}</div>}</div>;
}
