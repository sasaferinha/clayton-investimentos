/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  ADMIN_USER_ID?: string;
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

        const userId = request.headers.get("oai-authenticated-user-id");
        return Response.json(
          { ...settings, canEdit: Boolean(userId && env.ADMIN_USER_ID && userId === env.ADMIN_USER_ID) },
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-store",
            },
          },
        );
      }

      if (request.method === "PUT") {
        const userId = request.headers.get("oai-authenticated-user-id");

        if (!userId) {
          return Response.json({ error: "Faça login para editar." }, { status: 401 });
        }

        if (!env.ADMIN_USER_ID || userId !== env.ADMIN_USER_ID) {
          return Response.json({ error: "Acesso restrito ao proprietário." }, { status: 403 });
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

        return Response.json({ managedAssetsValue, managedAssetsLabel, canEdit: true });
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
