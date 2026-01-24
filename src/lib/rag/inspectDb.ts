import "dotenv/config";
import { chroma, getCollection } from "./chroma";

async function main() {
  // 1) list collections
  const cols = await chroma.listCollections();
  console.log("Collections:", cols.map((c: any) => c.name));

  // 2) inspect your collection
  const col = await getCollection();
  const count = await col.count();
  console.log("portfolio_kb count:", count);

  // 3) print a few stored chunks
  const res = await col.get({
    limit: 5,
    include: ["documents", "metadatas"],
  });

  for (let i = 0; i < (res.ids?.length || 0); i++) {
    console.log("\n---", res.ids?.[i], "---");
    console.log("meta:", res.metadatas?.[i]);
    console.log("text:", (res.documents?.[i] || "").slice(0, 250));
  }
}

main().catch(console.error);
