const express = require('express');
const router = express.Router(),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    axios = require('axios'),
    sendpie = require('sendmail')({
        logger: {
            debug: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
        },
        silent: false
    }),
    fraclvl = require('./fracLvls.json'),
    buildsInfo = require('./buildsInfo.json'),
    priceObjs = [{
        "hi": 0,
        "lo": 0,
        "id": 24294,
        "lName": "Vial of Potent Blood",
        "sName": "t5blood",
        "pic": "https://render.guildwars2.com/file/99AAE49EABF9A2415940FDB83CA1CE5E6E256020/66949.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24295,
        "lName": "Vial of Powerful Blood",
        "sName": "t6blood",
        "pic": "https://render.guildwars2.com/file/1A930A6A7B5B01EAB4CB36E79014C12B500BF6B3/66950.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24341,
        "lName": "Large Bone",
        "sName": "t5bone",
        "pic": "https://render.guildwars2.com/file/13F077BA5D5C6324CFCB0A2E39050F24A441190B/66987.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24358,
        "lName": "Ancient Bone",
        "sName": "t6bone",
        "pic": "https://render.guildwars2.com/file/0EE45FBB1E1A004600E9BAA7097830B2DE08587D/66828.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24350,
        "lName": "Large Claw",
        "sName": "t5claw",
        "pic": "https://render.guildwars2.com/file/3A4D64F4CE2951F358DE0AFCEA6551050FB4B4A7/66420.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24351,
        "lName": "Vicious Claw",
        "sName": "t6claw",
        "pic": "https://render.guildwars2.com/file/043E2BBA270F381870F1B45E7C09C098CAFE3D14/66996.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24356,
        "lName": "Large Fang",
        "sName": "t5fang",
        "pic": "https://render.guildwars2.com/file/DED4F23E44430C2BE1C0D491145A4946FC7D7C6F/223793.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24357,
        "lName": "Vicious Fang",
        "sName": "t6fang",
        "pic": "https://render.guildwars2.com/file/F2050EE1A7A43EDCDCB1E971FDA608AD0566E4DA/66998.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24288,
        "lName": "Large Scale",
        "sName": "t5scale",
        "pic": "https://render.guildwars2.com/file/F94ECFFF0FA9C321C108DA34E777B27B0AC9D5F8/66944.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24289,
        "lName": "Armored Scale",
        "sName": "t6scale",
        "pic": "https://render.guildwars2.com/file/7061C82F4F9D0C585742F545C40A0F06BE0154DC/66527.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24299,
        "lName": "Intricate Totem",
        "sName": "t5totem",
        "pic": "https://render.guildwars2.com/file/4DBC299E4B036A0DD3119A0F06BACA147C03B5C7/66954.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24300,
        "lName": "Elaborate Totem",
        "sName": "t6totem",
        "pic": "https://render.guildwars2.com/file/C1ABF9082901FC3CEABC3138CBCCA1DAD5D41812/66955.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24282,
        "lName": "Potent Venom Sac",
        "sName": "t5venom",
        "pic": "https://render.guildwars2.com/file/EA6A4C91F561EC5667947AEFE4CA436D0631CBE3/66938.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24283,
        "lName": "Powerful Venom Sac",
        "sName": "t6venom",
        "pic": "https://render.guildwars2.com/file/543EC37900EA2A57E77FA891193A48D66AA224AB/66939.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24277,
        "lName": "Pile of Crystalline Dust",
        "sName": "t6dust",
        "pic": "https://render.guildwars2.com/file/080D00670558CD9E580D5662030394B2206E92A6/434537.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24324,
        "lName": "Destroyer Core",
        "sName": "cdestroyer",
        "pic": "https://render.guildwars2.com/file/D59CDF80A1C9C061ED729C78BAA5980DAC75BE4C/66975.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24325,
        "lName": "Destroyer Lodestone",
        "sName": "ldestroyer",
        "pic": "https://render.guildwars2.com/file/77BE2565DD345ADFEF3850A5B647FE50C144AAF8/66976.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24329,
        "lName": "Crystal Core",
        "sName": "ccrystal",
        "pic": "https://render.guildwars2.com/file/D75C7D66B6589636E00AA45B20EB061305B5C52B/66979.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24330,
        "lName": "Crystal Lodestone",
        "sName": "lcrystal",
        "pic": "https://render.guildwars2.com/file/C10553036839522AAB54425B431E391F76D878AC/66980.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24339,
        "lName": "Corrupted Core",
        "sName": "ccorrupted",
        "pic": "https://render.guildwars2.com/file/31E8DC797FD7369A2824AAB76D414350FFABED95/66985.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24340,
        "lName": "Corrupted Lodestone",
        "sName": "lcorrupted",
        "pic": "https://render.guildwars2.com/file/CCC31822DA0D7D930D067B17C958A5CB1F4A24A5/66986.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24334,
        "lName": "Pile of Vile Essence",
        "sName": "cessence",
        "pic": "https://render.guildwars2.com/file/B290F544094427265D049A21425C92F4A324C392/66981.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24335,
        "lName": "Pile of Putrid Essence",
        "sName": "lessence",
        "pic": "https://render.guildwars2.com/file/CBC82EA8093AE4F60F0752B179F7CD02DDF5CB33/223781.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24304,
        "lName": "Charged Core",
        "sName": "ccharged",
        "pic": "https://render.guildwars2.com/file/3903CB74F8D64657FFCCAADB934AF42DFB941E6C/66957.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24305,
        "lName": "Charged Lodestone",
        "sName": "lcharged",
        "pic": "https://render.guildwars2.com/file/02EFB1C5E11B2FF4B4AC25A84E2302D244C82AA3/66958.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24309,
        "lName": "Onyx Core",
        "sName": "conyx",
        "pic": "https://render.guildwars2.com/file/EDE00E4F3F3802F8064D7640A345ADA0E85D045C/66962.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24310,
        "lName": "Onyx Lodestone",
        "sName": "lonyx",
        "pic": "https://render.guildwars2.com/file/2232AA41E3DF20EB249C0B6D10BC0D37FF6C0E3D/66963.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24314,
        "lName": "Molten Core",
        "sName": "cmolten",
        "pic": "https://render.guildwars2.com/file/F23608C7DE13B2BC903D3F6EB9734B423E96A6CB/66967.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24315,
        "lName": "Molten Lodestone",
        "sName": "lmolten",
        "pic": "https://render.guildwars2.com/file/76910A3A41C33D0FF09EF3CBDA4B079706150FB9/66968.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24319,
        "lName": "Glacial Core",
        "sName": "cglacial",
        "pic": "https://render.guildwars2.com/file/7C5BF3B99647E2AB0E0F6C18B60CD5743D21BADC/66970.png"
    },
    {
        "hi": 0,
        "lo": 0,
        "id": 24320,
        "lName": "Glacial Lodestone",
        "sName": "lglacial",
        "pic": "https://render.guildwars2.com/file/E6FE2939F9BE1E03B4CD32B8492D3EDC407C0F75/66971.png"
    }
    ],
    worlds = [{
        id: 1001,
        name: "Anvil Rock",
        population: "High"
    },
    {
        id: 1002,
        name: "Borlis Pass",
        population: "Medium"
    },
    {
        id: 1003,
        name: "Yak's Bend",
        population: "High"
    },
    {
        id: 1004,
        name: "Henge of Denravi",
        population: "Medium"
    },
    {
        id: 1005,
        name: "Maguuma",
        population: "High"
    },
    {
        id: 1006,
        name: "Sorrow's Furnace",
        population: "Medium"
    },
    {
        id: 1007,
        name: "Gate of Madness",
        population: "Medium"
    },
    {
        id: 1008,
        name: "Jade Quarry",
        population: "Medium"
    },
    {
        id: 1009,
        name: "Fort Aspenwood",
        population: "Full"
    },
    {
        id: 1010,
        name: "Ehmry Bay",
        population: "Medium"
    },
    {
        id: 1011,
        name: "Stormbluff Isle",
        population: "Medium"
    },
    {
        id: 1012,
        name: "Darkhaven",
        population: "Medium"
    },
    {
        id: 1013,
        name: "Sanctum of Rall",
        population: "VeryHigh"
    },
    {
        id: 1014,
        name: "Crystal Desert",
        population: "Medium"
    },
    {
        id: 1015,
        name: "Isle of Janthir",
        population: "Medium"
    },
    {
        id: 1016,
        name: "Sea of Sorrows",
        population: "VeryHigh"
    },
    {
        id: 1017,
        name: "Tarnished Coast",
        population: "High"
    },
    {
        id: 1018,
        name: "Northern Shiverpeaks",
        population: "High"
    },
    {
        id: 1019,
        name: "Blackgate",
        population: "Full"
    },
    {
        id: 1020,
        name: "Ferguson's Crossing",
        population: "Medium"
    },
    {
        id: 1021,
        name: "Dragonbrand",
        population: "Medium"
    },
    {
        id: 1022,
        name: "Kaineng",
        population: "High"
    },
    {
        id: 1023,
        name: "Devona's Rest",
        population: "Medium"
    },
    {
        id: 1024,
        name: "Eredon Terrace",
        population: "Medium"
    },
    {
        id: 2001,
        name: "Fissure of Woe",
        population: "Medium"
    },
    {
        id: 2002,
        name: "Desolation",
        population: "VeryHigh"
    },
    {
        id: 2003,
        name: "Gandara",
        population: "High"
    },
    {
        id: 2004,
        name: "Blacktide",
        population: "Medium"
    },
    {
        id: 2005,
        name: "Ring of Fire",
        population: "Medium"
    },
    {
        id: 2006,
        name: "Underworld",
        population: "Medium"
    },
    {
        id: 2007,
        name: "Far Shiverpeaks",
        population: "Medium"
    },
    {
        id: 2008,
        name: "Whiteside Ridge",
        population: "High"
    },
    {
        id: 2009,
        name: "Ruins of Surmia",
        population: "Medium"
    },
    {
        id: 2010,
        name: "Seafarer's Rest",
        population: "VeryHigh"
    },
    {
        id: 2011,
        name: "Vabbi",
        population: "High"
    },
    {
        id: 2012,
        name: "Piken Square",
        population: "VeryHigh"
    },
    {
        id: 2013,
        name: "Aurora Glade",
        population: "High"
    },
    {
        id: 2014,
        name: "Gunnar's Hold",
        population: "Medium"
    },
    {
        id: 2101,
        name: "Jade Sea",
        population: "High"
    },
    {
        id: 2102,
        name: "Fort Ranik",
        population: "Medium"
    },
    {
        id: 2103,
        name: "Augury Rock",
        population: "High"
    },
    {
        id: 2104,
        name: "Vizunah Square",
        population: "Medium"
    },
    {
        id: 2105,
        name: "Arborstone",
        population: "Medium"
    },
    {
        id: 2201,
        name: "Kodash",
        population: "High"
    },
    {
        id: 2202,
        name: "Riverside",
        population: "Full"
    },
    {
        id: 2203,
        name: "Elona Reach",
        population: "VeryHigh"
    },
    {
        id: 2204,
        name: "Abaddon's Mouth",
        population: "Medium"
    },
    {
        id: 2205,
        name: "Drakkar Lake",
        population: "High"
    },
    {
        id: 2206,
        name: "Miller's Sound",
        population: "Medium"
    },
    {
        id: 2207,
        name: "Dzagonur",
        population: "Medium"
    },
    {
        id: 2301,
        name: "Baruch Bay",
        population: "VeryHigh"
    }
    ],
    hex64 = require('hex64');

Object.defineProperty(Array.prototype, 'chunk', {
    value: function (chunkSize) {
        const temporal = [];

        for (let i = 0; i < this.length; i += chunkSize) {
            temporal.push(this.slice(i, i + chunkSize));
        }

        return temporal;
    }
});

let lastPriceCheck = 0;

const routeExp = function (io,keys) {
    this.authbit = (req, res, next) => {
        if (req.session && req.session.user && req.session.user._id) {
            if (req.session.user.isBanned) {
                res.status(403).send('banned');
            }
            next();
        } else {
            res.status(401).send('err')
        }
    };

    this.isMod = (req, res, next) => {
        mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    }
    /* 
    SAMPLE BUILD (druid):[&DQQeNRkeBRolD3kAvQCWAbwAvADVEr0AtBLtABE5FRkAAAAAAAAAAAAAAAA=]
    need to encodeURIComponent on FE, so we avoid '&' and '='
    %26DQQeNRkeBRolD3kAvQCWAbwAvADVEr0AtBLtABE5FRkAAAAAAAAAAAAAAAA%3D = above, encoded

    hex: 0D 04 1E 35 19 1E 05 1A 250F 7900 BD00 9601 BC00 BC00 D512 BD00 B412 ED00 1139 1519 00 0000000000000000000000

    trait stuffs: "1E", "35", "19", "1E", "05", "1A"

    druid (5) trait 26 should  == 011010

    pets: 11,39,15,19


    */

    router.get('/worldData',this.authbit,(req,res,next)=>{
        axios.get('https://api.guildwars2.com/v2/worlds?ids=all').then(r=>{
            res.send(r.data)
        })
    })

    router.get('/build', async function (req, res, next) {
        if (!req.query.build || !req.query.build.startsWith('[&') || !req.query.build.endsWith(']')) {
            //not a valid build code!
            return res.status(400).send('errnb');
        }
        const buildHex = hex64.toHex(req.query.build.slice(2, -1)),//hex build code (from b65)
            bhg = buildHex.match(/\w{2}/g),//split into bytes
            build = {//blank build 
                prof: null,
                specs: [null, null, null],
                skills: {
                    skillList: [],
                    skillPalete: [],
                    land: [[],[]],
                    water: [[],[]]
                }
            };

        let bhgTemp = bhg.slice(1);
        build.prof = buildsInfo.profs[parseInt(bhgTemp.shift())];
        let specBit, traitBit, whichSpec, usedTraits, allTraits = [];
        // loop thru each specialization slot
        for (let i = 0; i < 3; i++) {
            specBit = parseInt(bhgTemp.shift(), 16);//the specialization ID byte
            traitBit = parseInt(bhgTemp.shift(), 16).toString(2);//picked trait bytes
            while (traitBit.length < 6) {
                traitBit = '0' + traitBit;//leftpad traitBit
            }
            traitBit = traitBit.match(/\w{2}/g).reverse().map(q => parseInt(q, 2) - 1);//chunk the traits, and reverse 
            whichSpec = buildsInfo.specializations.find(q => q.id == specBit);//find our specialization
            usedTraits = whichSpec.major_traits.chunk(3);
            // console.log('TRAIT NUMBER',i,'ALL MINOR',whichSpec.minor_traits,'THIS ONE',whichSpec.minor_traits[i])
            build.specs[i] = {
                spec: {
                    //info about the specialization itself
                    name: whichSpec.name,
                    bg: whichSpec.background,
                    id: specBit,
                    icon: whichSpec.icon//specialization icon
                },
                traitSlots: whichSpec.major_traits.chunk(3).map((q, n) => ({
                    minor: whichSpec.minor_traits[n],
                    major: q
                })),
                usedTraits: traitBit.map((q, n) => usedTraits[n][q])
            }
            allTraits.push(...whichSpec.major_traits, ...whichSpec.minor_traits)
        }
        const traitInfo = await axios.get('https://api.guildwars2.com/v2/traits?ids=' + allTraits.join(','));
        //Convert traits/specs to a FE-readable format
        build.specs.forEach(spc => {
            spc.traitSlots.forEach((traitSlot, n) => {
                for (let i = 0; i < 3; i++) {
                    const majTrait = traitInfo.data.find(q => q.id == traitSlot.major[i]);
                    traitSlot.major[i] = {
                        name: majTrait.name,
                        id: majTrait.id,
                        order: majTrait.order,
                        icon: majTrait.icon,
                        desc: majTrait.description.replace(/<[=@\w]+>/g, '').replace(/<\/\w+>/g, ''),
                        picked: spc.usedTraits.includes(traitSlot.major[i])
                    }
                }
                const minTrait = traitInfo.data.find(q => q.id == traitSlot.minor);
                traitSlot.minor = {
                    name: minTrait.name,
                    id: minTrait.id,
                    icon: minTrait.icon,
                    desc: minTrait.description.replace(/<[=@\w]+>/g, '').replace(/<\/\w+>/g, '')
                };
            })
        })

        //Skill template codes (may be invalid if Rev; we'll fix that later!)
        let bitA, bitB, bothBits;
        for (let i = 0; i < 10; i++) {
            bitA = bhgTemp.shift();
            bitB = bhgTemp.shift();
            bothBits = parseInt(bitA, 16) < parseInt(bitB, 16) ? bitA + bitB : bitB + bitA;
            if (build.prof == 'Revenant') {
                continue;
            }
            skillId = buildsInfo.skills.find(q => q.palId == parseInt(bothBits, 16));
            if (skillId && skillId.skillId) {
                skillId = skillId.skillId;
            }
            if(!!skillId){
                if (!(i % 2)) {
                    build.skills.land[0].push(skillId)
                } else {
                    build.skills.water[0].push(skillId)
                }
            }
            build.skills.skillList.push(skillId)
            build.skills.skillPalete.push(parseInt(bothBits, 16))
        }

        //Pets or legend (ranger/rev), or just continue on (everyone else)
        if (build.prof == 'Ranger') {
            //RANGER: PETS
            //first, set up our pet um... dog house. Whatever
            build.pets = {
                land: [{
                    id: null
                }, {
                    id: null
                }],
                water: [{
                    id: null
                }, {
                    id: null
                }]
            }
            const petIdList = bhgTemp.splice(0, 4).map(q => parseInt(q, 16));
            build.pets.land[0].id = petIdList[0];
            build.pets.land[1].id = petIdList[1];
            build.pets.water[0].id = petIdList[2];
            build.pets.water[1].id = petIdList[3];
            const petInfo = await axios.get('https://api.guildwars2.com/v2/pets?ids=' + petIdList.join(','));
            build.pets.land[0] = petInfo.data.find(p => p.id == build.pets.land[0].id);
            build.pets.land[1] = petInfo.data.find(p => p.id == build.pets.land[1].id);
            build.pets.water[0] = petInfo.data.find(p => p.id == build.pets.water[0].id);
            build.pets.water[1] = petInfo.data.find(p => p.id == build.pets.water[1].id);
        } else if (build.prof == 'Revenant') {
            //REV: LEGENDS
            console.log('Rev! Remaining data for legends are', bhgTemp)
            build.legs = {
                land: [{
                    id: null,
                },
                {
                    id: null,
                }],
                water: [{
                    id: null,
                },
                {
                    id: null,
                }]
            }
            //blank the skills lists (we're gonna refill em)
            build.skills.land = [[], []];
            build.skills.water = [[], []];
            build.skills.skillList = [];
            
            //set the actual legends
            const legIdList = bhgTemp.splice(0, 4).map(q => parseInt(q, 16));
            build.legs.land[0] = legIdList[0] ? buildsInfo.revLegs[legIdList[0] - 13] : null;
            build.legs.land[1] = legIdList[1] ? buildsInfo.revLegs[legIdList[1] - 13] : null;
            build.legs.water[0] = legIdList[2] ? buildsInfo.revLegs[legIdList[2] - 13] : null;
            build.legs.water[1] = legIdList[3] ? buildsInfo.revLegs[legIdList[3] - 13] : null;

            //now we got all the actual leg human-readable data. Next: set the skills
            const legendNums = legIdList.map(q => q ? `Legend${q - 12}` : null)
            const legApi = await axios.get('https://api.guildwars2.com/v2/legends?ids=' + legendNums.filter(q => !!q).join(','));
            console.log('LEGAPI', legApi.data, 'LEG NUMS', legendNums)
            legApi.data.forEach(d => {
                let targArr = null,
                    n = legendNums.indexOf(d.id),
                    low = null;
                arrNum = n;
                if (n < 2) {
                    low='land';
                    targArr = build.skills.land;
                } else {
                    low='water';
                    arrNum -= 2;
                    targArr = build.skills.water;
                }
                console.log('placing traits for leg number',arrNum,'in',low)
                targArr[arrNum] = [d.heal, d.utilities[0], d.utilities[1], d.utilities[2], d.elite]
                build.skills.skillList.push(d.heal, d.utilities[0], d.utilities[1], d.utilities[2], d.elite)
            })
            build.skills.skillList = _.uniq(build.skills.skillList);//
        } else {
            //ALL OTHERS
        }


        //got skill IDs; get the actual skill info from API
        // console.log('Getting skills',build.skills.skillList)

        const skillsFromAPI = await axios.get('https://api.guildwars2.com/v2/skills?ids=' + build.skills.skillList.join(','));
        build.skills.water[0] = build.skills.water[0].map(n => skillsFromAPI.data.find(q => q.id == n));
        build.skills.land[0] = build.skills.land[0].map(n => skillsFromAPI.data.find(q => q.id == n));
        if (!!build.skills.water[1]) {
            build.skills.water[1] = build.skills.water[1].map(n => skillsFromAPI.data.find(q => q.id == n));
        }
        if (!!build.skills.water[1]) {
            build.skills.land[1] = build.skills.land[1].map(n => skillsFromAPI.data.find(q => q.id == n));
        }
        return res.send(build);
    })
    router.get('/threadsToTemplates',this.authbit,this.isMod,(req,res,next)=>{
        mongoose.model('post').find({},(err,posts)=>{
            posts.forEach(p=>{
                p.text = p.text.replace(/(?<!>)\[&amp;D[\w+/]+=*\](?!<\/span)/g, `<span class='build-code' onclick='angular.element(this).scope().inspectCode(this);' title= 'inspect this build!'>$&</span>`);
                p.save()
            })
        })
        res.send('done (probly)')
    })
    router.get(['/daily', '/daily/tomorrow'], this.authbit, (req, res, next) => {
        console.log('URL:', req.url)
        // res.send('HI')
        // return false
        const tmrw = req.url.indexOf('tomorrow') > -1;
        axios.get('https://api.guildwars2.com/v2/achievements/daily' + (tmrw ? '/tomorrow' : ''))
            .then((r) => {
                // console.log('RESULT', r.data)
                let modes = ['pve', 'pvp', 'wvw', 'fractals', 'special'];
                mongoose.model('User').findOne({ user: req.session.user.user }, function (err, usr) {
                    const minUsrLvl = usr.chars && usr.chars.length ? _.minBy(usr.chars, 'lvl').lvl : 1,
                        maxUsrLvl = usr.chars && usr.chars.length ? _.maxBy(usr.chars, 'lvl').lvl : 80;
                    modes.forEach(mode => r.data[mode] = r.data[mode].filter(dl => {
                        return dl.level.min <= maxUsrLvl && dl.level.max >= minUsrLvl;
                    }))
                    let achieveIds = [];
                    if (req.query.modes) {
                        const desiredModes = req.query.modes.split(',');
                        _.difference(modes, desiredModes).forEach(umd => {
                            delete r.data[umd];
                        });
                        modes = desiredModes;
                    }
                    console.log('DATA NOW', r.data)
                    _.each(modes, md => {
                        achieveIds = _.uniq(achieveIds.concat(r.data[md].map(mdi => mdi.id)))
                    })
                    console.log('ACHIEVES', achieveIds)
                    //now have a list of all desired achievs (or all achieves). Get actual info;
                    axios.get('https://api.guildwars2.com/v2/achievements?ids=' + achieveIds.join(','))
                        .then(ds => {
                            if (modes.indexOf('fractals') > -1) {
                                const fracIds = r.data.fractals.map(fi => fi.id);
                                // console.log('Fractal Achieve IDs',fracIds)
                                fracIds.forEach(fli => {
                                    let thisFrac = ds.data.find(fld => fld.id == fli);
                                    //now we have the fractal daily. We need to find the fl associated with it!
                                    if (thisFrac.name.indexOf('Recommended') > -1) {
                                        // console.log('num frac:',thisFrac)
                                        thisFrac.lvl = Number(thisFrac.name.slice(thisFrac.name.indexOf('Scale') + 6))
                                        thisFrac.requirement += ` (${fraclvl.find(flo => flo.Level == thisFrac.lvl).Fractal})`;
                                    }
                                })
                            }
                            res.send(ds.data)
                        })
                })
            })
            .catch((e) => {
                res.status(400).send(e);
            })
    })
    router.get('/allPrices', this.authbit, (req, res, next) => {
        const secsSinceLast = (Date.now() - lastPriceCheck) / 1000;
        lastPriceCheck = Date.now();
        // console.log(Math.floor(secsSinceLast),'seconds since last request')
        if (secsSinceLast > 30) {
            //do request again
            axios.get('http://api.guildwars2.com/v2/commerce/prices?ids=' + priceObjs.map(po => po.id).join(','))
                .then(r => {
                    priceObjs.forEach(p => {
                        let priceReturn = r.data.find(pf => p.id == pf.id)
                        p.hi = priceReturn.sells.unit_price;
                        p.lo = priceReturn.buys.unit_price;
                    })
                    res.send({ p: priceObjs })
                })
        } else {
            //too soon; send prices
            res.send({ p: priceObjs })
        }
    })
    router.get('/wvw', this.authbit, (req, res, next) => {
        //https://api.guildwars2.com/v2/worlds?ids=all
        //https://api.guildwars2.com/v2/wvw/matches/scores?world=1008
        req.query.world = req.query.world || 'Henge of Denravi';
        let theWorld = worlds.find(w => w.name == req.query.world);
        if (!theWorld || !theWorld.id) theWorld = { id: 1001 }
        console.log('world', req.query.world, 'id', theWorld)
        axios.get('https://api.guildwars2.com/v2/wvw/matches?world=' + theWorld.id)
            .then(r => {
                const objectiveIds = _.flatten(r.data.maps.map(mp => {
                    return mp.objectives.map(mpo => mpo.id);
                }))
                console.log(objectiveIds)
                axios.get('https://api.guildwars2.com/v2/wvw/objectives?ids=' + objectiveIds.join(',')).then(mps => {
                    // console.log('MAP IDS', r.data.maps.map(m => m.id));
                    //mps.data is list of all objectives and their 'picture' info
                    r.data.maps.forEach(wmp => {
                        wmp.objectives.forEach(wmo => {
                            thisObj = mps.data.find(mpso => mpso.id == wmo.id);
                            console.log('COORD', thisObj);
                            wmo.marker = thisObj.marker || null;
                            wmo.name = thisObj.name;
                            if (thisObj.coord) {
                                wmo.coord = thisObj.coord.slice(0, 2);
                            }
                            wmo.chat = thisObj.chat_link;
                        })
                    })
                    //find objective we own
                    const brethId = '8C57F3E8-75D7-4A8E-AC32-5D79119E8095',
                        objOwned = _.flatten(r.data.maps.map(mp => {
                            return mp.objectives;
                        })).filter(oo => oo.claimed_by == brethId)[0];
                    // axios.get('')
                    // console.log('OBJECTIVE OWNED IS:',objOwned)
                    if (objOwned) {
                        objOwned.name = mps.data.find(oo => oo.id == objOwned.id).name;
                    }
                    res.send({
                        wvw: r.data,
                        objs: mps.data,
                        uniqMps: _.uniqBy(mps.data, 'marker').filter(mpu => !!mpu.marker).map(mpm => mpm.marker),
                        owned: objOwned || null
                    });
                })
                // res.send({wvw:r.data})
            })
            .catch(e => {
                console.log('ERR', e)
                res.send('newMatch')
            })
    })
    return router;
}

module.exports = routeExp;