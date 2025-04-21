const fs = require('fs');
const fetch = require('node-fetch');

async function generateMoneyHour() {
    try {
        const response = await fetch('https://moulberry.codes/lowestbin.json');
        const prices = await response.json();

        const moneyHour = {
            "blaze-wax": ((prices["BLAZE_WAX"]?.price || 1) / 1000000).toFixed(2) + "M",
            "sulphur-bow": ((prices["SULPHUR_BOW"]?.price || 1) / 1000000).toFixed(2) + "M",
            "ancient-cloak": ((prices["ANCIENT_CLOAK"]?.price || 1) / 1000000).toFixed(2) + "M",
            "fire-freeze": ((prices["FIRE_FREEZE_STAFF"]?.price || 1) / 1000000).toFixed(2) + "M",
            "mooshroom-cow": ((prices["MOOSHROOM_COW;3"]?.price || 1) / 1000000).toFixed(2) + "M"
        };

        fs.writeFileSync('moneyHour.json', JSON.stringify(moneyHour, null, 2));
        console.log('moneyHour.json generated!');
    } catch (error) {
        console.error('Failed to generate moneyHour.json', error);
    }
}

generateMoneyHour();
