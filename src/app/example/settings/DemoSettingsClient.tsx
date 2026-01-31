// ~/everpay-frontend/src/app/example/settings/DemoSettingsClient.tsx
"use client";

import React, { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

type CreatorProfile = {
  username: string;
  profile_name: string;
  avatar_url: string;
  social_links: string[];
};

export default function DemoSettingsClient({ username }: { username: string }) {
  const [profile, setProfile] = useState<CreatorProfile>({
    username,
    profile_name: "Lee (Demo Creator)",
    avatar_url: "",
    social_links: ["https://instagram.com/demo", "https://tiktok.com/@demo"],
  });

  const [socialLinksText, setSocialLinksText] = useState(
    profile.social_links.join("\n")
  );

  const [themeStart, setThemeStart] = useState("#ff0080");
  const [themeMid, setThemeMid] = useState("#7c3aed");
  const [themeEnd, setThemeEnd] = useState("#2563eb");

  const [milestoneEnabled, setMilestoneEnabled] = useState(true);
  const [milestoneAmount, setMilestoneAmount] = useState("250");
  const [milestoneText, setMilestoneText] = useState("New mic 🎤");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);

    setTimeout(() => {
      setSaving(false);
      setSuccess("Saved (demo preview) ✅");
    }, 650);
  };

  const handleChangePassword = () => {
    alert("Demo preview only — password reset is disabled here.");
  };

  return (
    <main className="max-w-6xl mx-auto px-4 text-white mt-10 pb-32 bg-gradient-to-b from-slate-800/40 via-slate-900/25 to-transparent rounded-3xl">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Creator Settings</h1>
          <p className="text-xs text-white/60">
            Editing:{" "}
            <span className="text-white/90 font-medium">@{username}</span> • Demo
            preview
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
              value={profile.profile_name}
              onChange={(e) =>
                setProfile({ ...profile, profile_name: e.target.value })
              }
            />
          </div>

          {/* Avatar (disabled) */}
          <section className="border border-white/10 bg-white/5 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="space-y-1">
                <div className="text-sm font-medium">Avatar</div>
                <div className="text-xs text-white/60">
                  Demo preview — upload is disabled.
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  disabled
                  className="w-full sm:w-auto text-xs text-white/60 opacity-60"
                />
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold opacity-60 cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <div className="w-36 h-36 rounded-full border border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {profile.profile_name?.[0] || "D"}
                </span>
              </div>
            </div>
          </section>

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

          {success && (
            <p className="text-emerald-400 bg-emerald-950/40 p-2 rounded-lg text-sm">
              {success}
            </p>
          )}

          <section className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-white mb-3">Security</h3>

            <button
              type="button"
              onClick={handleChangePassword}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition"
            >
              Change password
            </button>

            <p className="mt-2 text-[11px] text-white/50">
              Demo preview — email reset is disabled here.
            </p>
          </section>

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
