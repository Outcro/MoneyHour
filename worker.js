// worker.js

// 1) Utility to strip newlines & color codes
function normalizeLore(rawLore) {
  return rawLore
    .replace(/\r?\n/g, " ")
    .replace(/§[0-9A-FK-OR]/gi, "");
}

// 2) Auction filtering logic (pets, god-rolls, etc.)
function filters(auction) {
  const name    = auction.item_name.toString();
  const rawLore = auction.item_lore.toString();
  const lore    = normalizeLore(rawLore);
  const bin     = auction.bin;
  let result    = { filterID: null, extra: null, isPet: false };

  //
  // A) Golden Dragon 1–200 with Candy logic (unchanged)
  //
  if (name.includes("Golden Dragon") && !name.includes("✦") && bin) {
    result.extra = lore.includes("Pet Candy Used") ? "candied" : "uncandied";
    const lvlMatch = name.match(/\[Lvl (\d{1,3})\]/i);
    if (lvlMatch) {
      const lvl = parseInt(lvlMatch[1], 10);
      if (lvl >= 1 && lvl <= 200) {
        result.isPet    = true;
        result.filterID = `[LVL ${lvl}] Golden Dragon`;
        return result;
      }
    }
  }

  //
  // B) ANY other [Lvl X] pet (1–200), tag by exact lore category
  //
  if (/\[Lvl (\d{1,3})\]/i.test(name) && bin && !name.includes("✦")) {
    const [, lvlStr] = name.match(/\[Lvl (\d{1,3})\]/i);
    const lvl        = parseInt(lvlStr, 10);
    if (lvl >= 1 && lvl <= 200) {
      // Remove “[Lvl X] ” prefix
      const petName = name.replace(/^\[.*?\]\s*/, "");

      result.isPet = true;

      // Read exact lore lines to assign category
      if      (lore.includes("Combat Pet"))      result.extra = "Combat";
      else if (lore.includes("Farming Pet"))     result.extra = "Farming";
      else if (lore.includes("Mining Pet"))      result.extra = "Mining";
      else if (lore.includes("Foraging Pet"))    result.extra = "Foraging";
      else if (lore.includes("Fishing Pet"))     result.extra = "Fishing";
      else if (lore.includes("Enchanting Pet"))  result.extra = "Enchanting";
      else if (lore.includes("Alchemy Pet"))     result.extra = "Alchemy";
      else                                       result.extra = null;

      result.filterID = `[LVL ${lvl}] ${petName}`;
      return result;
    }
  }



  // B) Other pets by rarity (0=Common … 4=Legendary)
  if (lore.includes("Pet") && bin && !name.includes("Golden Dragon") && !name.includes("✦")) {
    const rarities = ["COMMON","UNCOMMON","RARE","EPIC","LEGENDARY"];
    for (let i = 0; i < rarities.length; i++) {
      if (lore.includes(rarities[i])) {
        const base = name
          .replace(/^\[.*?\]\s*/, "")   // strip “[Lvl X] ” if present
          .replace(/\s+/g, "_")         // spaces → underscores
          .toUpperCase();
        result.isPet    = true;
        result.extra    = null;
        result.filterID = `${base};${i}`;
        return result;
      }
    }
  }

  // D) Final Destination @10K
  if (name.includes("Final Destination") &&
      lore.includes("Next Upgrade: +335❈") &&
      bin) {
    let id = null;
    if      (name.includes("Helmet"))     id = "FINAL_DESTINATION_HELMET_10K";
    else if (name.includes("Chestplate")) id = "FINAL_DESTINATION_CHESTPLATE_10K";
    else if (name.includes("Leggings"))   id = "FINAL_DESTINATION_LEGGINGS_10K";
    else if (name.includes("Boots"))      id = "FINAL_DESTINATION_BOOTS_10K";
    if (id) {
      result.filterID = id;
      return result;
    }
  }

  // E) Reaper Scythe M3
  if (name.includes("Reaper Scythe") &&
      (lore.match(/Tank Zombie Lv80/g) || []).length === 10 &&
      bin) {
    result.filterID = "REAPER_SCYTHE_M3";
    return result;
  }

  // F) Specific named items
  const SPECIFIC = {
    "Scarf's Studies":    "SCARF_STUDIES",
    "Lucky Hoof":         "LUCKY_HOOF",
    "Water Hydra Head":   "WATER_HYDRA_HEAD",
    "Tarantula Talisman": "TARANTULA_TALISMAN",
    "Fire Freeze Staff":  "FIRE_FREEZE_STAFF",
    "Chumming Talisman":  "CHUMMING_TALISMAN"
  };
  for (const [kw, id] of Object.entries(SPECIFIC)) {
    if (name.includes(kw) && bin) {
      result.filterID = id;
      return result;
    }
  }

  // G) God-rolls & Kuudra specifics (dual-attr & single-attr tiers)
  if (bin) {
    // helper for fixed combos
    function check(key, mustInclude = []) {
      if (mustInclude.every(m => lore.includes(m))) {
        result.filterID = key;
        return true;
      }
      return false;
    }

    // Glowstone Gauntlet
    if (name.includes("Glowstone Gauntlet") &&
        ( check("GLOWSTONE_GAUNTLET_VETERAN_X_VITALITY_X", ["Veteran X","Vitality X"]) ||
          check("GLOWSTONE_GAUNTLET_MANA_POOL_X_MANA_REGENERATION_X", ["Mana Pool X","Mana Regeneration X"]) ||
          check("GLOWSTONE_GAUNTLET_DOMINANCE_X_SPEED_X", ["Dominance X","Speed X"]) )) {
      return result;
    }

    // Magma Necklace
    if (name.includes("Magma Necklace") &&
        ( check("MAGMA_NECKLACE_VETERAN_V_VITALITY_V", ["Veteran V","Vitality V"]) ||
          check("MAGMA_NECKLACE_MANA_POOL_V_MANA_REGENERATION_V", ["Mana Pool V","Mana Regeneration V"]) ||
          check("MAGMA_NECKLACE_DOMINANCE_V_SPEED_V", ["Dominance V","Speed V"]) ||
          check("MAGMA_NECKLACE_MP_MR", ["Mana Pool I","Mana Regeneration I"]) ||
          check("MAGMA_NECKLACE_VIT_VET", ["Vitality I","Veteran I"]) )) {
      return result;
    }

    // Blaze Belt
    if (name.includes("Blaze Belt") &&
        ( check("BLAZE_BELT_VETERAN_V_VITALITY_V", ["Veteran V","Vitality V"]) ||
          check("BLAZE_BELT_LIFELINE_V_MANA_POOL_V", ["Lifeline V","Mana Pool V"]) ||
          check("BLAZE_BELT_DOMINANCE_V_SPEED_V", ["Dominance V","Speed V"]) ||
          check("BLAZE_BELT_VIT_VET", ["Vitality I","Veteran I"]) )) {
      return result;
    }

    // Ghast Cloak
    if (name.includes("Ghast Cloak") &&
        ( check("GHAST_CLOAK_VETERAN_V_VITALITY_V", ["Veteran V","Vitality V"]) ||
          check("GHAST_CLOAK_MANA_POOL_V_MANA_REGENERATION_V", ["Mana Pool V","Mana Regeneration V"]) ||
          check("GHAST_CLOAK_MP_MR", ["Mana Pool I","Mana Regeneration I"]) ||
          check("GHAST_CLOAK_VIT_VET", ["Vitality I","Veteran I"]) )) {
      return result;
    }

    // Implosion Belt
    if (name.includes("Implosion Belt") &&
        ( check("IMPLOSION_BELT_MANA_POOL_V_MANA_REGENERATION_V", ["Mana Pool V","Mana Regeneration V"]) ||
          check("IMPLOSION_BELT_DOMINANCE_V_SPEED_V", ["Dominance V","Speed V"]) ||
          check("IMPLOSION_BELT_MP_MR", ["Mana Pool I","Mana Regeneration I"]) )) {
      return result;
    }

    // Magma Rod
    if (name.includes("Magma Rod") &&
        ( check("MAGMA_ROD_TROPHY_HUNTER_X_FISHERMAN_X", ["Trophy Hunter X","Fisherman X"]) ||
          check("MAGMA_ROD_DOUBLE_HOOK_X_FISHING_SPEED_X", ["Double Hook X","Fishing Speed X"]) )) {
      return result;
    }

    // Kuudra Sets (first two attrs), including Molten pieces
    const sets = ["Fervor","Aurora","Terror","Crimson","Hollow","Molten","Magma Lord","Lava Shell Necklace"];
    const ATTRS = [
      "Attack Speed","Blazing","Combo","Dominance","Experience","Fortitude",
      "Life Regeneration","Lifeline","Magic Find","Mana Pool","Mana Regeneration",
      "Speed","Veteran","Vitality"
    ];

    for (const set of sets) {
      if (!name.includes(set)) continue;

      // build prefix
      let prefix = set.toUpperCase().replace(/ /g,"_") + "_";
      if      (name.includes("Helmet"))     prefix += "HELMET_";
      else if (name.includes("Chestplate")) prefix += "CHESTPLATE_";
      else if (name.includes("Leggings"))   prefix += "LEGGINGS_";
      else if (name.includes("Boots"))      prefix += "BOOTS_";
      else if (name.includes("Belt"))       prefix += "BELT_";
      else if (name.includes("Cloak"))      prefix += "CLOAK_";
      else if (name.includes("Bracelet"))   prefix += "BRACELET_";
      else if (name.includes("Necklace"))   prefix += "NECKLACE_";

      // find matching attrs
      const found = ATTRS.filter(a => lore.includes(a));

      // dual-attr: first two
      if (found.length >= 2) {
        const two = found.slice(0,2).map(a => a.toUpperCase().replace(/ /g,"_"));
        result.filterID = prefix + two.join("_");
        return result;
      }

      // single-attr tier: e.g. "Mana Pool V"
      if (found.length === 1) {
        const attrCode = found[0].toUpperCase().replace(/ /g,"_");
        const m = lore.match(new RegExp(found[0] + " ([IVX]+)"));
        const tier = m ? m[1] : "";
        result.filterID = `${prefix}${attrCode}_${tier}`;
        return result;
      }
    }
  }

  // H) Attribute Shards I–V
  if (bin && name.includes("Attribute Shard")) {
    const shardAttrs = [
      "Arachno Resistance","Blazing Resistance","Breeze","Dominance","Ender Resistance",
      "Experience","Fortitude","Life Regeneration","Lifeline","Magic Find",
      "Mana Pool","Mana Regeneration","Vitality"
    ];
    for (const attr of shardAttrs) {
      for (const tier of ["I","II","III","IV","V"]) {
        if (lore.includes(`${attr} ${tier}`)) {
          result.filterID = `ATTRIBUTE_SHARD_${attr.toUpperCase().replace(/ /g,"_")}_${tier}`;
          return result;
        }
      }
    }
  }

  return null;
}

// 3) Abbreviations for any attribute word or phrase (for COFL keys)
const ATTR_ABBR = {
  ATTACK_SPEED:        "AS",
  BLAZING:             "BR",
  COMBO:               "CB",
  DOMINANCE:           "DOM",
  EXPERIENCE:          "EXP",
  FORTITUDE:           "FT",
  LIFE_REGENERATION:   "LR",
  LIFELINE:            "LL",
  MAGIC_FIND:          "MF",
  MANA_POOL:           "MP",
  MANA_REGENERATION:   "MR",
  SPEED:               "SP",
  VETERAN:             "VET",
  VITALITY:            "VIT"
};

// 4) Which sets to remap in COFL data
const KUUDRA_SETS = ["AURORA","CRIMSON","TERROR","MOLTEN"];

/**
 * Remap long-key COFL map → short-key map
 */
function remapGodRoles(raw) {
  const out = {};
  for (const [longKey, val] of Object.entries(raw)) {
    const parts = longKey.split("_");
    const set   = parts[0];
    const piece = parts[1];
    const attrs = parts.slice(2);

    // leave non-Kuudra entries untouched
    if (!KUUDRA_SETS.includes(set)) {
      out[longKey] = val;
      continue;
    }

    // build codes array, handling two-word attrs
    const codes = [];
    for (let i = 0; i < attrs.length; i++) {
      if (i + 1 < attrs.length) {
        const joint = `${attrs[i]}_${attrs[i+1]}`;
        if (ATTR_ABBR[joint]) {
          codes.push(ATTR_ABBR[joint]);
          i++;
          continue;
        }
      }
      codes.push(ATTR_ABBR[attrs[i]] || attrs[i]);
    }

    // rejoin into your short form
    const shortKey = [set, piece, ...codes].join("_");
    out[shortKey] = val;
  }
  return out;
}

export default {
  // HTTP handler
  async fetch(req, env) {
    const C = {
      "Content-Type":              "application/json",
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"GET,OPTIONS",
      "Access-Control-Allow-Headers":"*",
      "Cache-Control":              "no-store, no-cache, must-revalidate, max-age=0"
    };
    if (req.method === "OPTIONS") {
      return new Response("", { headers: C });
    }
    const d = await env.PRICES_KV.get("latest");
    if (!d) {
      return new Response(JSON.stringify({ error: "not ready" }), {
        status: 503,
        headers: C
      });
    }
    return new Response(d, { headers: C });
  },

  // Cron handler
  async scheduled(evt, env) {
    try {
      const COFL    = "https://sky.coflnet.com/api/prices/neu";
      const BAZAAR  = "https://api.hypixel.net/v2/skyblock/bazaar";
      const ITEMS   = "https://api.hypixel.net/v2/resources/skyblock/items";
      const AUCTION = "https://api.hypixel.net/v2/skyblock/auctions?page=";

      // 1) Fetch COFL long-key JSON
      const coflData = await fetch(COFL).then(r => r.json());

      // 2) Remap COFL → short keys & seed `out`
      const coflShort = remapGodRoles(coflData);

      // 3) Fetch ITEMS for NPC sell prices & name→id
      const itemsR   = await fetch(ITEMS).then(r => r.json());
      const itemMeta = {}, nameToId = {};
      for (const it of itemsR.items) {
        itemMeta[it.id] = it.npc_sell_price || null;
        nameToId[it.name.trim().toUpperCase()] = it.id;
      }

      // seed `out` with COFL prices
      const out = {};
      for (const [id, price] of Object.entries(coflShort)) {
        out[id] = {
          Price: price,
          Extra: null,
          UUID: null,
          NPC_SELL_PRICE: itemMeta[id] || null
        };
      }

      // 4) Fetch Bazaar
      const bazR = await fetch(BAZAAR).then(r => r.json());

      // 5) Fetch up to 40 pages of auctions
      const firstPg   = await fetch(AUCTION + "0").then(r => r.json());
      const total     = firstPg.totalPages || 1;
      const MAX_PAGES = 40;
      const pages     = [ firstPg ];
      for (let i = 1; i < total && i < MAX_PAGES; i++) {
        pages.push(await fetch(AUCTION + i).then(r => r.json()));
      }

      // 6) Merge auctions via filters()
      for (const pg of pages) {
        for (const a of pg.auctions) {
          if (!a.bin) continue;
          const f = filters(a);
          if (!f?.filterID) continue;
          const p  = a.starting_bid;
          const id = f.filterID;
          if (!out[id] || p < out[id].Price) {
            out[id] = {
              Price: p,
              Extra: f.extra,
              UUID: f.isPet ? a.uuid : null,
              NPC_SELL_PRICE: itemMeta[id] || null
            };
          }
        }
      }

      // 7) Bazaar fallback
      for (const [id, prod] of Object.entries(bazR.products)) {
        if (out[id]) continue;
        const bp = prod.quick_status?.buyPrice || 0;
        if (bp > 0) {
          out[id] = {
            Price: bp,
            Extra: null,
            UUID: null,
            NPC_SELL_PRICE: itemMeta[id] || null
          };
        }
      }

      // 8) Write to KV
      await env.PRICES_KV.put("latest", JSON.stringify(out, null, 2));
      console.log("Scheduled: prices updated");
    } catch (err) {
      console.error("ERROR in scheduled():", err);
    }
  }
};
