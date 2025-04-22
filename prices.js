const coflAPI = "https://sky.coflnet.com/api/prices/neu";
const neuAPI = "https://moulberry.codes/lowestbin.json";
const hypixelAPI = "https://api.hypixel.net/v2/skyblock/auctions?page=";
const bazaarAPI = "https://api.hypixel.net/v2/skyblock/bazaar";

//Filters for auction items that are needed and not provided within cofl or neu.
function filters(item, auction) {

    const petTypes = [
        "Combat Pet",
        "Mining Pet",
        "Farming Pet",
        "Foraging Pet",
        "Fishing Pet",
        "Enchanting Pet",
        "Alchemy Pet",
    ];
    const baseAttributes = [
        "Arachno Resistance",
        "Blazing Resistance",
        "Breeze",
        "Dominance",
        "Ender Resistance",
        "§bExperience",
        "Fortitude",
        "Life Regeneration",
        "Lifeline",
        "Magic Find",
        "Mana Pool",
        "Mana Regeneration",
        "Vitality",
        "§bSpeed",
        "Undead Resistance",
        "Veteran",
        "Arachno",
        "Attack Speed",
        "Blazing",
        "Combo",
        "Elite",
        "Ender",
        "Ignition",
        "Life Recovery",
        "Mana Steal",
        "Midas Touch",
        "Undead",
        "Warrior",
        "Deadeye",
        "Blazing Fortune",
        "Fishing Experience",
        "Infection",
        "Double Hook",
        "Fisherman",
        "Fishing Speed",
        "§bHunter",
        "Trophy Hunter"

    ];
    const romanNumerals = ["I\n", "II\n", "III\n", "IV\n", "V\n"];
    const attributes = baseAttributes.flatMap(attr => romanNumerals.map(tier => `${attr} ${tier}`));
    let auctionName = auction.item_name.toString();
    let auctionLore = auction.item_lore.toString();
    let auctionBin = auction.bin;
    let name = "";
    let result = { filterID: "null", filterID2: "null", extra: "null" };

    //Gets Golden Dragon prices for level 100 to 200
    if (
        auctionName.includes("Golden Dragon") &&
        !auctionName.includes("✦") &&
        auctionBin
    ) {
        for (let level = 100; level <= 200; level++) {
            if (auctionName.includes(level.toString())) {
                result.filterID = auctionName.toUpperCase();

                return result;
            }
        }
    }

    //Gets all legendary pet prices for lvl 1 to 100
    if (
        auctionLore.includes("Pet") &&
        auctionLore.includes("LEGENDARY") &&
        !auctionName.includes("Golden Dragon") &&
        !auctionName.includes("✦") &&
        !auctionLore.includes("Tier Boost") &&
        auctionBin
    ) {
        const petType = petTypes.find((type) => auctionLore.includes(type));

        if (petType) {
            for (let level = 1; level <= 100; level++) {
                if (auctionName.includes(level.toString())) {
                    result.filterID = auctionName.toUpperCase();
                    result.extra = petType;

                    return result;
                }
            }
        }
    }

    //Gets final destination at 10k kills
    if (
        auctionName.includes("Final Destination") &&
        auctionLore.includes("Next Upgrade: §a+335❈") &&
        auctionBin
    ) {
        if (auctionName.includes("Helmet")) {
            auctionName = "FINAL_DESTINATION_HELMET_10K";
        } else if (auctionName.includes("Chestplate")) {
            auctionName = "FINAL_DESTINATION_CHESTPLATE_10K";
        } else if (auctionName.includes("Leggings")) {
            auctionName = "FINAL_DESTINATION_LEGGINGS_10K";
        } else if (auctionName.includes("Boots")) {
            auctionName = "FINAL_DESTINATION_BOOTS_10K";
        }

        result.filterID = auctionName.toUpperCase();

        return result;
    }

    //Gets Reaper Scythe with full M3 tank zombies
    if (
        auctionName.includes("Reaper Scythe") &&
        (auctionLore.split("§cTank Zombie §7Lv80").length - 1 === 10) &&
        auctionBin
      ) {
        result.filterID = "REAPER_SCYTHE_M3";

        return result;
    }


    if (
        auctionName.includes("Scarf's Studies") && auctionBin
    ) {
        result.filterID = "SCARF_STUDIES";

        return result;
    }

    if (
        auctionName.includes("Lucky Hoof") && auctionBin
    ) {
        result.filterID = "LUCKY_HOOF";

        return result;
    }

    if (
        auctionName.includes("Water Hydra Head") && auctionBin
    ) {
        result.filterID = "WATER_HYDRA_HEAD";

        return result;
    }

    if (
        auctionName.includes("Tarantula Talisman") && auctionBin
    ) {
        result.filterID = "TARANTULA_TALISMAN";

        return result;
    }

    if (
        auctionName.includes("Fire Freeze Staff") && auctionBin
    ) {
        result.filterID = "FIRE_FREEZE_STAFF";

        return result;
    }

    if (
        auctionName.includes("Chumming Talisman") && auctionBin
    ) {
        result.filterID = "CHUMMING_TALISMAN";

        return result;
    }


    //Gets Glowstone Gauntlets with godroll attributes
    if (auctionName.includes("Glowstone Gauntlet") && auctionBin) {
        if (
            auctionLore.includes("Veteran X") &&
            auctionLore.includes("Vitality X")
        ) {
            result.filterID = "GLOWSTONE_GAUNTLET_VETERAN_X_VITALITY_X";

            return result;
        } else if (
            auctionLore.includes("Mana Pool X") &&
            auctionLore.includes("Mana Regeneration X")
        ) {
            result.filterID = "GLOWSTONE_GAUNTLET_MANA_POOL_X_MANA_REGENERATION_X";

            return result;
        } else if (
            auctionLore.includes("Dominance X") &&
            auctionLore.includes("Speed X")
        ) {
            result.filterID = "GLOWSTONE_GAUNTLET_DOMINANCE_X_SPEED_X";

            return result;
        }
    }

    //Gets Magma Necklace with godroll attributes
    if (auctionName.includes("Magma Necklace") && auctionBin) {
        if (
            auctionLore.includes("Veteran V\n") &&
            auctionLore.includes("Vitality V\n")
        ) {
            result.filterID = "MAGMA_NECKLACE_VETERAN_V_VITALITY_V";

            return result;
        } else if (
            auctionLore.includes("Mana Pool V\n") &&
            auctionLore.includes("Mana Regeneration V\n")
        ) {
            result.filterID = "MAGMA_NECKLACE_MANA_POOL_V_MANA_REGENERATION_V";

            return result;
        } else if (
            auctionLore.includes("Dominance V\n") &&
            auctionLore.includes("Speed V\n")
        ) {
            result.filterID = "MAGMA_NECKLACE_DOMINANCE_V_SPEED_V";

            return result;
        } else if (
            auctionLore.includes("Mana Pool I\n") &&
            auctionLore.includes("Mana Regeneration I\n")
        ) {
            result.filterID = "MAGMA_NECKLACE_MP_MR";

            return result;
        } else if (
            auctionLore.includes("Vitality I\n") &&
            auctionLore.includes("Veteran I\n")
        ) {
            result.filterID = "MAGMA_NECKLACE_VIT_VET";

            return result;
        }
        
    }

    //Gets Blaze Belt with godroll attributes
    if (auctionName.includes("Blaze Belt") && auctionBin) {
        if (
            auctionLore.includes("Veteran V\n") &&
            auctionLore.includes("Vitality V\n")
        ) {
            result.filterID = "BLAZE_BELT_VETERAN_V_VITALITY_V";

            return result;
        } else if (
            auctionLore.includes("Lifeline V\n") &&
            auctionLore.includes("Mana Pool V\n")
        ) {
            result.filterID = "BLAZE_BELT_LIFELINE_V_MANA_POOL_V";

            return result;
        } else if (
            auctionLore.includes("Dominance V\n") &&
            auctionLore.includes("Speed V\n")
        ) {
            result.filterID = "BLAZE_BELT_DOMINANCE_V_SPEED_V";

            return result;
        } else if (
            auctionLore.includes("Vitality I\n") &&
            auctionLore.includes("Veteran I\n")
        ) {
            result.filterID = "BLAZE_BELT_VIT_VET";

            return result;
        }
    }

    //Gets Ghast Cloak with godroll attributes
    if (auctionName.includes("Ghast Cloak") && auctionBin) {
        if (
            auctionLore.includes("Veteran V\n") &&
            auctionLore.includes("Vitality V\n")
        ) {
            result.filterID = "GHAST_CLOAK_VETERAN_V_VITALITY_V";

            return result;
        } else if (
            auctionLore.includes("Mana Pool V\n") &&
            auctionLore.includes("Mana Regeneration V\n")
        ) {
            result.filterID = "GHAST_CLOAK_MANA_POOL_V_MANA_REGENERATION_V";

            return result;
        } else if (
            auctionLore.includes("Mana Pool I\n") &&
            auctionLore.includes("Mana Regeneration I\n")
        ) {
            result.filterID = "GHAST_CLOAK_MP_MR";

            return result;
        } else if (
            auctionLore.includes("Vitality I\n") &&
            auctionLore.includes("Veteran I\n")
        ) {
            result.filterID = "GHAST_CLOAK_VIT_VET";

            return result;
        }
    }

    //Gets Implosion Belt with godroll attributes
    if (auctionName.includes("Implosion Belt") && auctionBin) {
        if (
            auctionLore.includes("Mana Pool V\n") &&
            auctionLore.includes("Mana Regeneration V\n")
        ) {
            result.filterID = "IMPLOSION_BELT_MANA_POOL_V_MANA_REGENERATION_V";

            return result;
        } else if (
            auctionLore.includes("Dominance V\n") &&
            auctionLore.includes("Speed V\n")
        ) {
            result.filterID = "IMPLOSION_BELT_DOMINANCE_V_SPEED_V";

            return result;
        } else if (
            auctionLore.includes("Mana Pool I\n") &&
            auctionLore.includes("Mana Regeneration I\n")
        ) {
            result.filterID = "IMPLOSION_BELT_MP_MR";

            return result;
        }
    }

    //Gets Magma Rod with godroll attributes
    if (auctionName.includes("Magma Rod") && auctionBin) {
        if (
            auctionLore.includes("Trophy Hunter X\n") &&
            auctionLore.includes("Fisherman X\n")
        ) {
            result.filterID = "MAGMA_ROD_TROPHY_HUNTER_X_FISHERMAN_X";

            return result;
        } else if (
            auctionLore.includes("Double Hook X\n") &&
            auctionLore.includes("Fishing Speed X\n")
        ) {
            result.filterID = "MAGMA_ROD_DOUBLE_HOOK_X_FISHING_SPEED_X";

            return result;
        }
    }


    //Kuudra items
    if (auctionName.includes("Fervor") && auctionBin) {
        if (auctionName.includes("Helmet")) {
            name = "FERVOR_HELMET_";
        } else
            if (auctionName.includes("Chestplate")) {
                name = "FERVOR_CHESTPLATE_";
            } else
                if (auctionName.includes("Leggings")) {
                    name = "FERVOR_LEGGINGS_";
                }
        if (auctionName.includes("Boots")) {
            name = "FERVOR_BOOTS_";
        }

        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes[0];
        result.filterID2 = name + formattedAttributes[1];

        return result;
    }

    if (auctionName.includes("Aurora") && auctionBin) {
        if (auctionName.includes("Helmet")) {
            name = "AURORA_HELMET_";
        } else
            if (auctionName.includes("Chestplate")) {
                name = "AURORA_CHESTPLATE_";
            } else
                if (auctionName.includes("Leggings")) {
                    name = "AURORA_LEGGINGS_";
                }
        if (auctionName.includes("Boots")) {
            name = "AURORA_BOOTS_";
        }

        //Exemples for outcro :D
        if (auctionLore.includes("Mana Pool") && auctionLore.includes("Mana Regeneration")) {
            result.filterID = name + "MP_MR";
            return result;
        }
        if (auctionLore.includes("Mana Pool") && auctionLore.includes("Veteran")) {
            result.filterID = name + "MP_VET";
            return result;
        }
        if (auctionLore.includes("Mana Pool") && auctionLore.includes("Breeze")) {
            result.filterID = name + "MP_BR";
            return result;
        }
        
        
        
        

        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes[0];
        result.filterID2 = name + formattedAttributes[1];

        return result;
    }

    if (auctionName.includes("Terror") && auctionBin) {
        if (auctionName.includes("Helmet")) {
            name = "TERROR_HELMET_";
        } else
            if (auctionName.includes("Chestplate")) {
                name = "TERROR_CHESTPLATE_";
            } else
                if (auctionName.includes("Leggings")) {
                    name = "TERROR_LEGGINGS_";
                }
        if (auctionName.includes("Boots")) {
            name = "TERROR_BOOTS_";
        }
        if (auctionLore.includes("Lifeline") && auctionLore.includes("Mana Pool")) {
            result.filterID = name + "LL_MP";
            return result;
        }
        if (auctionLore.includes("Dominance") && auctionLore.includes("Vitality")) {
            result.filterID = name + "DOM_VIT";
            return result;
        }
        if (auctionLore.includes("Dominance") && auctionLore.includes("Mana Pool")) {
            result.filterID = name + "DOM_MP";
            return result;
        }

        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes[0];
        result.filterID2 = name + formattedAttributes[1];

        return result;
    }

    if (auctionName.includes("Crimson") && auctionBin) {
        if (auctionName.includes("Helmet")) {
            name = "CRIMSON_HELMET_";
        } else
            if (auctionName.includes("Chestplate")) {
                name = "CRIMSON_CHESTPLATE_";
            } else
                if (auctionName.includes("Leggings")) {
                    name = "CRIMSON_LEGGINGS_";
                }
        if (auctionName.includes("Boots")) {
            name = "CRIMSON_BOOTS_";
        }
        if (auctionLore.includes("Magic Find") && auctionLore.includes("Veteran")) {
            result.filterID = name + "MF_VET";
            return result;
        }
        if (auctionLore.includes("Vitality") && auctionLore.includes("Veteran")) {
            result.filterID = name + "VIT_VET";
            return result;
        }
        if (auctionLore.includes("Magic Find") && auctionLore.includes("Vitality")) {
            result.filterID = name + "MF_VIT";
            return result;
        }
        if (auctionLore.includes("Mana Pool") && auctionLore.includes("Veteran")) {
            result.filterID = name + "MP_VET";
            return result;
        }

        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes[0];
        result.filterID2 = name + formattedAttributes[1];

        return result;
    }

    if (auctionName.includes("Hollow") && auctionBin) {
        if (auctionName.includes("Helmet")) {
            name = "HOLLOW_HELMET_";
        } else
            if (auctionName.includes("Chestplate")) {
                name = "HOLLOW_CHESTPLATE_";
            } else
                if (auctionName.includes("Leggings")) {
                    name = "HOLLOW_LEGGINGS_";
                }
        if (auctionName.includes("Boots")) {
            name = "HOLLOW_BOOTS_";
        }

        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes[0];
        result.filterID2 = name + formattedAttributes[1];

        return result;
    }

    if (auctionName.includes("Molten") && auctionBin) {

        if (auctionName.includes("Belt")) {
            name = "MOLTEN_BELT_";
        } else if (auctionName.includes("Cloak")) {
            name = "MOLTEN_CLOAK_";
        } else if (auctionName.includes("Bracelet")) {
            name = "MOLTEN_BRACELET_";
        } else if (auctionName.includes("Necklace")) {
            name = "MOLTEN_NECKLACE_";
        }
        if (auctionLore.includes("Lifeline") && auctionLore.includes("Mana Pool")) {
            result.filterID = name + "LL_MP";
            return result;
        }
        if (auctionLore.includes("Magic Find") && auctionLore.includes("Veteran")) {
            result.filterID = name + "MF_VET";
            return result;
        }
        if (auctionLore.includes("Mana Pool") && auctionLore.includes("Mana Regeneration")) {
            result.filterID = name + "MP_MR";
            return result;
        }
        if (auctionLore.includes("Magic Find") && auctionLore.includes("Vitality")) {
            result.filterID = name + "MF_VIT";
            return result;
        }
        if (auctionLore.includes("Mana Pool") && auctionLore.includes("Veteran")) {
            result.filterID = name + "MP_VET";
            return result;
        }
        if (auctionLore.includes("Dominance") && auctionLore.includes("Mana Pool")) {
            result.filterID = name + "DOM_MP";
            return result;
        }
        if (auctionLore.includes("Mana Pool") && auctionLore.includes("Vitality")) {
            result.filterID = name + "MP_VIT";
            return result;
        }
        if (auctionLore.includes("Breeze") && auctionLore.includes("Veteran")) {
            result.filterID = name + "BR_VET";
            return result;
        }
        if (auctionLore.includes("Mana Regeneration") && auctionLore.includes("Veteran")) {
            result.filterID = name + "MR_VET";
            return result;
        }

        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes[0];
        result.filterID2 = name + formattedAttributes[1];

        return result;
    }

    if (auctionName.includes("Magma Lord") && auctionBin) {

        if (auctionName.includes("Helmet")) {
            name = "MAGMA_LORD_HELMET_";
        } else if (auctionName.includes("Chestplate")) {
            name = "MAGMA_LORD_CHESTPLATE_";
        } else if (auctionName.includes("Leggings")) {
            name = "MAGMA_LORD_LEGGINGS_";
        } else if (auctionName.includes("Boots")) {
            name = "MAGMA_LORD_BOOTS_";
        }
        if (auctionLore.includes("bMagic Find") && auctionLore.includes("bBlazing Fortune")) {
            result.filterID = name + "MF_BF";
            return result;
        }
        if (auctionLore.includes("bMagic Find") && auctionLore.includes("bFishing Experience")) {
            result.filterID = name + "MF_FE";
            return result;
        }
        if (auctionLore.includes("bFishing Experience") && auctionLore.includes("bBlazing Fortune")) {
            result.filterID = name + "MF_FE";
            return result;
        }

        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes[0];
        result.filterID2 = name + formattedAttributes[1];

        return result;
    }

    if (auctionName.includes("Lava Shell Necklace") && auctionBin) {

        if (auctionName.includes("Lava Shell Necklace")) {
            name = "LAVA_SHELL_NECKLACE_";
        } 
        
        if (auctionLore.includes("bLifeline") && auctionLore.includes("bMana Pool")) {
            result.filterID = name + "LL_MP";
            return result;
        }

        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes[0];
        result.filterID2 = name + formattedAttributes[1];

        return result;
    }

    if (auctionName.includes("Attribute Shard") && auctionBin) {


        name = "ATTRIBUTE_SHARD_";


        const foundAttributes = attributes.filter(attr => auctionLore.includes(attr));

        const formattedAttributes = foundAttributes.map(attr =>
            attr.toUpperCase().replace(/\s+/g, "_")
        );

        result.filterID = name + formattedAttributes;
        return result;
    }




    return false;
}

//Function for filtering neu and hypixel data. (This is because we only need a few items from each since cofl is used for the rest)
async function filterData(API, data, extra) {
    if (API === neuAPI) {
        let filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => key.includes("ATTRIBUTE"))
        );

        return filteredData;
    } else if (API === bazaarAPI) {
       // Create an object to hold all bazaar items
    let filteredData = {};

    // Loop over every product in the Bazaar API response
    for (const [productName, productData] of Object.entries(data.products)) {
        // For consistency with the rest of your code, store buyPrice (or 0 if it’s missing)
        filteredData[productName] = productData.quick_status?.buyPrice || 0;
    }

    return filteredData;

        return filteredData;
    } else if (API === hypixelAPI) {
        let filteredData = {};

        for (const [item, auction] of Object.entries(data)) {
            const result = filters(item, auction);
            let additionalValue = 0;

            if (auction.item_name.includes("Golden Dragon") && !auction.item_name.includes("200")) {

                if (!auction.item_lore.includes("Combat Exp Boost\n§7Gives §a+50% §7pet exp for Combat")) {
                    additionalValue = extra["PET_ITEM_COMBAT_SKILL_BOOST_EPIC"].Price;
                }
                
                if (
                    !filteredData[result.filterID] ||
                    auction.starting_bid < filteredData[result.filterID].Price
                ) {
                    filteredData[result.filterID] = {
                        Price: auction.starting_bid,
                        Extra:  result.extra,
                        UUID:   auction.uuid,
                        lore:   auction.item_lore.toString()
                      };                      
                }

            } else if (result && result.filterID) {
                if (
                    !filteredData[result.filterID] ||
                    auction.starting_bid < filteredData[result.filterID].Price
                ) {
                    filteredData[result.filterID] = {
                        Price: auction.starting_bid,
                        Extra: result.extra,
                        UUID: auction.uuid,
                    };
                }

                if (result && result.filterID2) {
                    if (
                        !filteredData[result.filterID2] ||
                        auction.starting_bid < filteredData[result.filterID2].Price
                    ) {
                        filteredData[result.filterID2] = {
                            Price: auction.starting_bid,
                            Extra: result.extra,
                            UUID: auction.uuid,
                        };
                    }


                }
            }
        }

        return filteredData;
    }
}

//Function to format data for neu and cofl.
async function formatData(API, data) {
    if (API === neuAPI || API === coflAPI || API === bazaarAPI) {
        let formattedData = [];

        Object.entries(data).forEach(([item, price]) => {
            formattedData[item] = {
                Price: price,
                Extra: "null",
                UUID: "null",
            };
        });

        return formattedData;
    }
}

//Function to combine all of the data.
async function combineData(coflData, neuData, hypixelData, bazaarData) {
    let combinedData = { ...coflData, ...neuData, ...hypixelData, ...bazaarData };

    return combinedData;
}

//Function for fetching and formatting cofl data.
async function fetchCofl() {
    let data = await fetchData(coflAPI);
    let formattedData = await formatData(coflAPI, data);

    return formattedData;
}

//Function for fetching, filtering and formatting neu data.
async function fetchNeu() {
    let data = await fetchData(neuAPI);
    let filteredData = await filterData(neuAPI, data);
    let formattedData = await formatData(neuAPI, filteredData);

    return formattedData;
}

//Function for fetching and filtering hypixel data. (Hypixel data gets formatted in it's filtering because I couldn't be bothered, may fix this eventually)
async function fetchHypixel(extra) {
    let data = await fetchData(hypixelAPI);
    let filteredData = await filterData(hypixelAPI, data, extra);

    return filteredData;
}

async function fetchBazaar() {
    let data = await fetchData(bazaarAPI);
    let filteredData = await filterData(bazaarAPI, data);
    let formattedData = await formatData(bazaarAPI, filteredData);

    return formattedData;
}

//Function made to fetch data based on the API provided.
async function fetchData(API) {
    if (API === coflAPI || API === bazaarAPI) {
        const response = await fetch(API);

        return await response.json();
    } else if (API === neuAPI) {
        const response = await fetch("https://corsproxy.io/?" + API);

        return await response.json();
    } else {
        const { totalPages } = await (await fetch(API + 0)).json();

        const allPagesData = await Promise.all(
            Array.from({ length: totalPages }, (_, i) =>
                fetch(API + i).then((res) => res.json())
            )
        );

        return allPagesData.flatMap((pageData) => pageData.auctions);
    }
}

//Main function of the code.
export async function main() {
    let cofl = await fetchCofl();
    //let neu = await fetchNeu();
    let hypixel = await fetchHypixel(cofl);
    let bazaar = await fetchBazaar();

    let combinedData = await combineData(cofl, hypixel, bazaar);

    if (localStorage.getItem("prices")) {
        localStorage.removeItem("prices");
    }
    console.log("Loading Prices...");
    localStorage.setItem("prices", JSON.stringify(combinedData));
}


export async function fetchCofl()   { return fetch(coflAPI).then(r=>r.json()) }
export async function fetchNeu()    { return fetch(neuAPI).then(r=>r.json()) }
export async function fetchBazaar() { return fetch(bazaarAPI).then(r=>r.json()) }
export function combineData(a,b,c) { /* your existing logic */ }

//Running the code.
main();