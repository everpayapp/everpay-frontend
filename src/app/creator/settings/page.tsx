// ~/everpay-frontend/src/app/creator/settings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HexColorPicker } from "react-colorful";

type CreatorProfile = {
  username: string;
  profile_name: string;
  avatar_url: string;
  social_links: string[];
  theme_start?: string;
  theme_mid?: string;
  theme_end?: string;
  milestone_enabled?: number;
  milestone_amount?: number;
  milestone_text?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function CreatorSettingsPage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  // ✅ ONLY use the session username (no fallback!)
  const username = (session?.user as any)?.username as string | undefined;

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [socialLinksText, setSocialLinksText] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [themeStart, setThemeStart] = useState("#ec4899");
  const [themeMid, setThemeMid] = useState("#8b5cf6");
  const [themeEnd, setThemeEnd] = useState("#3b82f6");

  const [milestoneEnabled, setMilestoneEnabled] = useState(false);
  const [milestoneAmount, setMilestoneAmount] = useState("");
  const [milestoneText, setMilestoneText] = useState("");

  // Redirect if logged out
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Load profile (only when authenticated + username exists)
  useEffect(() => {
    if (status !== "authenticated") return;

    if (!username) {
      setLoading(false);
      setProfile(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/api/creator/profile?username=${encodeURIComponent(username)}`
        );
        const data = await res.json().catch(() => ({} as any));

        const loadedProfile: CreatorProfile = {
          username: data.username || username,
          profile_name: data.profile_name || "",
          avatar_url: data.avatar_url || "",
          social_links: Array.isArray(data.social_links) ? data.social_links : [],
          theme_start: data.theme_start,
          theme_mid: data.theme_mid,
          theme_end: data.theme_end,
          milestone_enabled: data.milestone_enabled ?? 0,
          milestone_amount: data.milestone_amount ?? 0,
          milestone_text: data.milestone_text ?? "",
        };

        setProfile(loadedProfile);
        setSocialLinksText((loadedProfile.social_links || []).join("\n"));

        setThemeStart(data.theme_start || "#ec4899");
        setThemeMid(data.theme_mid || "#8b5cf6");
        setThemeEnd(data.theme_end || "#3b82f6");

        setMilestoneEnabled(!!data.milestone_enabled);
        setMilestoneAmount(
          data.milestone_amount ? String(data.milestone_amount) : ""
        );
        setMilestoneText(data.milestone_text || "");
      } catch {
        setError("Failed to load creator profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, username]);

  const handleChange = (field: keyof CreatorProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!username) {
      setError("Profile not linked (missing username in session).");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const socialLinksArray = socialLinksText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`${API_URL}/api/creator/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          profile_name: profile.profile_name,
          avatar_url: profile.avatar_url,
          social_links: socialLinksArray,
          theme_start: themeStart,
          theme_mid: themeMid,
          theme_end: themeEnd,
          milestone_enabled: milestoneEnabled ? 1 : 0,
          milestone_amount: Number(milestoneAmount) || 0,
          milestone_text: milestoneText,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data?.error || "Save failed");
      }

      setSuccess("Saved successfully!");
    } catch (err: any) {
      setError(err?.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  // Wait for auth resolution
  if (status === "loading") return null;

  // Authenticated but username missing
  if (status === "authenticated" && !username) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-slate-50 px-6 py-12 flex justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <h1 className="text-2xl font-semibold">Creator Settings</h1>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-semibold text-white">
              Profile not linked
            </div>
            <p className="mt-2 text-sm text-white/70">
              Your session does not include a creator username. Log out and log
              back in, and make sure the backend login returns a creator with a
              username.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="text-center text-slate-300 py-20">Loading…</main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-slate-50 px-6 py-12 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Creator Settings</h1>
          <p className="text-xs text-white/60">
            Editing: <span className="text-white/90 font-medium">@{username}</span>
          </p>
        </div>

        <form
          className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-medium">Profile Name</label>
            <input
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
              value={profile?.profile_name || ""}
              onChange={(e) => handleChange("profile_name", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Avatar URL</label>
            <input
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
              value={profile?.avatar_url || ""}
              onChange={(e) => handleChange("avatar_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-center mt-3">
            <div className="w-36 h-36 rounded-full border border-white/20 overflow-hidden bg-white/10">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="w-full h-full object-cover"
                  alt="Avatar preview"
                />
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Social Links (one per line)
            </label>
            <textarea
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm resize-none"
              rows={4}
              value={socialLinksText}
              onChange={(e) => setSocialLinksText(e.target.value)}
              placeholder={`https://instagram.com/yourname\nhttps://tiktok.com/@yourname`}
            />

            {socialLinksText.trim().length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinksText
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white/85 hover:bg-white/15 transition"
                      title={url}
                    >
                      {url
                        .replace(/^https?:\/\//, "")
                        .replace(/^www\./, "")
                        .slice(0, 26)}
                    </a>
                  ))}
              </div>
            )}
          </div>

          <section className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold mb-1">Page Colours 🎨</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
              <div>
                <p className="text-xs mb-2">Start</p>
                <HexColorPicker color={themeStart} onChange={setThemeStart} />
              </div>

              <div>
                <p className="text-xs mb-2">Middle</p>
                <HexColorPicker color={themeMid} onChange={setThemeMid} />
              </div>

              <div>
                <p className="text-xs mb-2">End</p>
                <HexColorPicker color={themeEnd} onChange={setThemeEnd} />
              </div>
            </div>
          </section>

          <section className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold mb-2">Milestone Goal 🎯</h2>

            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={milestoneEnabled}
                onChange={(e) => setMilestoneEnabled(e.target.checked)}
              />
              <span>Enable milestone</span>
            </label>

            {milestoneEnabled && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm">Target Amount (£)</label>
                  <input
                    type="number"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                    value={milestoneAmount}
                    onChange={(e) => setMilestoneAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm">Milestone Description</label>
                  <input
                    type="text"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                    value={milestoneText}
                    onChange={(e) => setMilestoneText(e.target.value)}
                  />
                </div>
              </div>
            )}
          </section>

          {error && (
            <p className="text-red-400 bg-red-950/40 p-2 rounded-lg text-sm">
              {error}
            </p>
          )}
          {success && (
            <p className="text-emerald-400 bg-emerald-950/40 p-2 rounded-lg text-sm">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-500 text-slate-900 rounded-xl py-2 font-medium hover:bg-emerald-400"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}

