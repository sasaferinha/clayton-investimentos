"use client";

import { useEffect, useState, type FormEvent } from "react";
import { contentApiOrigin } from "../ManagedAssetsMetric";

type SiteSettings = {
  managedAssetsValue: string;
  managedAssetsLabel: string;
  canEdit: boolean;
};

export default function AdminPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (window.location.origin !== contentApiOrigin) {
      window.location.replace(`${contentApiOrigin}/admin`);
      return;
    }

    fetch("/api/site-settings", { cache: "no-store" })
      .then((response) => response.json() as Promise<SiteSettings>)
      .then(setSettings)
      .catch(() => setStatus("Não foi possível carregar os dados."));
  }, []);

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
    </form>
  );
}
