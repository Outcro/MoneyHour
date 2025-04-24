// worker_streamed.js

// 1) Utility to strip newlines & color codes
function normalizeLore(rawLore) {
  return rawLore
    .replace(/\r?\n/g, " ")
    .replace(/§[0-9A-FK-OR]/gi, "");
}

// 2) Filter logic for god-rolls, pets, runes, Kuudra & shards
function filters(auction) {
  const name = auction.item_name.toString();
  const rawLore = auction.item_lore.toString();
  const lore = normalizeLore(rawLore);
  const bin = auction.bin;
  let result = { filterID: null, filterID2: null, extra: null, isPet: false };

  // A) Golden Dragon 100–200
  if (name.includes("Golden Dragon") && !name.includes("✦") && bin) {
    result.extra = lore.includes("Pet Candy Used") ? "candied" : "uncandied";
    for (let lvl = 100; lvl <= 200; lvl++) {
      if (name.includes(lvl.toString())) {
        result.filterID = name.toUpperCase();
        return result;
      }
    }
  }

  // B) Pets by rarity or full Legendary
  if (lore.includes("Pet") && bin && !name.includes("Golden Dragon") && !name.includes("✦")) {
    const rarities = ["COMMON","UNCOMMON","RARE","EPIC","LEGENDARY"];
    for (let i = 0; i < rarities.length; i++) {
      if (lore.includes(rarities[i])) {
        const idx = i;
        const base = name
          .replace(/^\[.*?\]\s*/, "")
          .replace(/\s+/g, "_")
          .toUpperCase();
        result.isPet = true;
        result.extra = null;
        result.filterID = `${base};${idx}`;
        return result;
      }
    }
  }



  // rest of your filters...
  return null;
}

export default {
  // HTTP handler
  async fetch(req, env) {
    const C = {
      "Content-Type":"application/json",
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"GET,OPTIONS",
      "Access-Control-Allow-Headers":"*"
    };
    if (req.method === "OPTIONS") return new Response("", { headers: C });
    const d = await env.PRICES_KV.get("latest");
    return new Response(d || "{}", { headers: C });
  },

  // Cron handler
  async scheduled(evt, env) {
    const COFL    = "https://sky.coflnet.com/api/prices/neu";
    const BAZAAR  = "https://api.hypixel.net/v2/skyblock/bazaar";
    const ITEMS   = "https://api.hypixel.net/v2/resources/skyblock/items";
    const AUCTION = "https://api.hypixel.net/v2/skyblock/auctions?page=";

    // fetch cofl
    const coflData = await fetch(COFL).then(res => res.json());

    // fetch metadata
    const [baz, items] = await Promise.all([
      fetch(BAZAAR).then(r => r.json()),
      fetch(ITEMS).then(r => r.json())
    ]);
    const itemMeta = {};
    items.items.forEach(it => {
      itemMeta[it.id] = it.npc_sell_price || null;
    });

    // 5) COFL pet buckets only
    const out = {};
    Object.entries(coflData).forEach(([key, price]) => {
      const u = key.toUpperCase().replace(/ /g, "_");
      if (/;[0-4]$/.test(u)) {
        out[u] = { Price: price, Extra: null, UUID: null, NPC_SELL_PRICE: itemMeta[u] || null };
      }
    });

    // 6) Stream AH pages
    const first = await fetch(AUCTION + "0").then(r => r.json());
    const total = first.totalPages || 1;
    for (let i = 0; i < total; i++) {
      const pg = i === 0 ? first : await fetch(AUCTION + i).then(r => r.json());
      pg.auctions.forEach(a => {
        if (!a.bin) return;
        const f = filters(a);
        if (!f || !f.filterID) return;
        const id = f.filterID, p = a.starting_bid;
        if (!out[id] || p < out[id].Price || id.endsWith(";4")) {
          out[id] = { Price: p, Extra: f.extra, UUID: f.isPet ? a.uuid : null, NPC_SELL_PRICE: itemMeta[id] || null };
        }
        if (f.filterID2) {
          const id2 = f.filterID2;
          if (!out[id2] || p < out[id2].Price) {
            out[id2] = { Price: p, Extra: f.extra, UUID: f.isPet ? a.uuid : null, NPC_SELL_PRICE: itemMeta[id2] || null };
          }
        }
      });
    }

    // 7) bazaar fallback
    Object.entries(baz.products).forEach(([id, prod]) => {
      if (out[id]) return;
      const bp = prod.quick_status?.buyPrice || 0;
      if (bp > 0) out[id] = { Price: bp, Extra: null, UUID: null, NPC_SELL_PRICE: itemMeta[id] || null };
    });

    await env.PRICES_KV.put("latest", JSON.stringify(out, null, 2));
  }
};
