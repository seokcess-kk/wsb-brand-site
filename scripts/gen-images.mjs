// Brand-tone facility photography via OpenAI gpt-image-2, saved into public/.
//
// Modes:
//   node scripts/gen-images.mjs [name...]                       # from the IMAGES registry
//   node scripts/gen-images.mjs --out FILE.jpg --prompt-file P  # arbitrary prompt (file)
//   node scripts/gen-images.mjs --out FILE.jpg --prompt "..."   # arbitrary prompt (inline)
//   optional: --size 1536x1024 (default)
//
// Reads OPENAI_API_KEY from the environment or .env.local (Node does not auto-load
// .env). The key is never logged. Retries 429/5xx with exponential backoff so the
// generate/verify loop can fire several agents at once without tripping rate limits.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const envPath = resolve(ROOT, ".env.local");
  if (existsSync(envPath)) {
    const m = readFileSync(envPath, "utf8").match(
      /^\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$/m,
    );
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

// Try the newest model first; fall back when the API does not recognize it.
// Override with OPENAI_IMAGE_MODEL to pin a single model.
const MODELS = process.env.OPENAI_IMAGE_MODEL
  ? [process.env.OPENAI_IMAGE_MODEL]
  : ["gpt-image-2", "gpt-image-1"];

async function callModel(model, prompt, size, key) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        quality: "high",
        output_format: "jpeg",
        n: 1,
      }),
    });
    if (res.ok) return { ok: true, data: await res.json() };

    const status = res.status;
    const text = await res.text();
    const retriable = [429, 500, 502, 503, 529].includes(status);
    if (retriable && attempt < 4) {
      const wait = 2000 * 2 ** attempt;
      console.log(`  ${status} from ${model}, retry in ${wait}ms ...`);
      await sleep(wait);
      continue;
    }
    return { ok: false, status, text };
  }
  return { ok: false, status: 0, text: "exhausted retries" };
}

async function generate(prompt, size, key) {
  let lastErr = "unknown error";
  for (const model of MODELS) {
    const r = await callModel(model, prompt, size, key);
    if (r.ok) {
      const b64 = r.data?.data?.[0]?.b64_json;
      if (b64) return { model, b64 };
      lastErr = `no image data: ${JSON.stringify(r.data).slice(0, 300)}`;
      break;
    }
    lastErr = `${r.status} ${r.text}`;
    const modelIssue = r.status === 404 || /model/i.test(lastErr);
    if (!modelIssue) break;
    if (model !== MODELS[MODELS.length - 1]) {
      console.log(`  ${model} unavailable, falling back ...`);
    }
  }
  return { error: lastErr };
}

// Registry. People-free, tonally aligned with existing facility photos (calm,
// high-tech, faint deep-green cast) so photo-grade-green unifies them.
const IMAGES = [
  {
    out: "business-material.jpg",
    prompt:
      "Photorealistic wide interior shot of a sterile cGMP pharmaceutical clean room. " +
      "A polished stainless-steel laboratory bench holds clear glass vials filled with " +
      "fine pale-green botanical extract powder, a glass petri dish, and precision " +
      "analytical instruments. Soft cool clinical lighting with a faint deep-green cast, " +
      "shallow depth of field, calm high-tech industrial mood. Absolutely no people, no " +
      "faces, no text, no logos, no watermarks. Editorial product photography, 35mm, " +
      "ultra-detailed.",
  },
  {
    out: "home-contact-backdrop.jpg",
    prompt:
      "Ultra-wide dark cinematic interior of a high-tech plant biotechnology facility in low light. " +
      "Deep charcoal and deep cultivation green tones, rows of vertical cultivation racks and stainless " +
      "bioprocess equipment receding into shadow, subtle volumetric haze. Very low contrast and mostly " +
      "dark with large areas of near-black negative space so white text and a form panel sit clearly on " +
      "top. No people, no faces, no text, no logos, no signage, no watermark. Muted desaturated, quiet " +
      "industrial precision mood, photoreal.",
  },
];

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
};

const key = loadKey();
if (!key) {
  console.error(
    "OPENAI_API_KEY not found. Add it to .env.local (OPENAI_API_KEY=sk-...) and retry.",
  );
  process.exit(1);
}

async function writeOut(out, b64, model) {
  writeFileSync(resolve(ROOT, "public", out), Buffer.from(b64, "base64"));
  console.log(`  ✓ saved public/${out} (${model})`);
}

const outFlag = flag("--out");
const promptFile = flag("--prompt-file");
const promptInline = flag("--prompt");
const sizeFlag = flag("--size") || "1536x1024";

if (outFlag && (promptFile || promptInline)) {
  const prompt = promptFile
    ? readFileSync(resolve(ROOT, promptFile), "utf8").trim()
    : promptInline;
  console.log(`→ generating ${outFlag} ...`);
  const { model, b64, error } = await generate(prompt, sizeFlag, key);
  if (error) {
    console.error(`  failed: ${error}`);
    process.exit(1);
  }
  await writeOut(outFlag, b64, model);
  console.log("done.");
} else {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const targets = positional.length
    ? IMAGES.filter((i) => {
        const stem = i.out.replace(/\.[^.]+$/, "");
        return positional.includes(i.out) || positional.includes(stem);
      })
    : IMAGES;
  if (targets.length === 0) {
    console.error(`No matching images for: ${positional.join(", ")}`);
    process.exit(1);
  }
  for (const img of targets) {
    console.log(`→ generating ${img.out} ...`);
    const { model, b64, error } = await generate(
      img.prompt,
      img.size || "1536x1024",
      key,
    );
    if (error) {
      console.error(`  failed: ${error}`);
      process.exit(1);
    }
    await writeOut(img.out, b64, model);
  }
  console.log("done.");
}
