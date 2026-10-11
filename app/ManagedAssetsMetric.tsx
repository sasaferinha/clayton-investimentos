"use client";

import { useEffect, useState } from "react";

export const contentApiOrigin = "https://clayton-investimentos-admin.samuelvilas290.chatgpt.site";

type SiteSettings = {
  managedAssetsValue: string;
  managedAssetsLabel: string;
};

const defaults: SiteSettings = {
  managedAssetsValue: "+11M",
  managedAssetsLabel: "sob gestão",
};

export default function ManagedAssetsMetric() {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${contentApiOrigin}/api/site-settings`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os dados atualizados.");
        return response.json() as Promise<SiteSettings>;
      })
      .then((data) => {
        if (data.managedAssetsValue && data.managedAssetsLabel) setSettings(data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });

    return () => controller.abort();
  }, []);

  return (
    <div>
      <strong>{settings.managedAssetsValue}</strong>
      <span>{settings.managedAssetsLabel}</span>
    </div>
  );
}
