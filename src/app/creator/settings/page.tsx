// ~/everpay-frontend/src/app/creator/settings/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
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

  // Profile picture upload state
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Stripe Connect (payouts)
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectStatus, setConnectStatus] = useState<{
    connected: boolean;
    stripe_account_id?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    requirementsDue?: string[];
  } | null>(null);

  // Shared “EverPay glass panel” styles (match Dashboard)
  const PANEL =
    "rounded-3xl border border-white/15 bg-black/25 backdrop-blur-xl shadow-2xl";
  const SUBPANEL = "rounded-2xl border border-white/10 bg-black/20";
  const INPUT =
    "w-full mt-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/50 outline-none";
  const TEXTAREA =
    "w-full mt-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/50 outline-none resize-none";

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

  const persistAvatarUrl = async (newUrl: string) => {
    if (!username) return;

    const socialLinksArray = socialLinksText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const res = await fetch(`${API_URL}/api/creator/profile/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        profile_name: profile?.profile_name ?? "",
        avatar_url: newUrl,
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
    if (!res.ok) throw new Error(data?.error || "Failed to save profile picture URL");
  };

  const handleAvatarUpload = async () => {
    if (!username) {
      setUploadError("Missing username in session.");
      return;
    }
    if (!avatarFile) {
      setUploadError("Please choose an image first.");
      return;
    }

    setUploadingAvatar(true);
    setUploadError(null);
    setSuccess(null);
    setError(null);

    try {
      const form = new FormData();
      form.append("username", username);
      form.append("file", avatarFile);

      const res = await fetch(`${API_URL}/api/creator/avatar`, {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data?.error || "Profile picture upload failed");
      }

      const newUrl = data?.avatar_url as string | undefined;
      if (!newUrl) throw new Error("Upload succeeded but no avatar_url returned.");

      setProfile((p) => (p ? { ...p, avatar_url: newUrl } : p));
      await persistAvatarUrl(newUrl);

      setAvatarFile(null);
      if (fileRef.current) fileRef.current.value = "";

      setSuccess("Profile picture uploaded & saved ✅");
    } catch (err: any) {
      setUploadError(err?.message || "Profile picture upload failed");
    } finally {
      setUploadingAvatar(false);
    }
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

  const loadConnectStatus = async () => {
    if (!username) return;
    try {
      setConnectError(null);
      const res = await fetch(
        `${API_URL}/api/stripe/connect/status?username=${encodeURIComponent(username)}`
      );
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || "Failed to load Connect status");
      setConnectStatus(data);
    } catch (e: any) {
      setConnectError(e?.message || "Failed to load Connect status");
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!username) return;
    loadConnectStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, username]);

  const startConnectOnboarding = async () => {
    if (!username) return;
    setConnectLoading(true);
    setConnectError(null);
    try {
      const res = await fetch(`${API_URL}/api/stripe/connect/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || "Failed to create onboarding link");
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No onboarding URL returned");
    } catch (e: any) {
      setConnectError(e?.message || "Failed to start onboarding");
      setConnectLoading(false);
    }
  };

  const openStripeDashboard = async () => {
    if (!username) return;
    setConnectLoading(true);
    setConnectError(null);
    try {
      const res = await fetch(`${API_URL}/api/stripe/connect/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || "Failed to create login link");
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("No dashboard URL returned");
      }
    } catch (e: any) {
      setConnectError(e?.message || "Failed to open dashboard");
    } finally {
      setConnectLoading(false);
    }
  };

  // Wait for auth resolution
  if (status === "loading") return null;

  // Authenticated but username missing
  if (status === "authenticated" && !username) {
    return (
      <main className="min-h-screen text-slate-50 px-6 py-12 flex justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <h1 className="text-2xl font-semibold">Creator Settings</h1>
          <div className={`${PANEL} p-6`}>
            <div className="text-lg font-semibold text-white">Profile not linked</div>
            <p className="mt-2 text-sm text-white/70">
              Your session does not include a creator username. Log out and log back
              in, and make sure the backend login returns a creator with a username.
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
    <main
      className="min-h-screen text-slate-50 px-6 py-12 flex justify-center"
      // ✅ “lighter wash” across the WHOLE settings page
      style={{
        background:
          "linear-gradient(180deg, rgba(14,34,56,0.55) 0%, rgba(14,34,56,0.15) 45%, rgba(0,0,0,0) 100%)",
      }}
    >
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Creator Settings</h1>
          <p className="text-xs text-white/60">
            Editing: <span className="text-white/90 font-medium">@{username}</span>
          </p>
        </div>

        <form className={`${PANEL} p-6 space-y-6`} onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium">Profile Name</label>
            <input
              className={INPUT}
              value={profile?.profile_name || ""}
              onChange={(e) => handleChange("profile_name", e.target.value)}
            />
          </div>

          {/* Profile Picture Upload (Cloudinary) */}
          <section className={`${SUBPANEL} p-4`}>
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="space-y-1">
                <div className="text-sm font-medium">Profile Picture</div>
                <div className="text-xs text-white/60">
                  Upload a profile picture (we auto-crop + optimize).
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="w-full sm:w-auto text-xs text-white/80"
                />
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar || !avatarFile}
                  className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-50"
                >
                  {uploadingAvatar ? "Uploading…" : "Upload"}
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="mt-3 text-red-400 bg-red-950/40 p-2 rounded-lg text-sm">
                {uploadError}
              </p>
            )}

            <div className="flex justify-center mt-4">
              <div className="w-36 h-36 rounded-full border border-white/20 overflow-hidden bg-white/10">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="w-full h-full object-cover"
                    alt="Profile picture preview"
                  />
                ) : null}
              </div>
            </div>

            <details className="mt-4">
              <summary className="text-xs font-medium text-white/60 cursor-pointer select-none">
                Advanced · Profile Picture URL
              </summary>

              <div className="mt-2">
                <input
                  className={INPUT + " text-white/70"}
                  value={profile?.avatar_url || ""}
                  readOnly
                />
                <p className="mt-1 text-[11px] text-white/40">
                  System-managed. Auto-filled after upload.
                </p>
              </div>
            </details>
          </section>

          <div>
            <label className="text-sm font-medium">Social Links (one per line)</label>
            <textarea
              className={TEXTAREA}
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
                    className={INPUT}
                    value={milestoneAmount}
                    onChange={(e) => setMilestoneAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm">Milestone Description</label>
                  <input
                    type="text"
                    className={INPUT}
                    value={milestoneText}
                    onChange={(e) => setMilestoneText(e.target.value)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Payouts (Stripe Connect) */}
          <section className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-white mb-2">Payouts</h3>
            <p className="text-[11px] text-white/60 mb-4">
              Connect your Stripe account so gifts can be paid out to your bank.
              EverPay never stores your bank details.
            </p>

            <div className={`${SUBPANEL} p-4 space-y-3`}>
              <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
                <div>
                  <div className="text-sm font-medium">
                    {connectStatus?.connected
                      ? "Stripe account connected ✅"
                      : "Stripe account not connected"}
                  </div>

                  <div className="text-xs text-white/60 mt-1">
                    {connectStatus?.connected ? (
                      <>
                        Payouts:{" "}
                        <span className="text-white/80">
                          {connectStatus?.payoutsEnabled ? "Enabled" : "Not enabled yet"}
                        </span>
                      </>
                    ) : (
                      "Set up payouts to receive money."
                    )}
                  </div>

                  {Array.isArray(connectStatus?.requirementsDue) &&
                    connectStatus!.requirementsDue!.length > 0 && (
                      <div className="mt-2 text-xs text-amber-200/90">
                        Required: {connectStatus!.requirementsDue!.join(", ")}
                      </div>
                    )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={loadConnectStatus}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-sm text-white transition"
                    disabled={connectLoading}
                  >
                    Refresh
                  </button>

                  {!connectStatus?.connected ? (
                    <button
                      type="button"
                      onClick={startConnectOnboarding}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-60"
                      disabled={connectLoading}
                    >
                      {connectLoading ? "Opening…" : "Set up payouts"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={openStripeDashboard}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-60"
                      disabled={connectLoading}
                    >
                      {connectLoading ? "Opening…" : "Open Stripe"}
                    </button>
                  )}
                </div>
              </div>

              {connectError && (
                <p className="text-red-300 bg-red-950/40 p-2 rounded-lg text-sm">
                  {connectError}
                </p>
              )}
            </div>
          </section>

          {error && (
            <p className="text-red-400 bg-red-950/40 p-2 rounded-lg text-sm">{error}</p>
          )}
          {success && (
            <p className="text-emerald-400 bg-emerald-950/40 p-2 rounded-lg text-sm">
              {success}
            </p>
          )}

          <section className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-white mb-3">Security</h3>

            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-sm text-white transition"
            >
              Change password
            </button>

            <p className="mt-2 text-[11px] text-white/50">
              We’ll email you a secure link to reset your password.
            </p>
          </section>

          {/* DANGER ZONE */}
          <div className="mt-10 bg-red-500/10 border border-red-500/25 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-red-200">Danger zone</h3>
            <p className="text-sm text-white/70 mt-1">
              Deleting your account removes your creator profile and associated payment history.
            </p>

            <div className="mt-4">
              <a
                href="/creator/delete-account"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-500/90 transition"
              >
                Delete account
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-slate-900 rounded-xl py-2 font-medium hover:bg-emerald-400 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}

