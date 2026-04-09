/**
 * Reads an SSE (Server-Sent Events) stream used by OpenAI-compatible APIs.
 * Each line has the format `data: <json>` with `data: [DONE]` as the sentinel.
 * Extracts `choices[0].delta.content` from each chunk.
 */
export async function readSSEStream(
  body: ReadableStream<Uint8Array>,
  onToken: (token: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          accumulated += content;
          onToken(content);
        }
      } catch {
        // skip malformed SSE chunks
      }
    }
  }

  return accumulated;
}

/**
 * Reads an NDJSON stream used by Ollama's `/api/chat` endpoint.
 * Each line is a JSON object with `message.content` and a `done` flag.
 */
export async function readNDJSONStream(
  body: ReadableStream<Uint8Array>,
  onToken: (token: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const parsed = JSON.parse(trimmed) as {
          message?: { content?: string };
          done?: boolean;
        };
        const content = parsed.message?.content;
        if (content) {
          accumulated += content;
          onToken(content);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return accumulated;
}
