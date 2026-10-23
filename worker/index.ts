/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  ADMIN_USER_ID?: string;
  ADMIN_OWNER_EMAIL?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const normalizeEmail = (value: string | null | undefined) => value?.trim().toLowerCase() ?? "";
    const userId = request.headers.get("oai-authenticated-user-id");
    const userEmail = normalizeEmail(request.headers.get("oai-authenticated-user-email"));
    const isOwner = Boolean(
      (userId && env.ADMIN_USER_ID && userId === env.ADMIN_USER_ID) ||
      (userEmail && env.ADMIN_OWNER_EMAIL && userEmail === normalizeEmail(env.ADMIN_OWNER_EMAIL)),
    );
    const isInvitedAdmin = async () => {
      if (!userEmail || !env.DB) return false;
      const row = await env.DB.prepare("SELECT email FROM admin_users WHERE email = ?")
        .bind(userEmail)
        .first<{ email: string }>();
      return Boolean(row);
    };

    if (url.pathname === "/api/admin-users") {
      if (!userId) {
        return Response.json({ error: "Faça login para continuar." }, { status: 401 });
      }

      if (!isOwner) {
        return Response.json({ error: "Apenas o proprietário pode gerenciar acessos." }, { status: 403 });
      }

      if (!env.DB) {
        return Response.json({ error: "Banco de dados indisponível." }, { status: 503 });
      }

      if (request.method === "GET") {
        const result = await env.DB.prepare("SELECT email, created_at FROM admin_users ORDER BY email").all<{
          email: string;
          created_at: string;
        }>();
        return Response.json({ admins: result.results ?? [] });
      }

      if (request.method === "POST") {
        let body: { email?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Dados inválidos." }, { status: 400 });
        }

        const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
          return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
        }

        const createdAt = new Date().toISOString();
        await env.DB.prepare(
          "INSERT INTO admin_users (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING",
        )
          .bind(email, createdAt)
          .run();
        return Response.json({ email, created_at: createdAt }, { status: 201 });
      }

      if (request.method === "DELETE") {
        const email = normalizeEmail(url.searchParams.get("email"));
        if (!email) return Response.json({ error: "E-mail obrigatório." }, { status: 400 });
        await env.DB.prepare("DELETE FROM admin_users WHERE email = ?").bind(email).run();
        return Response.json({ ok: true });
      }

      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, POST, DELETE" } });
    }

    if (url.pathname === "/api/site-settings") {
      const defaults = {
        managedAssetsValue: "+11M",
        managedAssetsLabel: "sob gestão",
      };

      if (request.method === "GET") {
        let settings = defaults;

        if (env.DB) {
          const row = await env.DB.prepare(
            "SELECT managed_assets_value, managed_assets_label FROM site_settings WHERE id = 1",
          ).first<{ managed_assets_value: string; managed_assets_label: string }>();

          if (row) {
            settings = {
              managedAssetsValue: row.managed_assets_value,
              managedAssetsLabel: row.managed_assets_label,
            };
          }
        }

        const canEdit = isOwner || (await isInvitedAdmin());
        return Response.json(
          { ...settings, canEdit, canManageUsers: isOwner },
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-store",
            },
          },
        );
      }

      if (request.method === "PUT") {
        if (!userId) {
          return Response.json({ error: "Faça login para editar." }, { status: 401 });
        }

        if (!isOwner && !(await isInvitedAdmin())) {
          return Response.json({ error: "Seu e-mail ainda não foi autorizado pelo proprietário." }, { status: 403 });
        }

        if (!env.DB) {
          return Response.json({ error: "Banco de dados indisponível." }, { status: 503 });
        }

        let body: { managedAssetsValue?: unknown; managedAssetsLabel?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Dados inválidos." }, { status: 400 });
        }

        const managedAssetsValue =
          typeof body.managedAssetsValue === "string" ? body.managedAssetsValue.trim() : "";
        const managedAssetsLabel =
          typeof body.managedAssetsLabel === "string" ? body.managedAssetsLabel.trim() : "";

        if (!managedAssetsValue || managedAssetsValue.length > 16) {
          return Response.json({ error: "O valor deve ter entre 1 e 16 caracteres." }, { status: 400 });
        }

        if (!managedAssetsLabel || managedAssetsLabel.length > 40) {
          return Response.json({ error: "A legenda deve ter entre 1 e 40 caracteres." }, { status: 400 });
        }

        const updatedAt = new Date().toISOString();
        await env.DB.prepare(
          `INSERT INTO site_settings (id, managed_assets_value, managed_assets_label, updated_at)
           VALUES (1, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             managed_assets_value = excluded.managed_assets_value,
             managed_assets_label = excluded.managed_assets_label,
             updated_at = excluded.updated_at`,
        )
          .bind(managedAssetsValue, managedAssetsLabel, updatedAt)
          .run();

        return Response.json({ managedAssetsValue, managedAssetsLabel, canEdit: true, canManageUsers: isOwner });
      }

      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, PUT" } });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
