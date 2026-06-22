/**
 * SSRF guard for the news URL auto-fill fetcher.
 *
 * The hostname string is not trustworthy on its own: WHATWG URL parsing rewrites
 * IPv4-mapped IPv6 literals (`[::ffff:127.0.0.1]` -> `[::ffff:7f00:1]`) into hex
 * forms that defeat naive string matching, and a public hostname can resolve to
 * a private address. So we classify by parsed IP and, for real hostnames,
 * resolve via DNS and check every returned address. IP-range classification is
 * pure (and unit tested); only `assertUrlAllowed` touches DNS.
 *
 * Residual gap: a TOCTOU DNS-rebind between lookup and connect is not closed
 * here. The action is gated by requireAdmin (single master account), so the
 * proportionate control is pre-fetch resolution plus per-redirect-hop revalidation.
 */

import net from "node:net";
import { lookup } from "node:dns/promises";

function hextetsToIpv4(hi: number, lo: number): string {
  return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
}

/** Expand any IPv6 literal (including `::`-compressed and IPv4-embedded forms) to 8 hextets, or null. */
export function expandIpv6(input: string): number[] | null {
  let s = input.trim().toLowerCase();
  const zone = s.indexOf("%");
  if (zone >= 0) s = s.slice(0, zone);
  if (s === "") return null;

  // Fold a trailing dotted-quad (e.g. ::ffff:127.0.0.1) into two hextets.
  const lastColon = s.lastIndexOf(":");
  const tail = s.slice(lastColon + 1);
  if (tail.includes(".")) {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(tail);
    if (!m) return null;
    const o = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    if (o.some((n) => n > 255)) return null;
    const folded = [(o[0] << 8) | o[1], (o[2] << 8) | o[3]];
    s = s.slice(0, lastColon + 1) + folded.map((h) => h.toString(16)).join(":");
  }

  const halves = s.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const back = halves.length === 2 ? (halves[1] ? halves[1].split(":") : []) : null;

  let hextets: string[];
  if (back === null) {
    hextets = head;
  } else {
    const missing = 8 - head.length - back.length;
    if (missing < 0) return null;
    hextets = [...head, ...Array(missing).fill("0"), ...back];
  }
  if (hextets.length !== 8) return null;

  const nums = hextets.map((h) => (h === "" ? 0 : Number.parseInt(h, 16)));
  if (nums.some((n) => Number.isNaN(n) || n < 0 || n > 0xffff)) return null;
  return nums;
}

function isBlockedIpv4(ip: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!m) return true;
  const oct = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
  if (oct.some((n) => n > 255)) return true;
  const [a, b] = oct;
  if (a === 0 || a === 10 || a === 127) return true; // this-host / private / loopback
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  return false;
}

/**
 * True when an IP literal points at a loopback / private / link-local / ULA /
 * CGNAT / cloud-metadata target, including IPv4-mapped, IPv4-compatible and
 * NAT64-embedded IPv6 forms. Non-IP strings return false (resolve them first).
 */
export function isBlockedIp(ip: string): boolean {
  const host = ip.replace(/^\[|\]$/g, "");
  if (net.isIPv4(host)) return isBlockedIpv4(host);
  if (!net.isIPv6(host)) return false;

  const h = expandIpv6(host);
  if (!h) return true; // unparseable IPv6 -> block conservatively

  if (h.every((x) => x === 0)) return true; // unspecified ::
  if (h.slice(0, 7).every((x) => x === 0) && h[7] === 1) return true; // loopback ::1

  const v4MappedOrCompat =
    h[0] === 0 && h[1] === 0 && h[2] === 0 && h[3] === 0 && h[4] === 0 &&
    (h[5] === 0xffff || h[5] === 0);
  const nat64 =
    h[0] === 0x64 && h[1] === 0xff9b && h[2] === 0 && h[3] === 0 && h[4] === 0 && h[5] === 0;
  if ((v4MappedOrCompat || nat64) && (h[6] !== 0 || h[7] !== 0)) {
    return isBlockedIpv4(hextetsToIpv4(h[6], h[7]));
  }

  if ((h[0] & 0xfe00) === 0xfc00) return true; // ULA fc00::/7
  if ((h[0] & 0xffc0) === 0xfe80) return true; // link-local fe80::/10
  return false;
}

export type UrlCheck = { ok: true; url: URL } | { ok: false; reason: string };

/** Validate scheme, reject internal hostnames, and reject any URL that resolves to a blocked IP. */
export async function assertUrlAllowed(raw: string): Promise<UrlCheck> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "올바른 URL을 입력해 주세요." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "http 또는 https 주소만 지원합니다." };
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host)) {
    return isBlockedIp(host)
      ? { ok: false, reason: "허용되지 않은 주소입니다." }
      : { ok: true, url };
  }
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return { ok: false, reason: "허용되지 않은 주소입니다." };
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    return { ok: false, reason: "주소를 확인할 수 없습니다." };
  }
  if (!addresses.length) {
    return { ok: false, reason: "주소를 확인할 수 없습니다." };
  }
  for (const addr of addresses) {
    if (isBlockedIp(addr.address)) {
      return { ok: false, reason: "허용되지 않은 주소입니다." };
    }
  }
  return { ok: true, url };
}
