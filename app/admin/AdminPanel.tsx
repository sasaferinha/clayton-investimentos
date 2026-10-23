"use client";

import { useEffect, useState, type FormEvent } from "react";
import { contentApiOrigin } from "../ManagedAssetsMetric";

type SiteSettings = {
  managedAssetsValue: string;
  managedAssetsLabel: string;
  canEdit: boolean;
  canManageUsers: boolean;
};

type AdminUser = { email: string; created_at: string };

export default function AdminPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  useEffect(() => {
    if (window.location.origin !== contentApiOrigin) {
      window.location.replace(`${contentApiOrigin}/admin`);
      return;
    }

    fetch("/api/site-settings", { cache: "no-store" })
      .then((response) => response.json() as Promise<SiteSettings>)
      .then((data) => {
        setSettings(data);
        if (data.canManageUsers) loadAdmins();
      })
      .catch(() => setStatus("Não foi possível carregar os dados."));
  }, []);

  async function loadAdmins() {
    const response = await fetch("/api/admin-users", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { admins: AdminUser[] };
    setAdmins(data.admins);
  }

  async function inviteAdmin() {
    setStatus("");
    const response = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(data.error || "Não foi possível liberar o acesso.");
      return;
    }
    setAdminEmail("");
    setStatus("Acesso do cliente liberado.");
    await loadAdmins();
  }

  async function removeAdmin(email: string) {
    const response = await fetch(`/api/admin-users?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("Não foi possível remover o acesso.");
      return;
    }
    setStatus("Acesso removido.");
    await loadAdmins();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;

    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await response.json()) as SiteSettings & { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar.");
      setSettings(data);
      setStatus("Alteração salva e publicada no site.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className="adminStatus">Carregando painel…</p>;
  }

  if (!settings.canEdit) {
    return (
      <div className="adminLogin">
        <p>Entre com a conta do proprietário para editar o conteúdo público.</p>
        <a className="primary" href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">
          Entrar no painel <span>↗</span>
        </a>
      </div>
    );
  }

  return (
    <form className="adminForm" onSubmit={save}>
      <div className="adminPreview" aria-label="Prévia do indicador">
        <strong>{settings.managedAssetsValue || "—"}</strong>
        <span>{settings.managedAssetsLabel || "—"}</span>
      </div>

      <label>
        Valor exibido
        <input
          maxLength={16}
          required
          value={settings.managedAssetsValue}
          onChange={(event) => setSettings({ ...settings, managedAssetsValue: event.target.value })}
          placeholder="+11M"
        />
      </label>

      <label>
        Legenda
        <input
          maxLength={40}
          required
          value={settings.managedAssetsLabel}
          onChange={(event) => setSettings({ ...settings, managedAssetsLabel: event.target.value })}
          placeholder="sob gestão"
        />
      </label>

      <button className="primary" type="submit" disabled={saving}>
        {saving ? "Salvando…" : "Salvar alteração"}
      </button>
      {status && <p className="adminStatus" role="status">{status}</p>}

      {settings.canManageUsers && (
        <section className="adminAccess">
          <h2>Acesso do cliente</h2>
          <p>Cadastre o e-mail que o cliente usa no ChatGPT. Depois, envie a ele o link deste painel.</p>
          <div className="adminInvite">
            <input
              aria-label="E-mail do cliente"
              type="email"
              required
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="cliente@exemplo.com"
            />
            <button className="secondary" type="button" onClick={() => void inviteAdmin()}>
              Liberar acesso
            </button>
          </div>
          {admins.length > 0 && (
            <ul className="adminUsers">
              {admins.map((admin) => (
                <li key={admin.email}>
                  <span>{admin.email}</span>
                  <button type="button" onClick={() => void removeAdmin(admin.email)}>Remover</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </form>
  );
}
