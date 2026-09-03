const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the Lovable AI Gateway and returns a parsed JSON object matching the
 * requested shape. The model is instructed never to invent information.
 */
export async function callAiJson<T>(system: string, user: string): Promise<T> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError("AI is not configured on this server.", 500);

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            system +
            "\n\nRules: Respond with valid json only, no markdown fences. Never invent facts, names, dates, statistics, studies or URLs. When something is unclear, mark it as \"uncertain\".",
        },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429)
      throw new AiError("The AI service is busy right now. Please try again in a moment.", 429);
    if (res.status === 402)
      throw new AiError("AI credits are exhausted. Please add credits to continue.", 402);
    if (res.status === 403)
      throw new AiError("AI access is currently blocked for this workspace.", 403);
    throw new AiError(text?.slice(0, 300) || "The AI request failed.", res.status);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AiError("The AI returned an unreadable response. Please try again.", 502);
  }
}
