import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal Billplz (Malaysian payment gateway) client.
 *
 * Billplz has no sandbox-vs-production SDK split — it's two separate base URLs with separate
 * accounts/keys. Set BILLPLZ_SANDBOX=false once you switch to a live Billplz account.
 *
 * Docs: https://www.billplz.com/api (production) / https://www.billplz-sandbox.com/api (sandbox).
 */

const API_KEY = process.env.BILLPLZ_API_KEY;
const COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;
const X_SIGNATURE_KEY = process.env.BILLPLZ_X_SIGNATURE_KEY;
const SANDBOX = process.env.BILLPLZ_SANDBOX !== "false"; // defaults to sandbox unless explicitly disabled

export function isBillplzConfigured(): boolean {
  return Boolean(API_KEY && COLLECTION_ID);
}

function baseUrl() {
  return SANDBOX ? "https://www.billplz-sandbox.com/api/v3" : "https://www.billplz.com/api/v3";
}

function authHeader() {
  // Billplz uses HTTP Basic Auth with the API key as the username and an empty password.
  return "Basic " + Buffer.from(`${API_KEY}:`).toString("base64");
}

export interface CreateBillParams {
  /** Amount in the smallest currency unit (sen), e.g. RM 25.00 → 2500. */
  amountCents: number;
  name: string;
  email: string;
  mobile?: string;
  description: string;
  callbackUrl: string;
  redirectUrl: string;
  /** Shown on the Billplz dashboard; we use it to carry our own order id. */
  reference1Label?: string;
  reference1?: string;
}

export interface BillplzBill {
  id: string;
  url: string;
  state: string;
  paid: boolean;
}

export class BillplzError extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "BillplzError";
  }
}

export async function createBill(params: CreateBillParams): Promise<BillplzBill> {
  if (!isBillplzConfigured()) {
    throw new BillplzError("Billplz is not configured (missing BILLPLZ_API_KEY / BILLPLZ_COLLECTION_ID).");
  }

  const body = new URLSearchParams({
    collection_id: COLLECTION_ID!,
    email: params.email,
    name: params.name,
    amount: String(Math.round(params.amountCents)),
    description: params.description.slice(0, 200),
    callback_url: params.callbackUrl,
    redirect_url: params.redirectUrl,
  });
  if (params.mobile) body.set("mobile", params.mobile);
  if (params.reference1Label) body.set("reference_1_label", params.reference1Label.slice(0, 20));
  if (params.reference1) body.set("reference_1", params.reference1.slice(0, 120));

  const res = await fetch(`${baseUrl()}/bills`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.id) {
    throw new BillplzError(`Billplz createBill failed (${res.status})`, res.status, json);
  }

  return { id: json.id, url: json.url, state: json.state, paid: Boolean(json.paid) };
}

export async function getBill(billId: string): Promise<BillplzBill> {
  const res = await fetch(`${baseUrl()}/bills/${encodeURIComponent(billId)}`, {
    headers: { Authorization: authHeader() },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.id) {
    throw new BillplzError(`Billplz getBill failed (${res.status})`, res.status, json);
  }
  return { id: json.id, url: json.url, state: json.state, paid: Boolean(json.paid) };
}

/**
 * Verifies a Billplz callback/redirect's `X-Signature`.
 *
 * Algorithm (per Billplz's documented X_SIGNATURE_KEY scheme): take every `billplz[...]` field
 * except the signature itself, sort by key, concatenate as `key+value` pairs joined by `|`, then
 * HMAC-SHA256 the result with the account's X Signature Key and compare hex digests.
 *
 * IMPORTANT: verify this against a real sandbox callback before going live — Billplz's algorithm
 * is not published in machine-readable form, and account dashboards occasionally differ in the
 * exact field set included. If verification keeps failing against real sandbox payloads, log the
 * raw payload and adjust `fields`/`joiner` below to match.
 */
export function verifyBillplzSignature(fields: Record<string, string>, signatureHex: string): boolean {
  if (!X_SIGNATURE_KEY) return false;
  const sortedKeys = Object.keys(fields).sort();
  const source = sortedKeys.map((k) => `${k}${fields[k]}`).join("|");
  const expected = createHmac("sha256", X_SIGNATURE_KEY).update(source).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signatureHex, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Parses `billplz[id]`, `billplz[paid]`, … style form fields into a flat object, keyed without the prefix. */
export function parseBillplzFields(formData: URLSearchParams | FormData): { fields: Record<string, string>; signature: string | null } {
  const fields: Record<string, string> = {};
  let signature: string | null = null;
  for (const [rawKey, rawValue] of formData.entries()) {
    const match = /^billplz\[(.+)\]$/.exec(rawKey);
    if (!match) continue;
    const value = String(rawValue);
    if (match[1] === "x_signature") signature = value;
    else fields[match[1]] = value;
  }
  return { fields, signature };
}
