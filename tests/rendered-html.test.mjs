import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${label}-${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const ctx = {
  waitUntil() {},
  passThroughOnException() {},
};

test("server-renders the Clayton landing page", async () => {
  const worker = await loadWorker("home");
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Clayton \| Assessor de Investimentos<\/title>/i);
  assert.match(html, /Seu patrimônio merece/);
  assert.match(html, /\+11M/);
  assert.match(html, /sob gestão/);
  assert.match(html, /RENDA FIXA/);
});

test("settings endpoint returns safe defaults without a database", async () => {
  const worker = await loadWorker("api");
  const response = await worker.fetch(
    new Request("http://localhost/api/site-settings"),
    env,
    ctx,
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    managedAssetsValue: "+11M",
    managedAssetsLabel: "sob gestão",
    canEdit: false,
  });
});

test("settings endpoint rejects anonymous writes", async () => {
  const worker = await loadWorker("api-write");
  const response = await worker.fetch(
    new Request("http://localhost/api/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managedAssetsValue: "+12M", managedAssetsLabel: "sob gestão" }),
    }),
    env,
    ctx,
  );

  assert.equal(response.status, 401);
});
