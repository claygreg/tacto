"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Check } from "lucide-react";

export default function ContaPage() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao salvar");
      }

      setProfileSuccess(true);
      // Atualiza a sessão do NextAuth
      await updateSession({ name, email });
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao trocar senha");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="text-muted-foreground text-sm">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configurações da Conta</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie seu perfil e preferências
        </p>
      </div>

      {/* Perfil */}
      <form onSubmit={handleSaveProfile} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Perfil</h2>

        {profileError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="bg-green-500/15 text-green-600 dark:text-green-400 text-sm p-3 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" />
            Perfil salvo com sucesso!
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Nome completo</label>
            <input
              id="input-profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">E-mail</label>
            <input
              id="input-profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <Button type="submit" className="gap-2" disabled={profileSaving} id="btn-save-profile">
          <Save className="w-4 h-4" />
          {profileSaving ? "Salvando..." : "Salvar perfil"}
        </Button>
      </form>

      <Separator />

      {/* Senha */}
      <form onSubmit={handleChangePassword} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Trocar senha</h2>

        {passwordError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="bg-green-500/15 text-green-600 dark:text-green-400 text-sm p-3 rounded-md flex items-center gap-2">
            <Check className="w-4 h-4" />
            Senha alterada com sucesso!
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label htmlFor="input-current-password" className="text-sm font-medium block mb-1.5">Senha atual</label>
            <input
              id="input-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label htmlFor="input-new-password" className="text-sm font-medium block mb-1.5">Nova senha</label>
            <input
              id="input-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="input-confirm-password" className="text-sm font-medium block mb-1.5">Confirmar nova senha</label>
            <input
              id="input-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={8}
            />
          </div>
        </div>
        <Button type="submit" variant="outline" className="gap-2" disabled={passwordSaving} id="btn-change-password">
          {passwordSaving ? "Alterando..." : "Trocar senha"}
        </Button>
      </form>

      <Separator />

      {/* Notificações */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Preferências de notificação</h2>
        <div className="space-y-3">
          {[
            { id: "notif-feedback", label: "Confirmação de envio de feedback", desc: "Receber e-mail quando o feedback for enviado aos alunos" },
            { id: "notif-summary", label: "Resumo semanal", desc: "Receber resumo das atividades da semana às sextas-feiras" },
          ].map(({ id, label, desc }) => (
            <label key={id} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border cursor-pointer hover:border-primary/40 transition-colors">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className="w-9 h-5 rounded-full bg-primary shrink-0 mt-0.5">
                <div className="w-4 h-4 bg-white rounded-full shadow mt-0.5 translate-x-4" />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
