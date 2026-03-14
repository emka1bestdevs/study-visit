/**
 * Runs after the main seed to find Wikipedia campus photos
 * for universities that didn't get images in the first pass.
 *
 * Strategy:
 * 1. Fetch all article images (prop=images) for each missing university
 * 2. Filter out logos/seals by filename pattern
 * 3. Use imageinfo API to get the actual URL + dimensions
 * 4. Pick the first landscape photo (width > height, width > 400)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOGO_RE =
  /logo|seal|coat[_.\s-]?of[_.\s-]?arms|emblem|shield|crest|badge|arms|flag|blazon|insignia|icon|map|location/i;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function wikiGet(params: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams({
    format: "json",
    origin: "*",
    ...params
  }).toString();
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${qs}`, {
    headers: { "User-Agent": "WorldUniversitiesApp/1.0 (educational)" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Search Wikipedia for the correct article title */
async function findArticleTitle(name: string): Promise<string | null> {
  try {
    const data = (await wikiGet({
      action: "query",
      list: "search",
      srsearch: name,
      srlimit: "1",
      srnamespace: "0"
    })) as { query?: { search?: Array<{ title: string }> } };
    return data?.query?.search?.[0]?.title ?? null;
  } catch {
    return null;
  }
}

/** Get a list of image filenames used in a Wikipedia article */
async function getArticleImages(title: string): Promise<string[]> {
  try {
    const data = (await wikiGet({
      action: "query",
      titles: title,
      prop: "images",
      imlimit: "30",
      redirects: "1"
    })) as {
      query?: {
        pages?: Record<string, { images?: Array<{ title: string }> }>;
      };
    };
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0];
    return (page?.images ?? []).map((img) => img.title);
  } catch {
    return [];
  }
}

/** Get the image URL and dimensions for a set of filenames */
async function getImageInfos(
  filenames: string[]
): Promise<Array<{ title: string; url: string; width: number; height: number }>> {
  if (filenames.length === 0) return [];
  try {
    const data = (await wikiGet({
      action: "query",
      titles: filenames.join("|"),
      prop: "imageinfo",
      iiprop: "url|size",
      iiurlwidth: "900"
    })) as {
      query?: {
        pages?: Record<
          string,
          {
            title: string;
            imageinfo?: Array<{ thumburl?: string; url: string; width: number; height: number }>;
          }
        >;
      };
    };
    const pages = data?.query?.pages ?? {};
    return Object.values(pages)
      .filter((p) => p.imageinfo?.[0])
      .map((p) => ({
        title: p.title,
        url: p.imageinfo![0].thumburl ?? p.imageinfo![0].url,
        width: p.imageinfo![0].width,
        height: p.imageinfo![0].height
      }));
  } catch {
    return [];
  }
}

async function findBestCampusPhoto(universityName: string): Promise<string | null> {
  // Step 1: find the article title
  const title = await findArticleTitle(universityName);
  if (!title) return null;
  await sleep(150);

  // Step 2: get all images in the article
  const allImages = await getArticleImages(title);
  await sleep(150);

  // Step 3: filter candidates
  const candidates = allImages.filter((filename) => {
    const lower = filename.toLowerCase();
    if (LOGO_RE.test(lower)) return false;
    // keep only common photo formats
    return /\.(jpg|jpeg|png|webp)/i.test(lower);
  });

  if (candidates.length === 0) return null;

  // Step 4: get imageinfo for up to 6 candidates
  const infos = await getImageInfos(candidates.slice(0, 6));
  await sleep(150);

  // Step 5: pick first landscape image with decent width
  const good = infos.find((info) => info.width >= 400 && info.width >= info.height * 1.1);
  return good?.url ?? infos[0]?.url ?? null;
}

async function main() {
  const missing = await prisma.university.findMany({
    where: { imageUrl: null },
    select: { id: true, name: true },
    orderBy: { id: "asc" }
  });

  console.log(`Found ${missing.length} universities without images. Starting deep search...`);

  let updated = 0;
  for (const uni of missing) {
    try {
      const url = await findBestCampusPhoto(uni.name);
      if (url) {
        await prisma.university.update({
          where: { id: uni.id },
          data: { imageUrl: url }
        });
        updated++;
        console.log(`  ✓ ${uni.name}`);
      }
    } catch (err) {
      console.warn(`  ✗ ${uni.name}: ${(err as Error).message}`);
    }
    // polite rate limit
    await sleep(400);
  }

  console.log(`\nDone. Updated ${updated}/${missing.length} universities.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
