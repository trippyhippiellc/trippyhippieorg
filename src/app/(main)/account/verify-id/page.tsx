"use client";

import { useState, useRef } from "react";
import { Shield, Upload, CheckCircle, Clock, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

/* src/app/(main)/account/verify-id/page.tsx */

export default function VerifyIDPage() {
  const { user, profile } = useAuth();
  const fileRefFront = useRef<HTMLInputElement>(null);
  const fileRefBack  = useRef<HTMLInputElement>(null);

  const [fileFront,      setFileFront]      = useState<File | null>(null);
  const [fileBack,       setFileBack]       = useState<File | null>(null);
  const [previewFront,   setPreviewFront]   = useState<string | null>(null);
  const [previewBack,    setPreviewBack]    = useState<string | null>(null);
  const [uploading,      setUploading]      = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [error,          setError]          = useState("");

  function handleFileChangeFront(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return; }
    setFileFront(f);
    setError("");
    const reader = new FileReader();
    reader.onload = () => setPreviewFront(reader.result as string);
    reader.readAsDataURL(f);
  }

  function handleFileChangeBack(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return; }
    setFileBack(f);
    setError("");
    const reader = new FileReader();
    reader.onload = () => setPreviewBack(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function uploadSide(file: File | null, side: "front" | "back") {
    if (!file || !user) return false;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);
    formData.append("side", side);

    const response = await fetch("/api/users/upload-id", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || `Upload of ID ${side} failed`);
      return false;
    }

    return true;
  }

  async function handleUpload() {
    if ((!fileFront && !fileBack) || !user) {
      setError("Please upload at least one side of your ID");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Upload both sides if provided, or just the one that was provided
      if (fileFront) {
        const frontSuccess = await uploadSide(fileFront, "front");
        if (!frontSuccess) {
          setUploading(false);
          return;
        }
      }

      if (fileBack) {
        const backSuccess = await uploadSide(fileBack, "back");
        if (!backSuccess) {
          setUploading(false);
          return;
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    setUploading(false);
  }

  if (profile?.id_verified) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-display font-bold text-brand-cream">ID Verification</h1>
        <div className="glass-card border border-brand-green/20 p-8 rounded-card text-center">
          <CheckCircle className="h-12 w-12 text-brand-green mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-brand-cream mb-2">Identity Verified</h2>
          <p className="text-brand-cream-muted">Your identity has been verified. You have full account access.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-display font-bold text-brand-cream">ID Verification</h1>
        <div className="glass-card border border-amber-500/20 p-8 rounded-card text-center">
          <Clock className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-brand-cream mb-2">Under Review</h2>
          <p className="text-brand-cream-muted">We&apos;ll verify within 1–2 business days and email <strong className="text-brand-cream">{user?.email}</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-cream mb-1">ID Verification</h1>
        <p className="text-brand-cream-muted text-sm">Required for all customers per our 21+ policy.</p>
      </div>

      <div className="glass-card border border-brand-green/10 p-6 rounded-card space-y-5">
        <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-brand">
          <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-brand-cream-muted">
            <p className="font-semibold text-blue-300 mb-1">What to upload</p>
            <p>Clear photos of both the front and back of a government-issued ID (driver&apos;s license, state ID, or passport) showing your date of birth.</p>
          </div>
        </div>

        {/* Front Side */}
        <div>
          <h3 className="text-sm font-semibold text-brand-cream mb-3">ID Front</h3>
          <div onClick={() => fileRefFront.current?.click()} className="border-2 border-dashed border-white/15 hover:border-brand-green/40 rounded-card p-8 text-center cursor-pointer transition-colors">
            {previewFront ? (
              <div className="relative h-48 w-full rounded-brand overflow-hidden">
                <Image src={previewFront} alt="ID front preview" fill className="object-contain" />
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-10 w-10 text-brand-cream-dark mx-auto" />
                <p className="text-brand-cream-muted font-medium">Click to upload ID front</p>
                <p className="text-xs text-brand-cream-dark">JPG, PNG, PDF · Max 10MB</p>
              </div>
            )}
          </div>
          <input ref={fileRefFront} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChangeFront} />
          {fileFront && <p className="text-sm text-brand-cream-muted flex items-center gap-2 mt-2"><Upload className="h-4 w-4" /> {fileFront.name}</p>}
        </div>

        {/* Back Side */}
        <div>
          <h3 className="text-sm font-semibold text-brand-cream mb-3">ID Back</h3>
          <div onClick={() => fileRefBack.current?.click()} className="border-2 border-dashed border-white/15 hover:border-brand-green/40 rounded-card p-8 text-center cursor-pointer transition-colors">
            {previewBack ? (
              <div className="relative h-48 w-full rounded-brand overflow-hidden">
                <Image src={previewBack} alt="ID back preview" fill className="object-contain" />
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-10 w-10 text-brand-cream-dark mx-auto" />
                <p className="text-brand-cream-muted font-medium">Click to upload ID back</p>
                <p className="text-xs text-brand-cream-dark">JPG, PNG, PDF · Max 10MB</p>
              </div>
            )}
          </div>
          <input ref={fileRefBack} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChangeBack} />
          {fileBack && <p className="text-sm text-brand-cream-muted flex items-center gap-2 mt-2"><Upload className="h-4 w-4" /> {fileBack.name}</p>}
        </div>

        {error && <p className="text-sm text-red-400">⚠ {error}</p>}

        <Button variant="primary" onClick={handleUpload} isLoading={uploading} disabled={!fileFront && !fileBack} className="w-full">
          Submit ID for Verification
        </Button>
        <p className="text-xs text-brand-cream-dark text-center">Your ID is stored securely and only used for age verification.</p>
      </div>
    </div>
  );
}
