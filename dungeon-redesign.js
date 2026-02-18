/* 
 * 单词地下城 - 完全重设计划
 * 
 * 功能列表：
 * 1. 12个职业，每个有独特机制
 * 2. 30+种怪物，每个有独特机制
 * 3. 80+种卡牌效果
 * 4. 地图系统：遭遇战、精英、Boss、营地、商店、特殊房间、奖励房间
 * 5. 两种游戏模式：爬塔模式（无限）、挑战模式（可通关，20层Boss）
 * 6. 存档/读档功能
 * 7. 战斗后掉落选择
 * 8. 通关总结界面
 */

// 完整职业系统（含独特机制）
const dungeonClasses = {
    warrior: {
        id: 'warrior',
        name: '战士',
        icon: '🛡️',
        baseHP: 150,
        baseATK: 15,
        baseDEF: 10,
        passive: '坚韧：受到伤害减少20%',
        rarity: 'rare',
        description: '坚不可摧的守护者',
        uniqueMechanic: {
            name: '护盾充能',
            description: '每使用3张卡牌，获得一层护盾，下次受到的伤害减少50%',
            type: 'shield',
            count: 0,
            required: 3,
            maxStacks: 3
        },
        startingCards: ['shield', 'shield', 'attack', 'attack', 'attack'],
        special: {
            name: '盾击',
            cost: 3,
            effect: 'shield_bash',
            desc: '造成1.5倍伤害并获得护盾'
        }
    },
    archer: {
        id: 'archer',
        name: '射手',
        icon: '🏹',
        baseHP: 100,
        baseATK: 20,
        baseDEF: 5,
        passive: '精准：暴击率+30%',
        rarity: 'rare',
        description: '百发百中的猎手',
        uniqueMechanic: {
            name: '连射',
            description: '连续使用攻击卡牌，每次伤害递增10%',
            type: 'combo',
            count: 0,
            multiplier: 1.0,
            reset: true
        },
        startingCards: ['attack', 'attack', 'attack', 'critical', 'critical'],
        special: {
            name: '箭雨',
            cost: 4,
            effect: 'arrow_storm',
            desc: '攻击3次，每次0.8倍伤害'
        }
    },
    mage: {
        id: 'mage',
        name: '法师',
        icon: '🔮',
        baseHP: 80,
        baseATK: 30,
        baseDEF: 3,
        passive: '魔力：技能伤害+50%',
        rarity: 'epic',
        description: '掌控元素的智者',
        uniqueMechanic: {
            name: '元素充能',
            description: '使用不同元素的卡牌，获得元素连锁效果',
            type: 'elements',
            stack: { fire: 0, ice: 0, thunder: 0 },
            active: null
        },
        startingCards: ['fireball', 'ice_shield', 'thunder', 'attack', 'heal'],
        special: {
            name: '元素爆发',
            cost: 5,
            effect: 'elemental_fury',
            desc: '释放所有积累的元素能量'
        }
    },
    support: {
        id: 'support',
        name: '辅助',
        icon: '💚',
        baseHP: 120,
        baseATK: 10,
        baseDEF: 8,
        passive: '治愈：每回合恢复10%HP',
        rarity: 'common',
        description: '守护生命的医者',
        uniqueMechanic: {
            name: '祝福光环',
            description: '使用治疗卡牌，全队获得攻击力提升',
            type: 'blessing',
            active: false,
            duration: 0,
            buff: 1.3
        },
        startingCards: ['heal', 'heal', 'big_heal', 'shield', 'power_up'],
        special: {
            name: '神圣之光',
            cost: 4,
            effect: 'holy_light',
            desc: '大量治疗并净化负面效果'
        }
    },
    assassin: {
        id: 'assassin',
        name: '刺客',
        icon: '🗡️',
        baseHP: 90,
        baseATK: 25,
        baseDEF: 4,
        passive: '暗影：首击必定暴击',
        rarity: 'epic',
        description: '暗夜中的死神',
        uniqueMechanic: {
            name: '连击点',
            description: '攻击积攒连击点，释放时造成大量伤害',
            type: 'points',
            points: 0,
            max: 5,
            multiplier: 1.5
        },
        startingCards: ['attack', 'attack', 'critical', 'critical', 'super_critical'],
        special: {
            name: '致命一击',
            cost: 0,
            effect: 'execute',
            desc: '消耗所有连击点，造成巨额伤害'
        }
    },
    paladin: {
        id: 'paladin',
        name: '圣骑士',
        icon: '⚔️',
        baseHP: 130,
        baseATK: 18,
        baseDEF: 12,
        passive: '圣光：每回合净化负面状态',
        rarity: 'legendary',
        description: '神圣的守护者',
        uniqueMechanic: {
            name: '神圣能量',
            description: '受到伤害积攒神圣能量，释放时造成范围伤害',
            type: 'holy',
            power: 0,
            max: 100,
            ratio: 2
        },
        startingCards: ['attack', 'shield', 'shield', 'heal', 'damage_immunity'],
        special: {
            name: '神圣审判',
            cost: 3,
            effect: 'divine_judgment',
            desc: '消耗神圣能量，造成大量伤害'
        }
    },
    necromancer: {
        id: 'necromancer',
        name: '死灵法师',
        icon: '💀',
        baseHP: 85,
        baseATK: 28,
        baseDEF: 5,
        passive: '亡灵：击杀敌人回复30%HP',
        rarity: 'epic',
        description: '操控生死的术士',
        uniqueMechanic: {
            name: '亡灵军团',
            description: '击杀敌人召唤亡灵，亡灵会协助攻击',
            type: 'army',
            army: 0,
            max: 5,
            attackPer: 5
        },
        startingCards: ['poison', 'super_poison', 'attack', 'attack', 'heal'],
        special: {
            name: '亡灵召唤',
            cost: 4,
            effect: 'summon_undead',
            desc: '召唤一个强力亡灵'
        }
    },
    elementalist: {
        id: 'elementalist',
        name: '元素师',
        icon: '🌪️',
        baseHP: 75,
        baseATK: 32,
        baseDEF: 2,
        passive: '元素：技能附带元素效果',
        rarity: 'legendary',
        description: '元素之力的化身',
        uniqueMechanic: {
            name: '元素共鸣',
            description: '连续使用相同元素，效果翻倍',
            type: 'resonance',
            last: null,
            consecutive: 0,
            multiplier: 2
        },
        startingCards: ['fireball', 'fireball', 'ice_shield', 'ice_shield', 'thunder', 'thunder'],
        special: {
            name: '末日审判',
            cost: 6,
            effect: 'apocalypse',
            desc: '释放所有元素，造成毁灭性伤害'
        }
    },
    berserker: {
        id: 'berserker',
        name: '狂战士',
        icon: '🪓',
        baseHP: 110,
        baseATK: 28,
        baseDEF: 2,
        passive: '狂怒：HP越低攻击越高',
        rarity: 'rare',
        description: '战场上的疯子',
        uniqueMechanic: {
            name: '狂暴值',
            description: '受到伤害增加狂暴值，攻击消耗狂暴值造成额外伤害',
            type: 'rage',
            rage: 0,
            max: 100,
            ratio: 0.03
        },
        startingCards: ['attack', 'attack', 'attack', 'heavy_attack', 'heavy_attack'],
        special: {
            name: '毁灭打击',
            cost: 2,
            effect: 'devastate',
            desc: '消耗所有狂暴值，造成巨额伤害'
        }
    },
    monk: {
        id: 'monk',
        name: '武僧',
        icon: '👊',
        baseHP: 100,
        baseATK: 22,
        baseDEF: 6,
        passive: '禅意：每回合获得1点能量',
        rarity: 'rare',
        description: '内心平静的武者',
        uniqueMechanic: {
            name: '斗气',
            description: '使用无消耗卡牌积攒斗气，释放时造成范围伤害',
            type: 'chi',
            chi: 0,
            max: 100,
            ratio: 1.5
        },
        startingCards: ['draw', 'draw', 'attack', 'attack', 'refresh'],
        special: {
            name: '升龙拳',
            cost: 0,
            effect: 'dragon_fist',
            desc: '消耗所有斗气，造成大量伤害'
        }
    },
    summoner: {
        id: 'summoner',
        name: '召唤师',
        icon: '🐲',
        baseHP: 70,
        baseATK: 15,
        baseDEF: 3,
        passive: '召唤：每回合召唤一个随从',
        rarity: 'legendary',
        description: '召唤生物的主人',
        uniqueMechanic: {
            name: '召唤物',
            description: '召唤物会替你攻击和承受伤害',
            type: 'summons',
            summons: [],
            max: 3,
            sharedDamage: 0.3
        },
        startingCards: ['draw', 'energy_restore', 'full_energy', 'shield', 'heal'],
        special: {
            name: '神龙降临',
            cost: 5,
            effect: 'summon_dragon',
            desc: '召唤一条强力的龙'
        }
    },
    timeMage: {
        id: 'timeMage',
        name: '时空法师',
        icon: '⏰',
        baseHP: 65,
        baseATK: 25,
        baseDEF: 2,
        passive: '时间：每3回合获得额外回合',
        rarity: 'legendary',
        description: '操控时间的神秘者',
        uniqueMechanic: {
            name: '时间回溯',
            description: '可以回溯到前3回合的状态（每局限用1次）',
            type: 'rewind',
            uses: 1,
            history: [],
            maxHistory: 3
        },
        startingCards: ['draw', 'time_warp', 'energy_restore', 'heal', 'shield'],
        special: {
            name: '时空裂隙',
            cost: 4,
            effect: 'time_rift',
            desc: '停止时间1回合'
        }
    }
};

// 完整怪物系统（含独特机制）
const dungeonMonsters = {
    normal: [
        {
            id: 'slime',
            name: '史莱姆',
            icon: '🟢',
            hp: 50,
            atk: 8,
            type: 'normal',
            mechanic: {
                name: '分裂',
                description: 'HP低于25%时，分裂成两个小史莱姆',
                hpThreshold: 0.25,
                splitInto: 2,
                hpMod: 0.4
            },
            drops: ['heal', 'shield']
        },
        {
            id: 'goblin',
            name: '哥布林',
            icon: '👺',
            hp: 80,
            atk: 12,
            type: 'normal',
            mechanic: {
                name: '偷窃',
                description: '攻击时有概率偷取玩家1点能量',
                chance: 0.25,
                stealAmount: 1
            },
            drops: ['gold', 'attack']
        },
        {
            id: 'skeleton',
            name: '骷髅兵',
            icon: '💀',
            hp: 100,
            atk: 15,
            type: 'normal',
            mechanic: {
                name: '复活',
                description: '死亡时有概率复活，HP为50%',
                reviveChance: 0.3,
                reviveHp: 0.5
            },
            drops: ['poison', 'attack']
        },
        {
            id: 'gargoyle',
            name: '石像鬼',
            icon: '🗿',
            hp: 140,
            atk: 16,
            type: 'normal',
            mechanic: {
                name: '石化',
                description: '受到攻击时有概率石化，下回合免疫伤害',
                stoneChance: 0.2
            },
            drops: ['shield', 'big_shield']
        },
        {
            id: 'evil_eye',
            name: '邪眼',
            icon: '👁️',
            hp: 110,
            atk: 17,
            type: 'normal',
            mechanic: {
                name: '凝视',
                description: '攻击时有概率使玩家眩晕1回合',
                stunChance: 0.2
            },
            drops: ['stun', 'sleep']
        }
    ],
    elite: [
        {
            id: 'werewolf',
            name: '狼人',
            icon: '🐺',
            hp: 120,
            atk: 18,
            type: 'elite',
            mechanic: {
                name: '狂暴',
                description: 'HP低于30%时，攻击力翻倍',
                hpThreshold: 0.3,
                atkMultiplier: 2
            },
            skills: ['撕咬'],
            drops: ['attack', 'heavy_attack', 'critical']
        },
        {
            id: 'ghost',
            name: '幽灵',
            icon: '👻',
            hp: 90,
            atk: 20,
            type: 'elite',
            mechanic: {
                name: '穿墙',
                description: '有50%概率闪避攻击',
                dodgeChance: 0.5
            },
            skills: ['恐惧'],
            drops: ['poison', 'super_poison']
        },
        {
            id: 'spider_queen',
            name: '蜘蛛女王',
            icon: '🕷️',
            hp: 130,
            atk: 19,
            type: 'elite',
            mechanic: {
                name: '蛛网',
                description: '每3回合施放蛛网，玩家减速2回合',
                webFrequency: 3,
                slowDuration: 2
            },
            skills: ['毒液'],
            drops: ['poison', 'critical', 'draw']
        },
        {
            id: 'vampire',
            name: '吸血鬼',
            icon: '🧛',
            hp: 150,
            atk: 22,
            type: 'elite',
            mechanic: {
                name: '吸血',
                description: '攻击回复造成伤害的50%',
                lifesteal: 0.5
            },
            skills: ['魅惑'],
            drops: ['lifesteal', 'big_lifesteal', 'heal']
        },
        {
            id: 'hellhound',
            name: '地狱犬',
            icon: '🐕',
            hp: 160,
            atk: 21,
            type: 'elite',
            mechanic: {
                name: '烈焰吐息',
                description: '每2回合对玩家造成持续伤害',
                breathFrequency: 2,
                dot: 15,
                dotDuration: 3
            },
            drops: ['fireball', 'thunder', 'power_up']
        },
        {
            id: 'inferno',
            name: '地狱火',
            icon: '🔥',
            hp: 190,
            atk: 26,
            type: 'elite',
            mechanic: {
                name: '燃烧',
                description: '攻击附加燃烧效果，每回合受到伤害',
                burn: 10,
                burnDuration: 3
            },
            skills: ['爆炸'],
            drops: ['fireball', 'damage_boost', 'double_damage']
        },
        {
            id: 'shadow_assassin',
            name: '暗影刺客',
            icon: '🥷',
            hp: 85,
            atk: 29,
            type: 'elite',
            mechanic: {
                name: '隐身',
                description: '每3回合隐身，下一击必定暴击',
                stealthFrequency: 3,
                critGuaranteed: true
            },
            skills: ['背刺'],
            drops: ['critical', 'super_critical', 'stun']
        },
        {
            id: 'troll',
            name: '巨魔',
            icon: '👹',
            hp: 180,
            atk: 25,
            type: 'elite',
            mechanic: {
                name: '再生',
                description: '每回合回复10%HP',
                regen: 0.1
            },
            skills: ['狂暴'],
            drops: ['regeneration', 'super_regeneration', 'heal']
        }
    ],
    boss: [
        {
            id: 'lich',
            name: '巫妖',
            icon: '🧟',
            hp: 170,
            atk: 24,
            type: 'boss',
            mechanic: {
                name: '亡灵召唤',
                description: '每4回合召唤2个骷髅兵',
                summonFrequency: 4,
                summonCount: 2
            },
            skills: ['冰霜新星'],
            drops: ['epic_card', 'legendary_card', 'max_hp', 'max_energy']
        },
        {
            id: 'frost_giant',
            name: '冰霜巨人',
            icon: '❄️',
            hp: 220,
            atk: 23,
            type: 'boss',
            mechanic: {
                name: '冰冻',
                description: '每3回合冰冻玩家1回合',
                freezeFrequency: 3,
                freezeDuration: 1
            },
            skills: ['地震'],
            drops: ['ice_shield', 'shield', 'regeneration']
        },
        {
            id: 'demon',
            name: '恶魔',
            icon: '😈',
            hp: 200,
            atk: 28,
            type: 'boss',
            mechanic: {
                name: '诅咒',
                description: '攻击附加诅咒，玩家攻击力降低20%',
                curse: 0.2,
                curseDuration: 3
            },
            skills: ['地狱火'],
            drops: ['fireball', 'damage_boost', 'power_up']
        },
        {
            id: 'holy_angel',
            name: '神圣天使',
            icon: '👼',
            hp: 280,
            atk: 32,
            type: 'boss',
            mechanic: {
                name: '神圣护盾',
                description: '每5回合获得护盾，持续2回合',
                shieldFrequency: 5,
                shieldDuration: 2
            },
            skills: ['神圣之光', '复活'],
            drops: ['holy_light', 'heal', 'damage_immunity']
        },
        {
            id: 'dragon',
            name: '巨龙',
            icon: '🐉',
            hp: 300,
            atk: 35,
            type: 'boss',
            mechanic: {
                name: '龙息',
                description: '每4回合施放龙息，造成大量伤害',
                breathFrequency: 4,
                breathDamage: 50
            },
            skills: ['飞行'],
            drops: ['elemental_fury', 'fireball', 'super_critical']
        },
        {
            id: 'reaper',
            name: '死神',
            icon: '💀',
            hp: 250,
            atk: 30,
            type: 'boss',
            mechanic: {
                name: '死亡凝视',
                description: 'HP低于50%时，每回合有即死概率',
                executeThreshold: 0.5,
                executeChance: 0.15
            },
            skills: ['收割'],
            drops: ['super_poison', 'stun', 'critical']
        }
    ],
    final_boss: [
        {
            id: 'demon_lord',
            name: '魔王',
            icon: '👿',
            hp: 400,
            atk: 40,
            type: 'legendary',
            mechanic: {
                name: '黑暗降临',
                description: '每3回合施放黑暗降临，造成混乱',
                darkFrequency: 3
            },
            skills: ['召唤恶魔', '毁灭'],
            drops: ['legendary_card', 'max_hp', 'max_energy', 'gold_100']
        },
        {
            id: 'chaos_lord',
            name: '混沌之主',
            icon: '🌑',
            hp: 450,
            atk: 45,
            type: 'legendary',
            mechanic: {
                name: '混沌之力',
                description: '每回合随机施放一个强力技能',
                randomSkill: true
            },
            skills: ['时空裂隙', '毁灭世界'],
            drops: ['legendary_card', 'legendary_card', 'gold_200']
        },
        {
            id: 'ancient_dragon',
            name: '远古巨龙',
            icon: '🐲',
            hp: 500,
            atk: 50,
            type: 'legendary',
            mechanic: {
                name: '远古之火',
                description: 'HP低于30%时，攻击力和攻击频率翻倍',
                enrageThreshold: 0.3
            },
            skills: ['龙之怒', '末日审判'],
            drops: ['legendary_card', 'legendary_card', 'legendary_card']
        }
    ]
};

// 地图房间类型
const roomTypes = {
    encounter: {
        name: '遭遇战',
        icon: '⚔️',
        color: '#ef4444',
        description: '遭遇普通敌人'
    },
    elite_encounter: {
        name: '精英遭遇战',
        icon: '💀',
        color: '#a855f7',
        description: '遭遇精英敌人'
    },
    boss: {
        name: 'Boss战',
        icon: '👑',
        color: '#fbbf24',
        description: '挑战Boss'
    },
    camp: {
        name: '营地',
        icon: '🏕️',
        color: '#10b981',
        description: '休息并回复生命'
    },
    merchant: {
        name: '商人营地',
        icon: '🏪',
        color: '#3b82f6',
        description: '购买装备和卡牌'
    },
    special: {
        name: '特殊房间',
        icon: '❓',
        color: '#8b5cf6',
        description: '完成事件获得奖励'
    },
    reward: {
        name: '奖励房间',
        icon: '🎁',
        color: '#f59e0b',
        description: '选择奖励'
    },
    rest: {
        name: '休息站',
        icon: '🛏️',
        color: '#06b6d4',
        description: '完全恢复'
    }
};

// 商店物品
const shopItems = [
    { type: 'card', name: '普通卡牌', icon: '🎴', cost: 50, rarity: 'common' },
    { type: 'card', name: '稀有卡牌', icon: '💎', cost: 100, rarity: 'rare' },
    { type: 'card', name: '史诗卡牌', icon: '🔮', cost: 200, rarity: 'epic' },
    { type: 'card', name: '传说卡牌', icon: '⭐', cost: 500, rarity: 'legendary' },
    { type: 'heal', name: '生命药水', icon: '❤️', cost: 30, value: 50 },
    { type: 'heal', name: '大生命药水', icon: '💖', cost: 60, value: 100 },
    { type: 'max_hp', name: '生命上限', icon: '❤️‍🔥', cost: 150, value: 20 },
    { type: 'max_energy', name: '能量上限', icon: '⚡', cost: 200, value: 1 },
    { type: 'remove', name: '移除卡牌', icon: '🗑️', cost: 75, value: 1 },
    { type: 'upgrade', name: '升级卡牌', icon: '⬆️', cost: 250, value: 1 }
];

// 特殊房间事件
const specialEvents = [
    {
        id: 'spell_word',
        name: '拼写单词',
        description: '正确拼写英文单词',
        reward: { type: 'gold', amount: 30 },
        penalty: { type: 'damage', amount: 15 }
    },
    {
        id: 'translate_en_to_zh',
        name: '中英互译',
        description: '将英文翻译成中文',
        reward: { type: 'card', rarity: 'rare' },
        penalty: { type: 'energy', amount: 2 }
    },
    {
        id: 'translate_zh_to_en',
        name: '中译英',
        description: '将中文翻译成英文',
        reward: { type: 'gold', amount: 50 },
        penalty: { type: 'damage', amount: 20 }
    },
    {
        id: 'match_synonym',
        name: '同义词匹配',
        description: '找出同义词',
        reward: { type: 'card', rarity: 'epic' },
        penalty: { type: 'energy', amount: 3 }
    },
    {
        id: 'fill_blank',
        name: '填空',
        description: '填入正确的单词',
        reward: { type: 'max_hp', amount: 15 },
        penalty: { type: 'damage', amount: 25 }
    },
    {
        id: 'word_search',
        name: '单词搜索',
        description: '在字母表中找到单词',
        reward: { type: 'legendary_card', amount: 1 },
        penalty: { type: 'heal', amount: -30 }
    }
];

// 奖励房间的选择项
const rewardChoices = [
    { type: 'gold', name: '金币', icon: '💰', amount: [30, 50, 80, 100] },
    { type: 'card', name: '卡牌', icon: '🎴', rarity: ['common', 'rare', 'epic'] },
    { type: 'heal', name: '治疗', icon: '❤️', amount: [30, 50, 80] },
    { type: 'energy', name: '能量', icon: '⚡', amount: [1, 2] },
    { type: 'max_hp', name: '生命上限', icon: '💗', amount: [10, 15, 20] },
    { type: 'max_energy', name: '能量上限', icon: '⚡', amount: [1] }
];

// 游戏模式配置
const gameModes = {
    endless: {
        id: 'endless',
        name: '爬塔模式',
        icon: '♾️',
        description: '无限层数，看你能走多远',
        infinite: true,
        bossFrequency: 10,
        eliteFrequency: 3,
        specialFrequency: 5,
        merchantFrequency: 4
    },
    challenge: {
        id: 'challenge',
        name: '挑战模式',
        icon: '🏆',
        description: '挑战20层，击败最终Boss',
        infinite: false,
        maxFloors: 20,
        bossFloors: [5, 10, 15, 20],
        eliteFloors: [3, 7, 12, 17],
        specialFloors: [4, 9, 14, 18],
        merchantFloors: [2, 6, 11, 16],
        campFloors: [8, 13, 19],
        finalBossFloor: 20
    }
};

console.log('单词地下城重设计划加载完成！');
