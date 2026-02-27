"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, Lock, Shield } from "lucide-react";

export function ConstructionModeSettings() {
  const { user, session } = useAuth();
  const toast = useToast();

  const [isConstructionMode, setIsConstructionMode] = useState(false);
  const [constructionPassword, setConstructionPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current construction settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const token = session?.access_token;
        if (!token) {
          console.error("[ConstructionModeSettings] No auth token available");
          setIsLoading(false);
          return;
        }

        console.log("[ConstructionModeSettings] Fetching construction settings...");
        const response = await fetch("/api/admin/construction", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        console.log("[ConstructionModeSettings] Raw API response:", JSON.stringify(data));
        
        const mode = Boolean(data.is_construction_mode);
        console.log("[ConstructionModeSettings] Converted to boolean:", mode);
        
        setIsConstructionMode(mode);
        setConstructionPassword(data.construction_password || "construction123");
      } catch (err) {
        console.error("[ConstructionModeSettings] Error fetching construction settings:", err);
        toast.error("Failed to load construction settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id, session?.access_token]);

  const handleToggle = async () => {
    const newMode = !isConstructionMode;
    setIsSaving(true);

    try {
      const token = session?.access_token;
      if (!token) {
        toast.error("Authentication required");
        setIsSaving(false);
        return;
      }

      console.log("[ConstructionModeSettings] Toggling mode to:", newMode);

      const response = await fetch("/api/admin/construction", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isConstructionMode: newMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save (${response.status})`);
      }

      const data = await response.json();
      console.log("[ConstructionModeSettings] Toggle response:", data);
      setIsConstructionMode(data.is_construction_mode ?? false);
      setConstructionPassword(data.construction_password || "construction123");
      toast.success(`Construction mode ${newMode ? "enabled" : "disabled"}!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error toggling construction mode:", message, err);
      toast.error(`Failed to toggle: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    setIsSaving(true);

    try {
      const token = session?.access_token;
      if (!token) {
        toast.error("Authentication required");
        setIsSaving(false);
        return;
      }

      console.log("[ConstructionModeSettings] Updating password");

      const response = await fetch("/api/admin/construction", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          constructionPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save (${response.status})`);
      }

      const data = await response.json();
      console.log("[ConstructionModeSettings] Password update response:", data);
      setConstructionPassword(data.construction_password || "");
      setNewPassword("");
      toast.success("Password updated successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error updating password:", message, err);
      toast.error(`Failed to update password: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user?.id) {
    return (
      <div className="glass-card border border-brand-red/10 bg-brand-red/5 p-6 rounded-card flex items-center gap-3">
        <Shield className="h-5 w-5 text-brand-red" />
        <p className="text-brand-cream-muted text-sm">
          You must be logged in to access this setting.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card border border-brand-green/10 p-6 rounded-card space-y-4">
        <h2 className="font-semibold text-brand-cream">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="glass-card border border-brand-orange/10 bg-brand-orange/5 p-6 rounded-card space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-brand-orange" />
        <h2 className="font-semibold text-brand-cream">Under Construction Mode</h2>
      </div>

      <p className="text-sm text-brand-cream-muted">
        When enabled, only admins and users with the construction password can access the site. All routes will be blocked.
      </p>

      {/* Construction Mode Toggle */}
      <div className="flex items-center gap-3 py-3 border-t border-brand-orange/10">
        <div className="flex-1">
          <label className="font-medium text-brand-cream text-sm">Enable Construction Mode</label>
          <p className="text-xs text-brand-cream-muted mt-1">
            Current: <strong>{isConstructionMode ? "ENABLED ✓" : "DISABLED"}</strong>
          </p>
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange disabled:opacity-50 ${
            isConstructionMode ? "bg-brand-orange" : "bg-slate-600"
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              isConstructionMode ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      {isConstructionMode && (
        <>
          <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="h-5 w-5 text-brand-orange flex-shrink-0 mt-0.5" />
            <p className="text-sm text-brand-orange">
              Construction mode is <strong>ACTIVE</strong>. Only admins and users with the password can access the site.
            </p>
          </div>

          {/* Current Password Display */}
          <div className="space-y-2 border-t border-brand-orange/10 pt-4">
            <label className="font-medium text-brand-cream text-sm">Current Password</label>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-brand-cream-muted font-mono">
              {constructionPassword || "No password set"}
            </div>
            <p className="text-xs text-brand-cream-muted">Share this password with authorized users</p>
          </div>

          {/* Password Change Section */}
          <div className="space-y-2 border-t border-brand-orange/10 pt-4">
            <Input
              label="Change Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              helperText="Leave empty to keep current password"
            />
            {newPassword && (
              <Button
                onClick={handlePasswordChange}
                variant="primary"
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? "Updating..." : "Update Password"}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
