"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Activity, CalendarDays, Check, Clock3, LogOut, Plus, Sparkles, Users } from "lucide-react";
import { authClient } from "@/lib/auth/client";

type Appointment = { id: string; clientName: string; service: string | null; startsAt: string; durationMinutes: number; status: string; photoId: string | null };
type Payload = { appointments: Appointment[]; metrics: { week_count: number; pending_count: number } };
function localInputDate() { const d = new Date(Date.now() + 60 * 60 * 1000); return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16); }

export default function Dashboard() {
  const [data, setData] = useState<Payload | null>(null); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("facial