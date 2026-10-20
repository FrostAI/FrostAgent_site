const fs = require("node:fs/promises");
const path = require("node:path");

const repository = "GuaiZai233/FrostAgent";
const root = path.resolve(__dirname, "..");
const headers = { "User-Agent": "FrostAgent-Site", Accept: "application/vnd.github+json" };
const imageExtensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

async function request(url, options = {}) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), ...options });
  if (!response.ok) throw new Error(`${response.status} while fetching ${url}`);
  return response;
}

async function main() {
  const records = [];
  for (let page = 1; ; page++) {
    const response = await request(`https://api.github.com/repos/${repository}/contributors?per_page=100&page=${page}`, { headers });
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error("Invalid GitHub contributor response");
    records.push(...batch);
    if (batch.length < 100) break;
  }
  if (!records.length) throw new Error("GitHub returned no contributors; retaining the existing snapshot");

  const people = await Promise.all(records.map(async (person) => {
    if (!/^[a-z0-9_-]+(?:\[bot\])?$/i.test(person.login) || !Number.isSafeInteger(person.id)) {
      throw new Error("Invalid contributor identity");
    }
    const profile = new URL(person.html_url);
    const avatar = new URL(person.avatar_url);
    if (profile.protocol !== "https:" || profile.hostname !== "github.com" || avatar.protocol !== "https:" || avatar.hostname !== "avatars.githubusercontent.com") {
      throw new Error("Unexpected contributor URL");
    }
    avatar.searchParams.set("s", "128");
    const response = await request(avatar);
    const extension = imageExtensions[response.headers.get("content-type")?.split(";")[0]];
    if (!extension) throw new Error("Unsupported contributor avatar format");
    return {
      login: person.login,
      url: profile.href,
      avatar: `/assets/contributors/${person.id}.${extension}`,
      contributions: person.contributions,
      bytes: Buffer.from(await response.arrayBuffer())
    };
  }));

  await fs.mkdir(path.join(root, "src/assets/contributors"), { recursive: true });
  for (const person of people) {
    await fs.writeFile(path.join(root, "src", person.avatar), person.bytes);
    delete person.bytes;
  }
  await fs.writeFile(path.join(root, "src/_data/contributors.json"), `${JSON.stringify({ repository, updatedAt: new Date().toISOString(), people }, null, 2)}\n`);
  console.log(`Updated ${people.length} contributors and local avatars for ${repository}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
