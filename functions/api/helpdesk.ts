export interface Env {
  AI: any; // Workers AI binding
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

// ✅ Health check (GET) so we can confirm the function + binding works
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/api/helpdesk")) {
    return json({
      ok: true,
      hasAI: !!env?.AI,
      ts: new Date().toISOString(),
    });
  }
  return json({ ok: true });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body?.message || "").trim();
    const page = String(body?.page || "/");

    if (!message) return json({ reply: "Please type your inquiry." }, 200);

    // ✅ If binding is missing, respond clearly
    if (!env?.AI) {
      return json({
        reply:
          "AI is not connected yet (missing Workers AI binding). Please try again after enabling binding.",
      });
    }

    const system =
      "You are Carpinoy AI Helpdesk for Carpinoy Logistics Services (Philippines). " +
      "Be concise, professional, and helpful. " +
      "If asked about rates: request route, vehicle type, volume, and schedule. " +
      "If asked about requirements/accreditation: ask which program and point to the relevant site page. " +
      "If asked about contact/location: direct to Contact Us page. " +
      "Do NOT invent phone numbers, addresses, or rates. " +
      "If unsure, ask 1-2 clarifying questions.";

    // ✅ Use a commonly supported Workers AI chat model id
    // If this model is not available in your account/region, we’ll swap it after the health check.
    const model = "@cf/meta/llama-3.1-8b-instruct";

    const result = await env.AI.run(model, {
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Page: ${page}\nUser: ${message}` },
      ],
      max_tokens: 350,
      temperature: 0.4,
    });

    // ✅ Handle multiple possible output shapes
    const reply =
      (typeof result === "string" && result) ||
      (result?.response && String(result.response)) ||
      (result?.result?.response && String(result.result.response)) ||
      (result?.result && typeof result.result === "string" && String(result.result)) ||
      (result?.output && String(result.output)) ||
      "";

    return json({
      reply: (reply || "Salamat. Pakilinaw ang details para ma-assist ka namin.").trim(),
    });
  } catch (e: any) {
    // ✅ Return a short debug code (safe) so we know what's happening
    const msg = String(e?.message || e || "");
    return json({
      reply:
        "Sorry—temporary issue. Please try again. (ERR_AI_RUN)",
      debug:
        msg.slice(0, 180), // keep short
    });
  }
};
