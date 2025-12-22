"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HexColorPicker } from "react-colorful";

type CreatorProfile = {
  username: string;
  profile_name: string;
  bio: string;
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
  // 🔐 AUTH (hooks always run)
  const { status, data: session } = useSession();
  const router = useRouter();

  // ✅ SESSION-BASED USERNAME (SAFE FALLBACK)
  const username =
    session?.user?.username ||
    session?.user?.email?.split("@")[0] ||
    "lee";

  // ✅ STATE HOOKS (unchanged order)
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

  // 🔐 Redirect if logged out
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Load profile (only when authenticated)
  useEffect(() => {
    if (status !== "authenticated") return;

    const load = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/creator/profile?username=${username}`
        );
        const data = await res.json();

        const loadedProfile: CreatorProfile = {
          username: data.username,
          profile_name: data.profile_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          social_links: Array.isArray(data.social_links)
            ? data.social_links
            : [],
          theme_start: data.theme_start,
          theme_mid: data.theme_mid,
          theme_end: data.theme_end,
          milestone_enabled: data.milestone_enabled ?? 0,
          milestone_amount: data.milestone_amount ?? 0,
          milestone_text: data.milestone_text ?? "",
        };

        setProfile(loadedProfile);
        setSocialLinksText(loadedProfile.social_links.join("\n"));

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

  // handleChange
  const handleChange = (field: keyof CreatorProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  // handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

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
          bio: profile.bio,
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

      if (!res.ok) throw new Error();
      setSuccess("Saved successfully!");
    } catch {
      setError("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  // ⛔ Wait for auth resolution
  if (status === "loading") {
    return null;
  }

  if (loading) {
    return (
      <main className="text-center text-slate-300 py-20">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-slate-50 px-6 py-12 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold">Creator Settings</h1>

        <form
          className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6"
          onSubmit={handleSubmit}
        >
          {/* Profile name */}
          <div>
            <label className="text-sm font-medium">Profile Name</label>
            <input
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
              value={profile?.profile_name}
              onChange={(e) => handleChange("profile_name", e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium">Bio</label>
            <textarea
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm resize-none"
              rows={3}
              value={profile?.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="text-sm font-medium">Avatar URL</label>
            <input
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
              value={profile?.avatar_url}
              onChange={(e) => handleChange("avatar_url", e.target.value)}
            />
          </div>

          {/* Avatar Preview */}
          <div className="flex justify-center mt-3">
            <div className="w-36 h-36 rounded-full border border-white/20 overflow-hidden bg-white/10">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="text-sm font-medium">Social Links</label>
            <textarea
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm resize-none"
              rows={3}
              value={socialLinksText}
              onChange={(e) => setSocialLinksText(e.target.value)}
            />
          </div>

          {/* Theme Colours */}
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

          {/* Milestone Settings */}
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
