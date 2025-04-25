// worker.js

// 1) Utility to strip newlines & color codes
function normalizeLore(rawLore) {
  return rawLore
    .replace(/\r?\n/g, " ")
    .replace(/§[0-9A-FK-OR]/gi, "");
}

// 2) The meat: filter logic for god-rolls, pets, runes, Kuudra & shards
function filters(auction) {
  const name    = auction.item_name.toString();
  const rawLore = auction.item_lore.toString();
  const lore    = normalizeLore(rawLore);
  const bin     = auction.bin;
  let result    = { filterID: null, filterID2: null, extra: null, isPet: false };

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
    // detect rarity
    const rarities = ["COMMON","UNCOMMON","RARE","EPIC","LEGENDARY"];
    for (let i = 0; i < rarities.length; i++) {
      if (lore.includes(rarities[i])) {
        if (rarities[i] === "LEGENDARY") {
          // full legendary name (spaces kept)
          result.isPet    = true;
          result.extra    = null;
          result.filterID = name.toUpperCase();
        } else {
          // rarity bucket ;0–3
          const idx  = i; 
          const base = name
            .replace(/^\[.*?\]\s*/, "")  // strip “[Lvl X] ”
            .replace(/\s+/g, "_")        // spaces → underscores
            .toUpperCase();
          result.isPet    = true;
          result.extra    = null;
          result.filterID = `${base};${idx}`;
        }
        return result;
      }
    }
  }

  // C) Runes from cofl – simple name → underscore → uppercase
  if (bin && name.toUpperCase().includes("RUNE")) {
    result.filterID = name
      .replace(/\s+/g, "_")
      .toUpperCase();
    return result;
  }

  // D) Final Destination @10K
  if (name.includes("Final Destination") && lore.includes("Next Upgrade: +335❈") && bin) {
    let id = null;
    if      (name.includes("Helmet"))      id = "FINAL_DESTINATION_HELMET_10K";
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
      (lore.match(/Tank Zombie Lv80/g)||[]).length === 10 &&
      bin) {
    result.filterID = "REAPER_SCYTHE_M3";
    return result;
  }

  // F) Specific named items
  const SPECIFIC = {
    "Scarf's Studies":   "SCARF_STUDIES",
    "Lucky Hoof":        "LUCKY_HOOF",
    "Water Hydra Head":  "WATER_HYDRA_HEAD",
    "Tarantula Talisman":"TARANTULA_TALISMAN",
    "Fire Freeze Staff": "FIRE_FREEZE_STAFF",
    "Chumming Talisman": "CHUMMING_TALISMAN"
  };
  for (const [kw,id] of Object.entries(SPECIFIC)) {
    if (name.includes(kw) && bin) {
      result.filterID = id;
      return result;
    }
  }

  // G) God-rolls & Kuudra (first two attrs)
  if (bin) {
    // helper
    function check(key, mustInclude=[]) {
      if (mustInclude.every(m => lore.includes(m))) {
        result.filterID = key;
        return true;
      }
      return false;
    }
    // glowstone
    if (name.includes("Glowstone Gauntlet") &&
        ( check("GLOWSTONE_GAUNTLET_VETERAN_X_VITALITY_X", ["Veteran X","Vitality X"]) ||
          check("GLOWSTONE_GAUNTLET_MANA_POOL_X_MANA_REGENERATION_X", ["Mana Pool X","Mana Regeneration X"]) ||
          check("GLOWSTONE_GAUNTLET_DOMINANCE_X_SPEED_X", ["Dominance X","Speed X"]) )) {
      return result;
    }
    // magma necklace
    if (name.includes("Magma Necklace") &&
        ( check("MAGMA_NECKLACE_VETERAN_V_VITALITY_V", ["Veteran V","Vitality V"]) ||
          check("MAGMA_NECKLACE_MANA_POOL_V_MANA_REGENERATION_V", ["Mana Pool V","Mana Regeneration V"]) ||
          check("MAGMA_NECKLACE_DOMINANCE_V_SPEED_V", ["Dominance V","Speed V"]) ||
          check("MAGMA_NECKLACE_MP_MR", ["Mana Pool I","Mana Regeneration I"]) ||
          check("MAGMA_NECKLACE_VIT_VET", ["Vitality I","Veteran I"]) )) {
      return result;
    }
    // blaze belt
    if (name.includes("Blaze Belt") &&
        ( check("BLAZE_BELT_VETERAN_V_VITALITY_V", ["Veteran V","Vitality V"]) ||
          check("BLAZE_BELT_LIFELINE_V_MANA_POOL_V", ["Lifeline V","Mana Pool V"]) ||
          check("BLAZE_BELT_DOMINANCE_V_SPEED_V", ["Dominance V","Speed V"]) ||
          check("BLAZE_BELT_VIT_VET", ["Vitality I","Veteran I"]) )) {
      return result;
    }
    // ghast cloak
    if (name.includes("Ghast Cloak") &&
        ( check("GHAST_CLOAK_VETERAN_V_VITALITY_V", ["Veteran V","Vitality V"]) ||
          check("GHAST_CLOAK_MANA_POOL_V_MANA_REGENERATION_V", ["Mana Pool V","Mana Regeneration V"]) ||
          check("GHAST_CLOAK_MP_MR", ["Mana Pool I","Mana Regeneration I"]) ||
          check("GHAST_CLOAK_VIT_VET", ["Vitality I","Veteran I"]) )) {
      return result;
    }
    // implosion belt
    if (name.includes("Implosion Belt") &&
        ( check("IMPLOSION_BELT_MANA_POOL_V_MANA_REGENERATION_V", ["Mana Pool V","Mana Regeneration V"]) ||
          check("IMPLOSION_BELT_DOMINANCE_V_SPEED_V", ["Dominance V","Speed V"]) ||
          check("IMPLOSION_BELT_MP_MR", ["Mana Pool I","Mana Regeneration I"]) )) {
      return result;
    }
    // magma rod
    if (name.includes("Magma Rod") &&
        ( check("MAGMA_ROD_TROPHY_HUNTER_X_FISHERMAN_X", ["Trophy Hunter X","Fisherman X"]) ||
          check("MAGMA_ROD_DOUBLE_HOOK_X_FISHING_SPEED_X", ["Double Hook X","Fishing Speed X"]) )) {
      return result;
    }
    // Kuudra sets
    const sets=["Fervor","Aurora","Terror","Crimson","Hollow","Molten","Magma Lord","Lava Shell Necklace"];
    for (const set of sets) {
      if (name.includes(set)) {
        let prefix=set.toUpperCase().replace(/ /g,"_")+"_";
        if      (name.includes("Helmet"))     prefix+="HELMET_";
        else if (name.includes("Chestplate")) prefix+="CHESTPLATE_";
        else if (name.includes("Leggings"))   prefix+="LEGGINGS_";
        else if (name.includes("Boots"))      prefix+="BOOTS_";
        const attrs=["Attack Speed","Blazing","Combo","Dominance","Experience","Fortitude",
                     "Life Regeneration","Lifeline","Magic Find","Mana Pool","Mana Regeneration",
                     "Speed","Veteran"];
        const two = attrs.filter(a=>lore.includes(a)).slice(0,2)
                         .map(a=>a.toUpperCase().replace(/ /g,"_"));
        if (two.length) {
          result.filterID = prefix+two.join("_");
          return result;
        }
      }
    }
  }

  // H) Attribute Shards I–V
  if (bin && name.includes("Attribute Shard")) {
    const shardAttrs=["Arachno Resistance","Blazing Resistance","Breeze","Dominance","Ender Resistance",
                      "Experience","Fortitude","Life Regeneration","Lifeline","Magic Find",
                      "Mana Pool","Mana Regeneration","Vitality"];
    for (const attr of shardAttrs) {
      for (const tier of ["I","II","III","IV","V"]) {
        if (lore.includes(`${attr} ${tier}`)) {
          result.filterID=`ATTRIBUTE_SHARD_${attr.toUpperCase().replace(/ /g,"_")}_${tier}`;
          return result;
        }
      }
    }
  }

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
    if (req.method==="OPTIONS") return new Response("",{headers:C});
    const d = await env.PRICES_KV.get("latest");
    if (!d) return new Response(JSON.stringify({error:"not ready"}),{status:503,headers:C});
    return new Response(d,{headers:C});
  },

  // Cron handler
  async scheduled(evt, env) {
    const COFL    = "https://sky.coflnet.com/api/prices/neu";
    const BAZAAR  = "https://api.hypixel.net/v2/skyblock/bazaar";
    const ITEMS   = "https://api.hypixel.net/v2/resources/skyblock/items";
    const AUCTION = "https://api.hypixel.net/v2/skyblock/auctions?page=";

    // 1) fetch cofl
    const coflData = await fetch(COFL).then(r=>r.json());

    // 2) fetch bazaar & items
    const [bazR, itemsR] = await Promise.all([
      fetch(BAZAAR).then(r=>r.json()),
      fetch(ITEMS).then(r=>r.json())
    ]);

    // 3) build lookups
    const itemMeta={}, nameToId={};
    for (const it of itemsR.items) {
      itemMeta[it.id]=it.npc_sell_price||null;
      nameToId[it.name.trim().toUpperCase()]=it.id;
    }

    // 4) fetch ALL auction pages
    const firstPg = await fetch(AUCTION+"0").then(r=>r.json());
    const total   = firstPg.totalPages||1;
    const pages   = [firstPg];
    if (total>1) {
      const rest = await Promise.all(
        Array.from({length:total-1},(_,i)=>fetch(AUCTION+(i+1)).then(r=>r.json()))
      );
      pages.push(...rest);
    }

    // 5) merge – start with runes from cofl
    const out={};
    for (const [key,price] of Object.entries(coflData)) {
      if (key.toUpperCase().startsWith("RUNE_")) {
        const id = key.toUpperCase().replace(/ /g,"_");
        out[id]={
          Price:price,Extra:null,UUID:null,NPC_SELL_PRICE:itemMeta[id]||null
        };
      }
    }

    // 6) filtered & god-rolls & pets
    for (const pg of pages) for (const a of pg.auctions) {
      if (!a.bin) continue;
      const f = filters(a);
      if (!f||!f.filterID) continue;
      const p = a.starting_bid, id=f.filterID;
      if (!out[id]||p<out[id].Price) {
        out[id]={Price:p,Extra:f.extra,UUID:f.isPet?a.uuid:null,NPC_SELL_PRICE:itemMeta[id]||null};
      }
      if (f.filterID2) {
        const id2=f.filterID2;
        if (!out[id2]||p<out[id2].Price) {
          out[id2]={Price:p,Extra:f.extra,UUID:f.isPet?a.uuid:null,NPC_SELL_PRICE:itemMeta[id2]||null};
        }
      }
    }

    // 7) generic auction fallback (cheapest)
    for (const pg of pages) for (const a of pg.auctions) {
      if (!a.bin) continue;
      const nm=a.item_name.trim().toUpperCase();
      const id=nameToId[nm];
      if (!id) continue;
      const p=a.starting_bid;
      if (!out[id]||p<out[id].Price) {
        out[id]={Price:p,Extra:null,UUID:null,NPC_SELL_PRICE:itemMeta[id]||null};
      }
    }

    // 8) bazaar fallback
    for (const [id,prod] of Object.entries(bazR.products)) {
      if (out[id]) continue;
      const bp=prod.quick_status?.buyPrice||0;
      if (bp>0) out[id]={Price:bp,Extra:null,UUID:null,NPC_SELL_PRICE:itemMeta[id]||null};
    }

    // 9) write KV
    await env.PRICES_KV.put("latest",JSON.stringify(out,null,2));
  }
};
