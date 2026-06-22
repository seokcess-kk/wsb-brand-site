import { test, expect } from "@playwright/test";
import { isBlockedIp, expandIpv6 } from "../../src/lib/url-safety";

test("blocks private / loopback / link-local IPv4", () => {
  for (const ip of [
    "127.0.0.1",
    "0.0.0.0",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254", // cloud metadata
    "100.64.0.1", // CGNAT
  ]) {
    expect(isBlockedIp(ip), ip).toBe(true);
  }
});

test("allows public IPv4", () => {
  for (const ip of ["8.8.8.8", "1.1.1.1", "203.0.113.10", "172.32.0.1"]) {
    expect(isBlockedIp(ip), ip).toBe(false);
  }
});

test("blocks IPv4-mapped / compatible / NAT64 IPv6 that escape string matching", () => {
  for (const ip of [
    "::1", // loopback
    "::", // unspecified
    "::ffff:7f00:1", // ::ffff:127.0.0.1 (the hex form new URL() produces)
    "[::ffff:7f00:1]", // bracketed
    "::ffff:127.0.0.1", // dotted mapped
    "::ffff:a9fe:a9fe", // 169.254.169.254 metadata
    "::ffff:c0a8:101", // 192.168.1.1
    "64:ff9b::7f00:1", // NAT64 -> 127.0.0.1
    "fc00::1", // ULA
    "fd12:3456::1", // ULA
    "fe80::1", // link-local
  ]) {
    expect(isBlockedIp(ip), ip).toBe(true);
  }
});

test("allows public IPv6", () => {
  for (const ip of ["2606:4700:4700::1111", "2001:4860:4860::8888"]) {
    expect(isBlockedIp(ip), ip).toBe(false);
  }
});

test("non-IP strings are not classified as blocked (resolve first)", () => {
  expect(isBlockedIp("example.com")).toBe(false);
});

test("expandIpv6 folds embedded IPv4 and compression, rejects junk", () => {
  expect(expandIpv6("::ffff:127.0.0.1")).toEqual([0, 0, 0, 0, 0, 0xffff, 0x7f00, 1]);
  expect(expandIpv6("::1")).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
  expect(expandIpv6("not-an-ip")).toBeNull();
});
