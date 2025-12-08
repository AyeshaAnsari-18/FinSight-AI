// src/roles/Manager/services/FiscalApi.ts

export async function runFiscalAgentFrontend(fiscalJson: any) {
  const res = await fetch("http://127.0.0.1:8000/run-fiscal-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: fiscalJson })
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Backend error: ${msg}`);
  }

  const answer = await res.json();
  return answer.result;
}
