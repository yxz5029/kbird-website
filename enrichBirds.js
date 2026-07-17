import fs from "fs";

const API_KEY = "YOUR_EBIRD_API_KEY"; // 以后可以加

async function fetchTaxonomy() {
  const res = await fetch(
    "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json",
    {
      headers: {
        "X-eBirdApiToken": API_KEY
      }
    }
  );

  return await res.json();
}

// build lookup map
function buildMap(data) {
  const map = {};

  for (const item of data) {
    map[item.comName] = {
      scientificName: item.sciName,
      family: item.familyComName || "Unknown",
      category: item.category || "Unknown"
    };
  }

  return map;
}

function enrich(birds, map) {
  return birds.map(bird => {
    const match = map[bird.commonName];

    return {
      ...bird,
      scientificName: match?.scientificName || "UNKNOWN",
      family: match?.family || "UNKNOWN"
    };
  });
}

async function main() {
  const input = JSON.parse(
    fs.readFileSync("./data/bird_base.json", "utf-8")
  );

  const taxonomy = await fetchTaxonomy();
  const map = buildMap(taxonomy);

  const output = enrich(input, map);

  fs.writeFileSync(
    "./data/birds_enriched.json",
    JSON.stringify(output, null, 2)
  );

  console.log("Done:", output.length);
}

main();