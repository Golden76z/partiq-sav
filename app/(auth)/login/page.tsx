"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error || !result?.ok) {
      setError("Email ou mot de passe incorrect.");
    } else {
      window.location.href = "/catalogue";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-delabie-blue via-delabie-blue-dark to-[#001a4d] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-9 h-9 text-delabie-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">PartiQ SAV</h1>
          <p className="text-blue-200 mt-1 text-sm">Assistant IA — DELABIE · KWC · DVS</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-delabie-text mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@partiq.fr"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Comptes de démonstration</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="bg-delabie-gray rounded-lg p-2">
                <p className="font-medium text-delabie-text">Admin</p>
                <p>admin@partiq.fr</p>
                <p className="font-mono">admin123</p>
              </div>
              <div className="bg-delabie-gray rounded-lg p-2">
                <p className="font-medium text-delabie-text">Agent</p>
                <p>agent@partiq.fr</p>
                <p className="font-mono">agent123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
