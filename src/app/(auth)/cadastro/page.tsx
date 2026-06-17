"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao cadastrar.");
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError(signInRes.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">Tacto</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-1">Criar conta</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Comece gratuitamente. Sem cartão de crédito.
          </p>

          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full mb-4 gap-2"
            id="btn-google-signup"
          >
            <GoogleIcon />
            Continuar com Google
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou com e-mail</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="text-sm font-medium block mb-1.5">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maria Professora"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium block mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@escola.edu.br"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium block mb-1.5">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                required
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="password-confirm" className="text-sm font-medium block mb-1.5">
                Confirmar senha
              </label>
              <input
                id="password-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} id="btn-submit-cadastro">
              {isLoading ? "Criando..." : "Criar conta"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
