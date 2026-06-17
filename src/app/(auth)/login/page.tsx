"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar fazer login.");
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
          <h1 className="text-2xl font-bold mb-1">Entrar</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Bem-vindo de volta.
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
            id="btn-google-login"
          >
            <GoogleIcon />
            Entrar com Google
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou com e-mail</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <Link
                  href="#"
                  className="text-xs text-primary hover:underline"
                  id="link-forgot-password"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} id="btn-submit-login">
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{" "}
            <Link href="/cadastro" className="text-primary hover:underline font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
