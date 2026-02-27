"use client";

import { useState } from "react";
import { Mail, Instagram, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/* src/app/(main)/contact/page.tsx */

export default function ContactPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res  = await fetch("/api/contact", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, subject, message }),
    });
    const data = await res.json() as { success?: boolean; error?: string };

    if (data.success) { setSuccess(true); }
    else { setError(data.error ?? "Something went wrong. Please try again."); }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="container-brand section-padding max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-brand-green/15 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-brand-green" />
        </div>
        <h1 className="text-3xl font-display font-bold text-brand-cream mb-3">Message Sent!</h1>
        <p className="text-brand-cream-muted">We&apos;ll get back to you within 24 hours. Check your spam if you don&apos;t hear from us.</p>
      </div>
    );
  }

  return (
    <div className="container-brand section-padding max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-brand-cream mb-3">Contact Us</h1>
        <p className="text-brand-cream-muted text-lg">Questions, wholesale inquiries, or just want to say hi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card border border-white/5 p-5 rounded-card space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-brand bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-brand-green" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-cream mb-0.5">Email</p>
                <a href="mailto:info@trippyhippie.org" className="text-sm text-brand-green hover:underline">info@trippyhippie.org</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-brand bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                <Instagram className="h-4 w-4 text-pink-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-cream mb-0.5">Instagram</p>
                <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-pink-400 hover:underline">Coming Soon!</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-brand bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-cream mb-0.5">Response Time</p>
                <p className="text-sm text-brand-cream-muted">Within 24 hours · Mon–Sat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 glass-card border border-brand-green/10 p-6 rounded-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required />
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" required />
            </div>
            <Input label="Subject (optional)" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Wholesale inquiry, order question…" />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-cream-muted">Message <span className="text-red-400">*</span></label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} required placeholder="Tell us what you need…" className="w-full px-3 py-2.5 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none" />
            </div>
            {error && <p className="text-sm text-red-400">⚠ {error}</p>}
            <Button type="submit" variant="primary" isLoading={loading} className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
