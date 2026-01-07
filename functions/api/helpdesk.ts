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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    const body = await request.json().catch(() => ({}));
    const message = String(body?.message || "").trim();
    const page = String(body?.page || "/");

    if (!message) return json({ reply: "Please type your inquiry." }, 200);

    const system = `
You are Carpinoy AI Helpdesk for Carpinoy Logistics Services (Philippines).
Be concise, professional, and helpful.
If asked about rates: request route, vehicle type, volume, and schedule.
If asked about requirements/accreditation: ask which program and point to the relevant site page.
If asked about contact/location: direct to Contact Us page.
Do NOT invent phone numbers, addresses, or rates.
If unsure, ask 1-2 clarifying questions.
`;

    const model = "@cf/meta/llama-3.1-8b-instruct-fast"; // Meta Llama on Workers AI :contentReference[oaicite:2]{index=2}

    const result = await env.AI.run(model, {
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Page: ${page}\nUser: ${message}` },
      ],
      max_tokens: 350,
      temperature: 0.4,
    });

    // handle common output shapes
    const reply =
      (result?.response && String(result.response)) ||
      (result?.result && String(result.result)) ||
      (typeof result === "string" ? result : "");

    return json({ reply: (reply || "Salamat. Pakilinaw ang details para ma-assist ka namin.").trim() });
  } catch (e) {
    return json({ reply: "Sorry—temporary issue. Please try again or use Contact Us." }, 200);
  }
};
