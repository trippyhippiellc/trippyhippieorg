"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useStateSelector } from "@/features/state-selector/useStateSelector";
import { statesData } from "@/features/state-selector/stateData";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/*
  RegisterForm — creates a new Supabase Auth user + profile row.
  After signup, Supabase sends a verification email.
  Account starts as "pending" until admin approves.
*/

export function RegisterForm() {
  const router   = useRouter();
  const supabase = createClient();
  const { selectedState, isLoading: stateLoading } = useStateSelector();

  const [fullName,     setFullName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [dateOfBirth,  setDateOfBirth]  = useState("");
  const [phone,        setPhone]        = useState("");
  const [idNumber,     setIdNumber]     = useState("");
  const [state,        setState]        = useState<string>("");
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);

  // Pre-fill state from selector if available
  // Wait for hook to finish loading from localStorage before pre-filling
  useEffect(() => {
    if (!stateLoading && selectedState && !state) {
      setState(selectedState);
    }
  }, [selectedState, stateLoading, state]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate date of birth
    if (!dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 21) {
      setError("You must be at least 21 years old to create an account.");
      return;
    }

    // Validate state selection
    if (!state) {
      setError("Please select your state.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email:    email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth,
          phone_number: phone.trim() || null,
          id_number: idNumber.trim() || null,
          selected_state: state,
        },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-brand-green/15 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-xl font-display font-bold text-brand-cream mb-2">
          Check your email
        </h2>
        <p className="text-sm text-brand-cream-muted leading-relaxed mb-6">
          We sent a verification link to <strong className="text-brand-cream">{email}</strong>.
          Click it to activate your account.
        </p>
        <p className="text-xs text-brand-cream-dark">
          After verifying, your account will be reviewed for approval.
          You&apos;ll receive an email when you&apos;re approved.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-display font-bold text-brand-cream mb-1">
          Create your account
        </h1>
        <p className="text-sm text-brand-cream-muted">
          Join Trippy Hippie — free to sign up
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
          required
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <Input
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
          autoComplete="bday"
          helperText="You MUST be 21 or older to use our service, register an account, or make a purchase. We verify age for compliance."
        />

        <div>
          <label className="block text-sm font-medium text-brand-cream mb-2">
            Your State <span className="text-red-400">*</span>
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-brand border border-white/10 text-brand-cream focus:outline-none focus:border-brand-green/50 transition-colors appearance-none cursor-pointer"
            style={{
              backgroundColor: '#162816',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23F5F0E8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '16px',
              paddingRight: '2.5rem',
            }}
          >
            <option value="">Select your state...</option>
            {statesData.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-brand-cream-muted mt-1.5">
            This helps us filter products that are available in your area
          </p>
        </div>

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          autoComplete="tel"
          helperText="Optional, helps with order updates and verification"
        />

        <Input
          label="ID Number"
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          placeholder="e.g., Driver's License or Passport number"
          autoComplete="off"
          helperText="Optional, speeds up verification if needed"
        />

        <Input
          label="Password"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          required
          autoComplete="new-password"
          helperText="At least 8 characters"
          rightAddon={
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="text-brand-cream-dark hover:text-brand-cream transition-colors"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <Input
          label="Confirm Password"
          type={showPass ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter password"
          required
          autoComplete="new-password"
        />

        {error && (
          <div className="p-3 rounded-brand bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">⚠ {error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full"
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-brand-cream-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-green hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;
