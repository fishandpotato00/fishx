/* 
 * 单词地下城 - 完整游戏逻辑 v3.0
 * 包含：职业系统、怪物系统、卡牌系统、地图系统、多存档系统、自定义卡组系统、音效系统
 */

// ==================== 游戏配置 ====================
const GAME_CONFIG = {
    DECK_SIZE: 20,
    MAX_SAVE_SLOTS: 3,
    MAX_CUSTOM_DECKS: 5,
    MAX_HAND_SIZE: 7,
    STARTING_HAND_SIZE: 5
};

// ==================== 游戏状态 ====================
const dungeonGameState = {
    mode: 'endless',
    difficulty: 'normal',
    playerClass: null,
    selectedDeckId: 'balanced',
    floor: 1,
    playerHP: 100,
    playerMaxHP: 100,
    playerATK: 10,
    playerDEF: 5,
    energy: 3,
    maxEnergy: 3,
    gold: 0,
    deck: [],
    hand: [],
    discardPile: [],
    inBattle: false,
    enemy: null,
    enemyHP: 0,
    enemyMaxHP: 0,
    isPlayerTurn: true,
    turnCount: 0,
    uniqueState: {},
    kills: 0,
    cardsPlayed: 0,
    damageDealt: 0,
    damageTaken: 0,
    goldEarned: 0,
    startTime: null,
    mapPath: [],
    currentRoomIndex: 0,
    buffs: [],
    debuffs: [],
    summons: [],
    inventory: [],
    soundEnabled: true,
    collectedCards: [],
    firstStrikeUsed: false
};

// ==================== 默认卡组 ====================
const defaultDecks = {
    balanced: {
        id: 'balanced',
        name: '平衡卡组',
        icon: '⚖️',
        desc: '攻守兼备的均衡卡组',
        cards: [
            'attack', 'attack', 'attack', 'attack', 'attack',
            'shield', 'shield', 'shield', 'shield',
            'heal', 'heal', 'heal',
            'critical', 'critical',
            'draw', 'draw',
            'energy_restore', 'energy_restore',
            'heavy_attack', 'big_heal'
        ]
    },
    aggressive: {
        id: 'aggressive',
        name: '进攻卡组',
        icon: '🔥',
        desc: '高伤害的激进卡组',
        cards: [
            'attack', 'attack', 'attack', 'attack', 'attack', 'attack',
            'heavy_attack', 'heavy_attack', 'heavy_attack',
            'critical', 'critical', 'critical',
            'double_attack', 'double_attack',
            'lifesteal', 'lifesteal',
            'super_critical',
            'draw', 'energy_restore', 'power_up'
        ]
    },
    defensive: {
        id: 'defensive',
        name: '防守卡组',
        icon: '🛡️',
        desc: '高生存的防御卡组',
        cards: [
            'shield', 'shield', 'shield', 'shield', 'shield',
            'big_shield', 'big_shield',
            'heal', 'heal', 'heal', 'heal',
            'big_heal', 'big_heal',
            'regeneration', 'regeneration',
            'damage_immunity',
            'draw', 'draw',
            'energy_restore', 'holy_light'
        ]
    }
};

// ==================== 职业系统 ====================
const dungeonClasses = {
    warrior: {
        id: 'warrior', name: '战士', icon: '🛡️', baseHP: 150, baseATK: 15, baseDEF: 10,
        passive: { name: '坚韧', desc: '受到伤害减少20%', type: 'damage_reduction', value: 0.2 },
        rarity: 'rare', description: '坚不可摧的守护者',
        uniqueMechanic: { name: '护盾充能', description: '每使用3张卡牌，获得一层护盾', type: 'shield_charge', count: 0, required: 3 },
        startingCards: ['shield', 'shield', 'attack', 'attack', 'attack']
    },
    archer: {
        id: 'archer', name: '射手', icon: '🏹', baseHP: 100, baseATK: 20, baseDEF: 5,
        passive: { name: '精准', desc: '暴击率+30%', type: 'crit_chance', value: 0.3 },
        rarity: 'rare', description: '百发百中的猎手',
        uniqueMechanic: { name: '连射', description: '连续使用攻击卡牌，伤害递增10%', type: 'combo', count: 0, multiplier: 1.0 },
        startingCards: ['attack', 'attack', 'attack', 'critical', 'critical']
    },
    mage: {
        id: 'mage', name: '法师', icon: '🔮', baseHP: 80, baseATK: 30, baseDEF: 3,
        passive: { name: '魔力', desc: '技能伤害+50%', type: 'skill_damage', value: 0.5 },
        rarity: 'epic', description: '掌控元素的智者',
        uniqueMechanic: { name: '元素充能', description: '使用元素卡牌获得连锁效果', type: 'elements', stack: { fire: 0, ice: 0, thunder: 0 } },
        startingCards: ['fireball', 'ice_shield', 'thunder', 'attack', 'heal']
    },
    support: {
        id: 'support', name: '辅助', icon: '💚', baseHP: 120, baseATK: 10, baseDEF: 8,
        passive: { name: '治愈', desc: '每回合恢复10%HP', type: 'regen', value: 0.1 },
        rarity: 'common', description: '守护生命的医者',
        uniqueMechanic: { name: '祝福光环', description: '使用治疗卡牌获得攻击力提升', type: 'blessing', active: false, buff: 1.3 },
        startingCards: ['heal', 'heal', 'big_heal', 'shield', 'power_up']
    },
    assassin: {
        id: 'assassin', name: '刺客', icon: '🗡️', baseHP: 90, baseATK: 25, baseDEF: 4,
        passive: { name: '暗影', desc: '首击必定暴击', type: 'first_strike_crit', value: true },
        rarity: 'epic', description: '暗夜中的死神',
        uniqueMechanic: { name: '连击点', description: '攻击积攒连击点，释放造成大量伤害', type: 'points', points: 0, max: 5 },
        startingCards: ['attack', 'attack', 'critical', 'critical', 'super_critical']
    },
    paladin: {
        id: 'paladin', name: '圣骑士', icon: '⚔️', baseHP: 130, baseATK: 18, baseDEF: 12,
        passive: { name: '圣光', desc: '每回合净化负面状态', type: 'cleanse', value: true },
        rarity: 'legendary', description: '神圣的守护者',
        uniqueMechanic: { name: '神圣能量', description: '受伤害积攒能量，释放造成范围伤害', type: 'holy', power: 0, max: 100 },
        startingCards: ['attack', 'shield', 'shield', 'heal', 'damage_immunity']
    },
    necromancer: {
        id: 'necromancer', name: '死灵法师', icon: '💀', baseHP: 85, baseATK: 28, baseDEF: 5,
        passive: { name: '亡灵', desc: '击杀敌人回复30%HP', type: 'kill_heal', value: 0.3 },
        rarity: 'epic', description: '操控生死的术士',
        uniqueMechanic: { name: '亡灵军团', description: '击杀敌人召唤亡灵协助攻击', type: 'army', army: 0, max: 5 },
        startingCards: ['poison', 'super_poison', 'attack', 'attack', 'heal']
    },
    elementalist: {
        id: 'elementalist', name: '元素师', icon: '🌪️', baseHP: 75, baseATK: 32, baseDEF: 2,
        passive: { name: '元素', desc: '技能附带元素效果', type: 'element_bonus', value: true },
        rarity: 'legendary', description: '元素之力的化身',
        uniqueMechanic: { name: '元素共鸣', description: '连续使用相同元素效果翻倍', type: 'resonance', last: null, consecutive: 0 },
        startingCards: ['fireball', 'fireball', 'ice_shield', 'ice_shield', 'thunder']
    },
    berserker: {
        id: 'berserker', name: '狂战士', icon: '🪓', baseHP: 110, baseATK: 28, baseDEF: 2,
        passive: { name: '狂怒', desc: 'HP越低攻击越高', type: 'low_hp_damage', value: true },
        rarity: 'rare', description: '战场上的疯子',
        uniqueMechanic: { name: '狂暴值', description: '受伤害增加狂暴值，攻击消耗造成额外伤害', type: 'rage', rage: 0, max: 100 },
        startingCards: ['attack', 'attack', 'attack', 'heavy_attack', 'heavy_attack']
    },
    monk: {
        id: 'monk', name: '武僧', icon: '👊', baseHP: 100, baseATK: 22, baseDEF: 6,
        passive: { name: '禅意', desc: '每回合获得1点能量', type: 'energy_regen', value: 1 },
        rarity: 'rare', description: '内心平静的武者',
        uniqueMechanic: { name: '斗气', description: '使用无消耗卡牌积攒斗气', type: 'chi', chi: 0, max: 100 },
        startingCards: ['draw', 'draw', 'attack', 'attack', 'refresh']
    },
    summoner: {
        id: 'summoner', name: '召唤师', icon: '🐲', baseHP: 70, baseATK: 15, baseDEF: 3,
        passive: { name: '召唤', desc: '每回合召唤一个随从', type: 'summon', value: true },
        rarity: 'legendary', description: '召唤生物的主人',
        uniqueMechanic: { name: '召唤物', description: '召唤物替你攻击和承受伤害', type: 'summons', summons: [], max: 3 },
        startingCards: ['draw', 'energy_restore', 'full_energy', 'shield', 'heal']
    },
    timeMage: {
        id: 'timeMage', name: '时空法师', icon: '⏰', baseHP: 65, baseATK: 25, baseDEF: 2,
        passive: { name: '时间', desc: '每3回合获得额外回合', type: 'extra_turn', value: 3 },
        rarity: 'legendary', description: '操控时间的神秘者',
        uniqueMechanic: { name: '时间回溯', description: '可回溯到前3回合状态（每局限1次）', type: 'rewind', uses: 1, history: [] },
        startingCards: ['draw', 'time_warp', 'energy_restore', 'heal', 'shield']
    },
    druid: {
        id: 'druid', name: '德鲁伊', icon: '🌿', baseHP: 115, baseATK: 18, baseDEF: 7,
        passive: { name: '自然', desc: '每回合获得护盾', type: 'shield_regen', value: 5 },
        rarity: 'epic', description: '自然的守护者',
        uniqueMechanic: { name: '形态变换', description: '可切换自然形态/野兽形态', type: 'shapeshift', current: 'nature', stacks: 0 },
        startingCards: ['heal', 'shield', 'regeneration', 'attack', 'poison']
    },
    runeKnight: {
        id: 'runeKnight', name: '符文骑士', icon: '🔱', baseHP: 125, baseATK: 20, baseDEF: 11,
        passive: { name: '符文', desc: '攻击附加魔法伤害', type: 'rune_damage', value: 5 },
        rarity: 'epic', description: '符文之力的骑士',
        uniqueMechanic: { name: '符文铭刻', description: '可将符文铭刻在卡牌上增强效果', type: 'runes', runeCount: 0, maxRunes: 5 },
        startingCards: ['attack', 'heavy_attack', 'shield', 'power_up', 'damage_boost']
    },
    alchemist: {
        id: 'alchemist', name: '炼金术士', icon: '⚗️', baseHP: 95, baseATK: 22, baseDEF: 6,
        passive: { name: '炼金', desc: '使用卡牌时获得金币', type: 'gold_gen', value: 3 },
        rarity: 'rare', description: '物质转换的大师',
        uniqueMechanic: { name: '物质转化', description: '可将卡牌转化为其他卡牌', type: 'transmute', charges: 3, maxCharges: 3 },
        startingCards: ['poison', 'heal', 'draw', 'power_up', 'energy_restore']
    }
};

// ==================== 怪物系统 ====================
const dungeonMonsters = {
    normal: [
        { id: 'slime', name: '史莱姆', icon: '🟢', hp: 50, atk: 8, mechanic: { name: '分裂', desc: 'HP<25%分裂成两个' } },
        { id: 'goblin', name: '哥布林', icon: '👺', hp: 80, atk: 12, mechanic: { name: '偷窃', desc: '25%概率偷取1能量' } },
        { id: 'skeleton', name: '骷髅兵', icon: '💀', hp: 100, atk: 15, mechanic: { name: '复活', desc: '30%概率复活' } },
        { id: 'gargoyle', name: '石像鬼', icon: '🗿', hp: 140, atk: 16, mechanic: { name: '石化', desc: '20%概率免疫伤害' } },
        { id: 'evil_eye', name: '邪眼', icon: '👁️', hp: 110, atk: 17, mechanic: { name: '凝视', desc: '20%概率眩晕' } },
        { id: 'bat', name: '蝙蝠', icon: '🦇', hp: 40, atk: 10, mechanic: { name: '闪避', desc: '30%闪避攻击' } },
        { id: 'rat', name: '巨鼠', icon: '🐀', hp: 60, atk: 11, mechanic: { name: '瘟疫', desc: '攻击附加中毒' } },
        { id: 'snake', name: '毒蛇', icon: '🐍', hp: 70, atk: 14, mechanic: { name: '剧毒', desc: '攻击附加剧毒' } },
        { id: 'mushroom', name: '毒蘑菇', icon: '🍄', hp: 65, atk: 9, mechanic: { name: '孢子', desc: '每回合释放毒孢子' } },
        { id: 'wolf', name: '野狼', icon: '🐺', hp: 90, atk: 14, mechanic: { name: '狼群', desc: '召唤小狼协助' } },
        { id: 'zombie', name: '僵尸', icon: '🧟', hp: 120, atk: 12, mechanic: { name: '感染', desc: '攻击降低防御' } },
        { id: 'goblin_shaman', name: '哥布林萨满', icon: '🧙', hp: 75, atk: 10, mechanic: { name: '治愈', desc: '每2回合回复HP' } },
        { id: 'crab', name: '巨蟹', icon: '🦀', hp: 110, atk: 13, mechanic: { name: '硬壳', desc: '受到伤害减少20%' } },
        { id: 'bee', name: '巨型蜜蜂', icon: '🐝', hp: 45, atk: 9, mechanic: { name: '蜂毒', desc: '攻击附加持续伤害' } },
        { id: 'scorpion', name: '蝎子', icon: '🦂', hp: 85, atk: 15, mechanic: { name: '毒尾', desc: '30%概率造成双倍伤害' } }
    ],
    elite: [
        { id: 'werewolf', name: '狼人', icon: '🐺', hp: 120, atk: 18, mechanic: { name: '狂暴', desc: 'HP<30%攻击翻倍' } },
        { id: 'ghost', name: '幽灵', icon: '👻', hp: 90, atk: 20, mechanic: { name: '穿墙', desc: '50%闪避攻击' } },
        { id: 'spider_queen', name: '蜘蛛女王', icon: '🕷️', hp: 130, atk: 19, mechanic: { name: '蛛网', desc: '每3回合减速' } },
        { id: 'vampire', name: '吸血鬼', icon: '🧛', hp: 150, atk: 22, mechanic: { name: '吸血', desc: '攻击回复50%伤害' } },
        { id: 'hellhound', name: '地狱犬', icon: '🐕', hp: 160, atk: 21, mechanic: { name: '烈焰', desc: '攻击附加燃烧' } },
        { id: 'inferno', name: '地狱火', icon: '🔥', hp: 190, atk: 26, mechanic: { name: '燃烧', desc: '攻击附加燃烧' } },
        { id: 'shadow_assassin', name: '暗影刺客', icon: '🥷', hp: 85, atk: 29, mechanic: { name: '隐身', desc: '每3回合隐身' } },
        { id: 'troll', name: '巨魔', icon: '👹', hp: 180, atk: 25, mechanic: { name: '再生', desc: '每回合回复10%HP' } },
        { id: 'dark_knight', name: '黑暗骑士', icon: '🖤', hp: 170, atk: 27, mechanic: { name: '黑暗之力', desc: 'HP<50%攻击+50%' } },
        { id: 'fire_elemental', name: '火元素', icon: '🔥', hp: 140, atk: 30, mechanic: { name: '灼热', desc: '攻击附加高额燃烧' } },
        { id: 'ice_golem', name: '冰霜魔像', icon: '🧊', hp: 200, atk: 22, mechanic: { name: '冰冻护甲', desc: '30%概率反弹伤害' } },
        { id: 'gorgon', name: '美杜莎', icon: '🐍', hp: 145, atk: 24, mechanic: { name: '石化凝视', desc: '每4回合石化敌人' } },
        { id: 'manticore', name: '蝎尾狮', icon: '🦁', hp: 175, atk: 23, mechanic: { name: '毒刺', desc: '攻击有概率即死' } },
        { id: 'banshee', name: '女妖', icon: '👻', hp: 100, atk: 28, mechanic: { name: '尖叫', desc: '降低玩家攻击力' } },
        { id: 'golem', name: '石魔', icon: '🪨', hp: 250, atk: 18, mechanic: { name: '石质皮肤', desc: '受到伤害减少40%' } }
    ],
    boss: [
        { id: 'lich', name: '巫妖', icon: '🧟', hp: 170, atk: 24, mechanic: { name: '亡灵召唤', desc: '每4回合召唤骷髅' } },
        { id: 'frost_giant', name: '冰霜巨人', icon: '❄️', hp: 220, atk: 23, mechanic: { name: '冰冻', desc: '每3回合冰冻' } },
        { id: 'demon', name: '恶魔', icon: '😈', hp: 200, atk: 28, mechanic: { name: '诅咒', desc: '攻击降低攻击力' } },
        { id: 'holy_angel', name: '神圣天使', icon: '👼', hp: 280, atk: 32, mechanic: { name: '神圣护盾', desc: '每5回合获得护盾' } },
        { id: 'dragon', name: '巨龙', icon: '🐉', hp: 300, atk: 35, mechanic: { name: '龙息', desc: '每4回合大量伤害' } },
        { id: 'reaper', name: '死神', icon: '💀', hp: 250, atk: 30, mechanic: { name: '死亡凝视', desc: 'HP<50%有即死概率' } },
        { id: 'archdemon', name: '大恶魔', icon: '👿', hp: 320, atk: 33, mechanic: { name: '地狱火', desc: '每3回合造成大量伤害' } },
        { id: 'lightning_dragon', name: '雷龙', icon: '⚡', hp: 280, atk: 38, mechanic: { name: '雷霆', desc: '攻击有概率眩晕' } },
        { id: 'hydra', name: '九头蛇', icon: '🐍', hp: 350, atk: 31, mechanic: { name: '再生之头', desc: 'HP减少时攻击力提升' } },
        { id: 'phoenix', name: '凤凰', icon: '🦅', hp: 260, atk: 36, mechanic: { name: '重生', desc: '死亡时复活一次' } },
        { id: 'kraken', name: '海妖', icon: '🐙', hp: 380, atk: 29, mechanic: { name: '触手', desc: '每2回合额外攻击' } },
        { id: 'cerberus', name: '三头犬', icon: '🐕', hp: 290, atk: 34, mechanic: { name: '三头攻击', desc: '攻击3次' } }
    ],
    final_boss: [
        { id: 'demon_lord', name: '魔王', icon: '👿', hp: 400, atk: 40, mechanic: { name: '黑暗降临', desc: '每3回合混乱' } },
        { id: 'chaos_lord', name: '混沌之主', icon: '🌑', hp: 450, atk: 45, mechanic: { name: '混沌之力', desc: '随机强力技能' } },
        { id: 'ancient_dragon', name: '远古巨龙', icon: '🐲', hp: 500, atk: 50, mechanic: { name: '远古之火', desc: 'HP<30%狂暴' } },
        { id: 'void_elder', name: '虚空长老', icon: '🌌', hp: 480, atk: 42, mechanic: { name: '虚空吞噬', desc: '消耗玩家能量' } },
        { id: 'world_eater', name: '世界吞噬者', icon: '🌍', hp: 600, atk: 55, mechanic: { name: '末日降临', desc: '每5回合造成巨额伤害' } }
    ]
};

// ==================== 卡牌效果系统 ====================
const dungeonCardEffects = {
    attack: { name: '攻击', desc: '造成基础伤害', type: 'attack', power: 1, cost: 1 },
    heavy_attack: { name: '重击', desc: '造成1.5倍伤害', type: 'attack', power: 1.5, cost: 2 },
    double_attack: { name: '连击', desc: '攻击两次', type: 'attack', power: 1, hits: 2, cost: 2 },
    triple_attack: { name: '三连击', desc: '攻击三次', type: 'attack', power: 1, hits: 3, cost: 3 },
    critical: { name: '暴击', desc: '必定暴击', type: 'attack', power: 1.5, crit: true, cost: 2 },
    super_critical: { name: '超级暴击', desc: '必定三倍暴击', type: 'attack', power: 3, crit: true, cost: 3 },
    heal: { name: '治愈', desc: '恢复20%HP', type: 'heal', amount: 0.2, cost: 1 },
    big_heal: { name: '大治愈', desc: '恢复40%HP', type: 'heal', amount: 0.4, cost: 2 },
    full_heal: { name: '完全治愈', desc: '恢复全部HP', type: 'heal', amount: 1, cost: 4 },
    regeneration: { name: '再生', desc: '每回合恢复10%HP', type: 'buff', effect: 'regen', cost: 2 },
    shield: { name: '护盾', desc: '下次伤害减半', type: 'defense', effect: 'shield', cost: 1 },
    big_shield: { name: '大护盾', desc: '下次伤害减至25%', type: 'defense', effect: 'big_shield', cost: 2 },
    damage_immunity: { name: '免疫', desc: '本回合免疫伤害', type: 'defense', effect: 'immunity', cost: 3 },
    fireball: { name: '火球', desc: '造成伤害并燃烧', type: 'attack', power: 1.5, element: 'fire', cost: 2 },
    ice_shield: { name: '冰盾', desc: '获得护盾并冻结敌人', type: 'defense', effect: 'ice_shield', cost: 2 },
    thunder: { name: '雷霆', desc: '造成伤害并有概率眩晕', type: 'attack', power: 1.3, element: 'thunder', cost: 2 },
    poison: { name: '剧毒', desc: '敌人每回合损失10%HP', type: 'debuff', effect: 'poison', cost: 1 },
    super_poison: { name: '致命剧毒', desc: '敌人每回合损失20%HP', type: 'debuff', effect: 'super_poison', cost: 2 },
    stun: { name: '眩晕', desc: '敌人跳过下回合', type: 'control', effect: 'stun', cost: 2 },
    sleep: { name: '催眠', desc: '敌人跳过两回合', type: 'control', effect: 'sleep', cost: 3 },
    power_up: { name: '强化', desc: '下次攻击伤害翻倍', type: 'buff', effect: 'power_up', cost: 1 },
    damage_boost: { name: '伤害提升', desc: '所有伤害提升30%', type: 'buff', effect: 'damage_boost', cost: 2 },
    draw: { name: '抽牌', desc: '额外抽2张牌', type: 'resource', effect: 'draw', amount: 2, cost: 1 },
    big_draw: { name: '大抽牌', desc: '额外抽4张牌', type: 'resource', effect: 'draw', amount: 4, cost: 2 },
    refresh: { name: '刷新', desc: '抽满手牌', type: 'resource', effect: 'refresh', cost: 3 },
    energy_restore: { name: '能量恢复', desc: '恢复2点能量', type: 'resource', effect: 'energy', amount: 2, cost: 0 },
    full_energy: { name: '能量满格', desc: '能量恢复至满', type: 'resource', effect: 'full_energy', cost: 0 },
    lifesteal: { name: '吸血', desc: '回复造成伤害的50%', type: 'attack', power: 1, lifesteal: 0.5, cost: 2 },
    big_lifesteal: { name: '大吸血', desc: '回复造成伤害的100%', type: 'attack', power: 1, lifesteal: 1, cost: 3 },
    time_warp: { name: '时间扭曲', desc: '获得额外回合', type: 'special', effect: 'extra_turn', cost: 4 },
    holy_light: { name: '圣光', desc: '恢复HP并净化负面效果', type: 'heal', amount: 0.3, cleanse: true, cost: 3 },
    rage: { name: '狂暴', desc: '攻击+50%但受到伤害+30%', type: 'buff', effect: 'rage', cost: 2 },
    counter: { name: '反击', desc: '反弹下次50%伤害', type: 'defense', effect: 'counter', rate: 0.5, cost: 1 },
    big_counter: { name: '大反击', desc: '反弹下次100%伤害', type: 'defense', effect: 'big_counter', rate: 1, cost: 2 },
    curse: { name: '诅咒', desc: '敌人攻击-30%持续3回合', type: 'debuff', effect: 'curse', rate: 0.3, cost: 2 },
    arcane_missiles: { name: '奥术飞弹', desc: '随机造成3-5次伤害', type: 'attack', power: 0.8, hits: 4, random: true, cost: 2 },
    void_rift: { name: '虚空裂隙', desc: '造成2倍伤害但自己也受到50%伤害', type: 'attack', power: 2, selfDamage: 0.5, cost: 3 },
    phoenix_blessing: { name: '凤凰祝福', desc: '下次死亡时复活并恢复50%HP', type: 'buff', effect: 'phoenix', cost: 3 },
    chaos_storm: { name: '混沌风暴', desc: '随机触发3种不同效果', type: 'special', effect: 'chaos', cost: 4 },
    guardian_angel: { name: '守护天使', desc: '本回合免疫伤害并恢复20%HP', type: 'defense', effect: 'guardian', amount: 0.2, cost: 3 },
    blood_pact: { name: '血之契约', desc: '消耗30%HP，造成4倍伤害', type: 'attack', power: 4, selfCost: 0.3, cost: 2 },
    arcane_blast: { name: '奥术冲击', desc: '造成1.8倍伤害并消耗所有能量造成额外伤害', type: 'attack', power: 1.8, allEnergy: true, cost: 1 },
    execute: { name: '处决', desc: '敌人HP<30%时造成双倍伤害', type: 'attack', power: 1.2, execute: true, cost: 2 },
    berserker_strike: { name: '狂战士突袭', desc: 'HP越低伤害越高', type: 'attack', power: 1, berserk: true, cost: 2 },
    shadow_step: { name: '暗影步', desc: '闪避下次攻击', type: 'defense', effect: 'dodge', cost: 1 },
    holy_wrath: { name: '神圣之怒', desc: '造成伤害并恢复伤害值的50%HP', type: 'attack', power: 1.4, holy: true, cost: 3 },
    necrotic_touch: { name: '死灵之触', desc: '造成伤害并将伤害值的30%转化为护盾', type: 'attack', power: 1.3, necrotic: true, cost: 2 },
    elemental_fusion: { name: '元素融合', desc: '造成火冰雷三种元素伤害', type: 'attack', power: 1.2, element: 'fusion', cost: 3 },
    adrenaline: { name: '肾上腺素', desc: '获得2点能量并抽2张牌', type: 'resource', effect: 'adrenaline', cost: 1 },
    meditation: { name: '冥想', desc: '下回合开始时获得4点能量', type: 'buff', effect: 'meditation', cost: 2 },
    weakness: { name: '虚弱', desc: '敌人下次攻击减半', type: 'debuff', effect: 'weakness', cost: 2 },
    quick_strike: { name: '快速打击', desc: '造成0.8倍伤害但获得1点能量', type: 'attack', power: 0.8, quick: true, cost: 0 },
    massive_blow: { name: '猛击', desc: '造成2.5倍伤害但消耗所有能量', type: 'attack', power: 2.5, massive: true, cost: 1 },
    mirror_image: { name: '镜像', desc: '下次受到伤害时反弹50%', type: 'defense', effect: 'mirror', cost: 2 },
    thunderstorm: { name: '雷暴', desc: '造成伤害并有50%概率眩晕', type: 'attack', power: 1.6, element: 'thunderstorm', cost: 3 },
    inferno: { name: '地狱火', desc: '造成高额燃烧伤害', type: 'attack', power: 1.1, element: 'inferno', cost: 2 },
    frost_nova: { name: '冰霜新星', desc: '冻结敌人并造成伤害', type: 'attack', power: 1, element: 'frost', cost: 2 },
    vampiric_aura: { name: '吸血光环', desc: '接下来3次攻击都附带吸血', type: 'buff', effect: 'vampiric', cost: 3 },
    defensive_stance: { name: '防御姿态', desc: '受到伤害减少50%但攻击减少30%', type: 'buff', effect: 'defensive', cost: 2 },
    final_gambit: { name: '最后一搏', desc: '将HP降至1，造成3倍伤害', type: 'attack', power: 3, final: true, cost: 2 }
};

// ==================== 房间类型 ====================
const roomTypes = {
    encounter: { name: '遭遇战', icon: '⚔️', color: '#ef4444', desc: '遭遇普通敌人' },
    elite_encounter: { name: '精英战', icon: '💀', color: '#a855f7', desc: '遭遇精英敌人' },
    boss: { name: 'Boss战', icon: '👑', color: '#fbbf24', desc: '挑战Boss' },
    camp: { name: '营地', icon: '🏕️', color: '#10b981', desc: '休息回复' },
    merchant: { name: '商店', icon: '🏪', color: '#3b82f6', desc: '购买物品' },
    special: { name: '特殊房间', icon: '❓', color: '#8b5cf6', desc: '完成事件' },
    reward: { name: '奖励房间', icon: '🎁', color: '#f59e0b', desc: '选择奖励' },
    rest: { name: '休息站', icon: '🛏️', color: '#06b6d4', desc: '完全恢复' },
    shrine: { name: '神殿', icon: '⛪', color: '#ec4899', desc: '获得祝福' },
    trap: { name: '陷阱', icon: '⚠️', color: '#dc2626', desc: '触发陷阱' },
    treasure: { name: '宝藏', icon: '💎', color: '#eab308', desc: '发现宝藏' }
};

// ==================== 商店系统 ====================
const shopItems = {
    potions: [
        { id: 'health_potion', name: '生命药水', icon: '🧪', price: 30, effect: 'heal', value: 0.3, desc: '恢复30%HP' },
        { id: 'big_health_potion', name: '大生命药水', icon: '🍷', price: 60, effect: 'heal', value: 0.6, desc: '恢复60%HP' },
        { id: 'full_health_potion', name: '完全恢复药水', icon: '🏺', price: 100, effect: 'full_heal', desc: '完全恢复HP' }
    ],
    cards: [
        { id: 'random_common', name: '随机普通卡牌', icon: '📜', price: 20, rarity: 'common', desc: '获得一张随机普通卡牌' },
        { id: 'random_rare', name: '随机稀有卡牌', icon: '📖', price: 50, rarity: 'rare', desc: '获得一张随机稀有卡牌' },
        { id: 'random_epic', name: '随机史诗卡牌', icon: '📚', price: 120, rarity: 'epic', desc: '获得一张随机史诗卡牌' }
    ],
    upgrades: [
        { id: 'max_hp_up', name: '最大HP+20', icon: '❤️', price: 80, effect: 'max_hp', value: 20, desc: '永久提高最大生命值' },
        { id: 'atk_up', name: '攻击力+5', icon: '⚔️', price: 60, effect: 'atk', value: 5, desc: '永久提高攻击力' },
        { id: 'def_up', name: '防御力+3', icon: '🛡️', price: 50, effect: 'def', value: 3, desc: '永久提高防御力' },
        { id: 'energy_up', name: '最大能量+1', icon: '⚡', price: 100, effect: 'max_energy', value: 1, desc: '永久提高最大能量' }
    ]
};

// ==================== 特殊事件 ====================
const specialEvents = [
    {
        id: 'fountain',
        name: '神秘泉水',
        icon: '⛲',
        description: '你发现了一处神秘的泉水...',
        choices: [
            { name: '喝下泉水', effect: 'random', good: { heal: 0.5, gold: 50 }, bad: { damage: 0.2 } },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'chest',
        name: '神秘宝箱',
        icon: '📦',
        description: '一个发光的宝箱躺在地上...',
        choices: [
            { name: '打开宝箱', effect: 'treasure', rewards: ['gold', 'card', 'upgrade'] },
            { name: '小心离开', effect: 'nothing' }
        ]
    },
    {
        id: 'wanderer',
        name: '流浪商人',
        icon: '🧙',
        description: '一位神秘的商人出现在你面前...',
        choices: [
            { name: '交易', effect: 'shop', price: 30 },
            { name: '无视', effect: 'nothing' }
        ]
    },
    {
        id: 'altar',
        name: '古老祭坛',
        icon: '🔮',
        description: '一座古老的祭坛散发着神秘的光芒...',
        choices: [
            { name: '献祭HP', effect: 'sacrifice', cost: 0.3, reward: 'power_up' },
            { name: '献祭金币', effect: 'gold_sacrifice', cost: 50, reward: 'card' },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'well',
        name: '许愿井',
        icon: '💫',
        description: '你发现了一口许愿井...',
        choices: [
            { name: '投入金币许愿', effect: 'wish', cost: 20, wishType: 'random' },
            { name: '喝掉井水', effect: 'drink', effectType: 'heal', value: 0.2 },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'library',
        name: '神秘图书馆',
        icon: '📚',
        description: '一座古老的图书馆出现在你面前...',
        choices: [
            { name: '翻阅魔法书', effect: 'learn_spell' },
            { name: '寻找古老知识', effect: 'upgrade' },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'blacksmith',
        name: '铁匠铺',
        icon: '⚒️',
        description: '一位铁匠正在打铁...',
        choices: [
            { name: '强化武器', effect: 'weapon_upgrade', cost: 40 },
            { name: '修复护甲', effect: 'armor_upgrade', cost: 30 },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'shrine',
        name: '古老神殿',
        icon: '⛪',
        description: '神殿散发着神圣的光芒...',
        choices: [
            { name: '祈祷祝福', effect: 'blessing' },
            { name: '献祭获得力量', effect: 'power_sacrifice', cost: 0.25 },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'gambling_den',
        name: '赌场',
        icon: '🎰',
        description: '一个神秘的赌场出现在你面前...',
        choices: [
            { name: '小试身手 (20金币)', effect: 'gamble', cost: 20, multiplier: 2 },
            { name: '豪赌一把 (50金币)', effect: 'gamble', cost: 50, multiplier: 3 },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'mystic_merchant',
        name: '神秘商人',
        icon: '🎭',
        description: '一位戴着面具的商人向你招手...',
        choices: [
            { name: '购买神秘卡牌 (80金币)', effect: 'mystery_card', cost: 80 },
            { name: '购买强化物品 (60金币)', effect: 'mystery_upgrade', cost: 60 },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'garden',
        name: '秘密花园',
        icon: '🌺',
        description: '一座美丽的花园出现在你面前...',
        choices: [
            { name: '采摘治愈之花', effect: 'heal_flower', heal: 0.4 },
            { name: '寻找力量果实', effect: 'power_fruit', atk: 3 },
            { name: '离开', effect: 'nothing' }
        ]
    },
    {
        id: 'fairy',
        name: '妖精之泉',
        icon: '🧚',
        description: '一只小妖精在泉水边跳舞...',
        choices: [
            { name: '请求妖精的帮助', effect: 'fairy_help' },
            { name: '捕捉妖精', effect: 'fairy_catch', risk: true },
            { name: '安静离开', effect: 'nothing' }
        ]
    },
    {
        id: 'tomb',
        name: '古老墓穴',
        icon: '⚰️',
        description: '一座阴森的墓穴出现在你面前...',
        choices: [
            { name: '探索墓穴', effect: 'tomb_explore' },
            { name: '谨慎离开', effect: 'nothing' }
        ]
    },
    {
        id: 'crystal_cave',
        name: '水晶洞穴',
        icon: '💎',
        description: '洞穴中闪烁着水晶的光芒...',
        choices: [
            { name: '采集水晶', effect: 'crystal_collect' },
            { name: '寻找宝藏', effect: 'crystal_treasure' },
            { name: '离开', effect: 'nothing' }
        ]
    }
];

// ==================== 难度配置 ====================
const difficultyConfig = {
    easy: { hpMod: 0.7, atkMod: 0.8, goldMod: 1.2, startEnergy: 4 },
    normal: { hpMod: 1, atkMod: 1, goldMod: 1, startEnergy: 3 },
    hard: { hpMod: 1.3, atkMod: 1.2, goldMod: 1.5, startEnergy: 3 },
    nightmare: { hpMod: 1.5, atkMod: 1.5, goldMod: 2, startEnergy: 2 }
};

// ==================== 成就系统 ====================
const dungeonAchievements = {
    first_victory: {
        id: 'first_victory',
        name: '初次胜利',
        desc: '击败第一个敌人',
        icon: '⚔️',
        rarity: 'common',
        condition: (stats) => stats.kills >= 1
    },
    killer_10: {
        id: 'killer_10',
        name: '初露锋芒',
        desc: '累计击杀10个敌人',
        icon: '🗡️',
        rarity: 'common',
        condition: (stats) => stats.kills >= 10
    },
    killer_50: {
        id: 'killer_50',
        name: '杀戮机器',
        desc: '累计击杀50个敌人',
        icon: '💀',
        rarity: 'rare',
        condition: (stats) => stats.kills >= 50
    },
    killer_100: {
        id: 'killer_100',
        name: '死神降临',
        desc: '累计击杀100个敌人',
        icon: '☠️',
        rarity: 'epic',
        condition: (stats) => stats.kills >= 100
    },
    floor_5: {
        id: 'floor_5',
        name: '初入地下城',
        desc: '到达第5层',
        icon: '🏔️',
        rarity: 'common',
        condition: (stats) => stats.maxFloor >= 5
    },
    floor_10: {
        id: 'floor_10',
        name: '深入探索',
        desc: '到达第10层',
        icon: '⛰️',
        rarity: 'rare',
        condition: (stats) => stats.maxFloor >= 10
    },
    floor_20: {
        id: 'floor_20',
        name: '征服地下城',
        desc: '到达第20层',
        icon: '🏛️',
        rarity: 'epic',
        condition: (stats) => stats.maxFloor >= 20
    },
    victory: {
        id: 'victory',
        name: '通关成功',
        desc: '完成一次完整的游戏',
        icon: '🏆',
        rarity: 'legendary',
        condition: (stats) => stats.victories >= 1
    },
    all_classes: {
        id: 'all_classes',
        name: '全职业大师',
        desc: '使用所有职业各通关一次',
        icon: '👑',
        rarity: 'legendary',
        condition: (stats) => stats.classPlayed && Object.keys(dungeonClasses).every(c => stats.classPlayed[c])
    },
    gold_500: {
        id: 'gold_500',
        name: '财富积累',
        desc: '累计获得500金币',
        icon: '💰',
        rarity: 'common',
        condition: (stats) => stats.totalGold >= 500
    },
    gold_2000: {
        id: 'gold_2000',
        name: '富可敌国',
        desc: '累计获得2000金币',
        icon: '🪙',
        rarity: 'epic',
        condition: (stats) => stats.totalGold >= 2000
    },
    cards_100: {
        id: 'cards_100',
        name: '卡牌大师',
        desc: '累计打出100张卡牌',
        icon: '🃏',
        rarity: 'common',
        condition: (stats) => stats.cardsPlayed >= 100
    },
    cards_500: {
        id: 'cards_500',
        name: '卡牌宗师',
        desc: '累计打出500张卡牌',
        icon: '🎴',
        rarity: 'rare',
        condition: (stats) => stats.cardsPlayed >= 500
    },
    damage_1000: {
        id: 'damage_1000',
        name: '伤害输出',
        desc: '累计造成1000点伤害',
        icon: '💥',
        rarity: 'common',
        condition: (stats) => stats.totalDamage >= 1000
    },
    damage_5000: {
        id: 'damage_5000',
        name: '毁灭者',
        desc: '累计造成5000点伤害',
        icon: '💣',
        rarity: 'epic',
        condition: (stats) => stats.totalDamage >= 5000
    },
    no_damage_floor: {
        id: 'no_damage_floor',
        name: '完美通关',
        desc: '不受到任何伤害通过一层',
        icon: '🛡️',
        rarity: 'rare',
        condition: (stats) => stats.perfectFloors >= 1
    },
    speed_clear: {
        id: 'speed_clear',
        name: '闪电速度',
        desc: '5分钟内通关',
        icon: '⚡',
        rarity: 'epic',
        condition: (stats) => stats.fastestClear && stats.fastestClear <= 300000
    },
    boss_slayer: {
        id: 'boss_slayer',
        name: 'Boss杀手',
        desc: '击败10个Boss',
        icon: '👑',
        rarity: 'rare',
        condition: (stats) => stats.bossKills >= 10
    },
    elite_hunter: {
        id: 'elite_hunter',
        name: '精英猎人',
        desc: '击败25个精英敌人',
        icon: '⭐',
        rarity: 'rare',
        condition: (stats) => stats.eliteKills >= 25
    },
    killer_200: {
        id: 'killer_200',
        name: '战场主宰',
        desc: '累计击杀200个敌人',
        icon: '🔥',
        rarity: 'legendary',
        condition: (stats) => stats.kills >= 200
    },
    killer_500: {
        id: 'killer_500',
        name: '传奇杀手',
        desc: '累计击杀500个敌人',
        icon: '💀',
        rarity: 'legendary',
        condition: (stats) => stats.kills >= 500
    },
    floor_15: {
        id: 'floor_15',
        name: '勇者之路',
        desc: '到达第15层',
        icon: '🗻',
        rarity: 'rare',
        condition: (stats) => stats.maxFloor >= 15
    },
    floor_25: {
        id: 'floor_25',
        name: '深渊探险家',
        desc: '到达第25层',
        icon: '🌋',
        rarity: 'epic',
        condition: (stats) => stats.maxFloor >= 25
    },
    floor_30: {
        id: 'floor_30',
        name: '地下城之王',
        desc: '到达第30层',
        icon: '🏰',
        rarity: 'legendary',
        condition: (stats) => stats.maxFloor >= 30
    },
    victories_5: {
        id: 'victories_5',
        name: '常胜将军',
        desc: '通关5次',
        icon: '🎖️',
        rarity: 'rare',
        condition: (stats) => stats.victories >= 5
    },
    victories_10: {
        id: 'victories_10',
        name: '地下城传奇',
        desc: '通关10次',
        icon: '🏅',
        rarity: 'epic',
        condition: (stats) => stats.victories >= 10
    },
    victories_25: {
        id: 'victories_25',
        name: '永恒冠军',
        desc: '通关25次',
        icon: '👑',
        rarity: 'legendary',
        condition: (stats) => stats.victories >= 25
    },
    gold_1000: {
        id: 'gold_1000',
        name: '小有积蓄',
        desc: '累计获得1000金币',
        icon: '💰',
        rarity: 'rare',
        condition: (stats) => stats.totalGold >= 1000
    },
    gold_5000: {
        id: 'gold_5000',
        name: '黄金大亨',
        desc: '累计获得5000金币',
        icon: '💎',
        rarity: 'legendary',
        condition: (stats) => stats.totalGold >= 5000
    },
    gold_10000: {
        id: 'gold_10000',
        name: '财富之神',
        desc: '累计获得10000金币',
        icon: '🏆',
        rarity: 'legendary',
        condition: (stats) => stats.totalGold >= 10000
    },
    cards_1000: {
        id: 'cards_1000',
        name: '卡牌传奇',
        desc: '累计打出1000张卡牌',
        icon: '🃏',
        rarity: 'epic',
        condition: (stats) => stats.cardsPlayed >= 1000
    },
    cards_2500: {
        id: 'cards_2500',
        name: '卡牌之神',
        desc: '累计打出2500张卡牌',
        icon: '🎴',
        rarity: 'legendary',
        condition: (stats) => stats.cardsPlayed >= 2500
    },
    damage_10000: {
        id: 'damage_10000',
        name: '破坏之王',
        desc: '累计造成10000点伤害',
        icon: '💥',
        rarity: 'rare',
        condition: (stats) => stats.totalDamage >= 10000
    },
    damage_25000: {
        id: 'damage_25000',
        name: '毁灭天使',
        desc: '累计造成25000点伤害',
        icon: '🔥',
        rarity: 'epic',
        condition: (stats) => stats.totalDamage >= 25000
    },
    damage_50000: {
        id: 'damage_50000',
        name: '末日审判',
        desc: '累计造成50000点伤害',
        icon: '☄️',
        rarity: 'legendary',
        condition: (stats) => stats.totalDamage >= 50000
    },
    perfect_floors_5: {
        id: 'perfect_floors_5',
        name: '无伤达人',
        desc: '累计5层无伤通关',
        icon: '🛡️',
        rarity: 'epic',
        condition: (stats) => stats.perfectFloors >= 5
    },
    perfect_floors_10: {
        id: 'perfect_floors_10',
        name: '完美战士',
        desc: '累计10层无伤通关',
        icon: '✨',
        rarity: 'legendary',
        condition: (stats) => stats.perfectFloors >= 10
    },
    boss_slayer_25: {
        id: 'boss_slayer_25',
        name: 'Boss终结者',
        desc: '击败25个Boss',
        icon: '👑',
        rarity: 'epic',
        condition: (stats) => stats.bossKills >= 25
    },
    boss_slayer_50: {
        id: 'boss_slayer_50',
        name: 'Boss噩梦',
        desc: '击败50个Boss',
        icon: '💀',
        rarity: 'legendary',
        condition: (stats) => stats.bossKills >= 50
    },
    elite_hunter_50: {
        id: 'elite_hunter_50',
        name: '精英克星',
        desc: '击败50个精英敌人',
        icon: '⭐',
        rarity: 'epic',
        condition: (stats) => stats.eliteKills >= 50
    },
    elite_hunter_100: {
        id: 'elite_hunter_100',
        name: '精英终结者',
        desc: '击败100个精英敌人',
        icon: '🌟',
        rarity: 'legendary',
        condition: (stats) => stats.eliteKills >= 100
    },
    speed_demon: {
        id: 'speed_demon',
        name: '极速恶魔',
        desc: '3分钟内通关',
        icon: '⚡',
        rarity: 'legendary',
        condition: (stats) => stats.fastestClear && stats.fastestClear <= 180000
    },
    lightning_run: {
        id: 'lightning_run',
        name: '闪电突袭',
        desc: '2分钟内通关',
        icon: '🌩️',
        rarity: 'legendary',
        condition: (stats) => stats.fastestClear && stats.fastestClear <= 120000
    },
    shop_regular: {
        id: 'shop_regular',
        name: '常客',
        desc: '访问商店50次',
        icon: '🏪',
        rarity: 'common',
        condition: (stats) => stats.shopVisits >= 50
    },
    shop_vip: {
        id: 'shop_vip',
        name: 'VIP客户',
        desc: '访问商店100次',
        icon: '🛒',
        rarity: 'rare',
        condition: (stats) => stats.shopVisits >= 100
    },
    big_spender: {
        id: 'big_spender',
        name: '挥金如土',
        desc: '累计花费2000金币',
        icon: '💸',
        rarity: 'rare',
        condition: (stats) => stats.goldSpent >= 2000
    },
    shopaholic: {
        id: 'shopaholic',
        name: '购物狂',
        desc: '累计花费5000金币',
        icon: '💳',
        rarity: 'epic',
        condition: (stats) => stats.goldSpent >= 5000
    },
    card_collector: {
        id: 'card_collector',
        name: '卡牌收藏家',
        desc: '收集50张不同的卡牌',
        icon: '📦',
        rarity: 'rare',
        condition: (stats) => stats.uniqueCards && stats.uniqueCards.length >= 50
    },
    card_master: {
        id: 'card_master',
        name: '卡牌大师',
        desc: '收集100张不同的卡牌',
        icon: '📚',
        rarity: 'epic',
        condition: (stats) => stats.uniqueCards && stats.uniqueCards.length >= 100
    },
    lucky_dog: {
        id: 'lucky_dog',
        name: '幸运儿',
        desc: '连续3次答题正确',
        icon: '🍀',
        rarity: 'rare',
        condition: (stats) => stats.correctStreak >= 3
    },
    quiz_master: {
        id: 'quiz_master',
        name: '答题大师',
        desc: '连续5次答题正确',
        icon: '🎯',
        rarity: 'epic',
        condition: (stats) => stats.correctStreak >= 5
    },
    vocabulary_expert: {
        id: 'vocabulary_expert',
        name: '词汇专家',
        desc: '累计答对100题',
        icon: '📖',
        rarity: 'rare',
        condition: (stats) => stats.correctAnswers >= 100
    },
    vocabulary_sage: {
        id: 'vocabulary_sage',
        name: '词汇圣人',
        desc: '累计答对500题',
        icon: '🎓',
        rarity: 'legendary',
        condition: (stats) => stats.correctAnswers >= 500
    },
    survivor: {
        id: 'survivor',
        name: '幸存者',
        desc: '以低于10%血量击败敌人',
        icon: '❤️',
        rarity: 'rare',
        condition: (stats) => stats.lowHpKills >= 1
    },
    comeback_king: {
        id: 'comeback_king',
        name: '逆转之王',
        desc: '以低于5%血量击败Boss',
        icon: '💪',
        rarity: 'epic',
        condition: (stats) => stats.lowHpBossKills >= 1
    },
    untouchable: {
        id: 'untouchable',
        name: '不可触碰',
        desc: '单局游戏无伤通关',
        icon: '👼',
        rarity: 'legendary',
        condition: (stats) => stats.flawlessVictory >= 1
    },
    warrior_master: {
        id: 'warrior_master',
        name: '战士大师',
        desc: '使用战士通关5次',
        icon: '🛡️',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.warrior >= 5
    },
    mage_master: {
        id: 'mage_master',
        name: '法师大师',
        desc: '使用法师通关5次',
        icon: '🔮',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.mage >= 5
    },
    assassin_master: {
        id: 'assassin_master',
        name: '刺客大师',
        desc: '使用刺客通关5次',
        icon: '🗡️',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.assassin >= 5
    },
    ranger_master: {
        id: 'ranger_master',
        name: '射手大师',
        desc: '使用射手通关5次',
        icon: '🏹',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.ranger >= 5
    },
    healer_master: {
        id: 'healer_master',
        name: '辅助大师',
        desc: '使用辅助通关5次',
        icon: '💚',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.healer >= 5
    },
    necromancer_master: {
        id: 'necromancer_master',
        name: '死灵法师大师',
        desc: '使用死灵法师通关5次',
        icon: '💀',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.necromancer >= 5
    },
    elementalist_master: {
        id: 'elementalist_master',
        name: '元素师大师',
        desc: '使用元素师通关5次',
        icon: '🌊',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.elementalist >= 5
    },
    berserker_master: {
        id: 'berserker_master',
        name: '狂战士大师',
        desc: '使用狂战士通关5次',
        icon: '🔥',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.berserker >= 5
    },
    monk_master: {
        id: 'monk_master',
        name: '武僧大师',
        desc: '使用武僧通关5次',
        icon: '👊',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.monk >= 5
    },
    summoner_master: {
        id: 'summoner_master',
        name: '召唤师大师',
        desc: '使用召唤师通关5次',
        icon: '🐉',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.summoner >= 5
    },
    chronomancer_master: {
        id: 'chronomancer_master',
        name: '时空法师大师',
        desc: '使用时空法师通关5次',
        icon: '⏰',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.chronomancer >= 5
    },
    druid_master: {
        id: 'druid_master',
        name: '德鲁伊大师',
        desc: '使用德鲁伊通关5次',
        icon: '🌿',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.druid >= 5
    },
    runeknight_master: {
        id: 'runeknight_master',
        name: '符文骑士大师',
        desc: '使用符文骑士通关5次',
        icon: '⚔️',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.runeknight >= 5
    },
    alchemist_master: {
        id: 'alchemist_master',
        name: '炼金术士大师',
        desc: '使用炼金术士通关5次',
        icon: '⚗️',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.alchemist >= 5
    },
    paladin_master: {
        id: 'paladin_master',
        name: '圣骑士大师',
        desc: '使用圣骑士通关5次',
        icon: '✝️',
        rarity: 'rare',
        condition: (stats) => stats.classVictories && stats.classVictories.paladin >= 5
    },
    dedicated_player: {
        id: 'dedicated_player',
        name: '忠实玩家',
        desc: '游戏总时长达到1小时',
        icon: '⏱️',
        rarity: 'common',
        condition: (stats) => stats.playTime >= 3600000
    },
    hardcore_player: {
        id: 'hardcore_player',
        name: '硬核玩家',
        desc: '游戏总时长达到5小时',
        icon: '🎮',
        rarity: 'rare',
        condition: (stats) => stats.playTime >= 18000000
    },
    legendary_player: {
        id: 'legendary_player',
        name: '传奇玩家',
        desc: '游戏总时长达到10小时',
        icon: '🌟',
        rarity: 'legendary',
        condition: (stats) => stats.playTime >= 36000000
    },
    deck_builder: {
        id: 'deck_builder',
        name: '卡组构建者',
        desc: '创建5个自定义卡组',
        icon: '📝',
        rarity: 'rare',
        condition: (stats) => stats.customDecks >= 5
    },
    deck_master: {
        id: 'deck_master',
        name: '卡组大师',
        desc: '创建10个自定义卡组',
        icon: '🏆',
        rarity: 'epic',
        condition: (stats) => stats.customDecks >= 10
    },
    save_master: {
        id: 'save_master',
        name: '存档达人',
        desc: '创建10个存档',
        icon: '💾',
        rarity: 'common',
        condition: (stats) => stats.totalSaves >= 10
    },
    save_collector: {
        id: 'save_collector',
        name: '存档收藏家',
        desc: '创建50个存档',
        icon: '💿',
        rarity: 'rare',
        condition: (stats) => stats.totalSaves >= 50
    },
    event_explorer: {
        id: 'event_explorer',
        name: '事件探索者',
        desc: '触发20个特殊事件',
        icon: '🎪',
        rarity: 'common',
        condition: (stats) => stats.specialEvents >= 20
    },
    event_master: {
        id: 'event_master',
        name: '事件大师',
        desc: '触发50个特殊事件',
        icon: '🎭',
        rarity: 'rare',
        condition: (stats) => stats.specialEvents >= 50
    },
    critical_master: {
        id: 'critical_master',
        name: '暴击大师',
        desc: '累计造成100次暴击',
        icon: '💥',
        rarity: 'rare',
        condition: (stats) => stats.criticalHits >= 100
    },
    critical_legend: {
        id: 'critical_legend',
        name: '暴击传说',
        desc: '累计造成500次暴击',
        icon: '⚡',
        rarity: 'legendary',
        condition: (stats) => stats.criticalHits >= 500
    },
    dodge_master: {
        id: 'dodge_master',
        name: '闪避大师',
        desc: '累计闪避50次攻击',
        icon: '💨',
        rarity: 'rare',
        condition: (stats) => stats.dodges >= 50
    },
    iron_will: {
        id: 'iron_will',
        name: '钢铁意志',
        desc: '在血量低于20%时击败10个敌人',
        icon: '🦾',
        rarity: 'epic',
        condition: (stats) => stats.lowHpKills >= 10
    },
    first_blood: {
        id: 'first_blood',
        name: '首杀',
        desc: '在第一层击败第一个敌人',
        icon: '🩸',
        rarity: 'common',
        condition: (stats) => stats.firstFloorKills >= 1
    },
    floor_clearer: {
        id: 'floor_clearer',
        name: '楼层清理者',
        desc: '单层击败5个敌人',
        icon: '🧹',
        rarity: 'common',
        condition: (stats) => stats.maxFloorKills >= 5
    },
    room_explorer: {
        id: 'room_explorer',
        name: '房间探索者',
        desc: '进入100个房间',
        icon: '🚪',
        rarity: 'common',
        condition: (stats) => stats.roomsVisited >= 100
    },
    room_master: {
        id: 'room_master',
        name: '房间大师',
        desc: '进入500个房间',
        icon: '🏠',
        rarity: 'rare',
        condition: (stats) => stats.roomsVisited >= 500
    },
    treasure_hunter: {
        id: 'treasure_hunter',
        name: '宝藏猎人',
        desc: '打开50个宝箱',
        icon: '📦',
        rarity: 'rare',
        condition: (stats) => stats.chestsOpened >= 50
    },
    treasure_master: {
        id: 'treasure_master',
        name: '宝藏大师',
        desc: '打开100个宝箱',
        icon: '🎁',
        rarity: 'epic',
        condition: (stats) => stats.chestsOpened >= 100
    },
    potion_user: {
        id: 'potion_user',
        name: '药剂使用者',
        desc: '使用25瓶药水',
        icon: '🧪',
        rarity: 'common',
        condition: (stats) => stats.potionsUsed >= 25
    },
    potion_master: {
        id: 'potion_master',
        name: '药剂大师',
        desc: '使用100瓶药水',
        icon: '⚗️',
        rarity: 'rare',
        condition: (stats) => stats.potionsUsed >= 100
    },
    card_upgrader: {
        id: 'card_upgrader',
        name: '卡牌强化者',
        desc: '强化25张卡牌',
        icon: '⬆️',
        rarity: 'common',
        condition: (stats) => stats.cardsUpgraded >= 25
    },
    card_enhancer: {
        id: 'card_enhancer',
        name: '卡牌增幅师',
        desc: '强化100张卡牌',
        icon: '📈',
        rarity: 'rare',
        condition: (stats) => stats.cardsUpgraded >= 100
    }
};

let dungeonStats = {
    kills: 0,
    maxFloor: 1,
    victories: 0,
    classPlayed: {},
    totalGold: 0,
    cardsPlayed: 0,
    totalDamage: 0,
    perfectFloors: 0,
    fastestClear: null,
    bossKills: 0,
    eliteKills: 0,
    unlockedAchievements: [],
    shopVisits: 0,
    goldSpent: 0,
    uniqueCards: [],
    correctStreak: 0,
    correctAnswers: 0,
    lowHpKills: 0,
    lowHpBossKills: 0,
    flawlessVictory: 0,
    classVictories: {},
    playTime: 0,
    customDecks: 0,
    totalSaves: 0,
    specialEvents: 0,
    criticalHits: 0,
    dodges: 0,
    firstFloorKills: 0,
    maxFloorKills: 0,
    roomsVisited: 0,
    chestsOpened: 0,
    potionsUsed: 0,
    cardsUpgraded: 0
};

function loadDungeonStats() {
    const saved = localStorage.getItem('dungeonStats');
    if (saved) {
        try {
            dungeonStats = Object.assign(dungeonStats, JSON.parse(saved));
        } catch (e) {
            console.log('加载统计数据失败');
        }
    }
}

function saveDungeonStats() {
    localStorage.setItem('dungeonStats', JSON.stringify(dungeonStats));
}

function updateStats(type, value = 1) {
    switch (type) {
        case 'kill':
            dungeonStats.kills += value;
            break;
        case 'floor':
            if (value > dungeonStats.maxFloor) {
                dungeonStats.maxFloor = value;
            }
            break;
        case 'victory':
            dungeonStats.victories += value;
            break;
        case 'class':
            dungeonStats.classPlayed[value] = true;
            break;
        case 'gold':
            dungeonStats.totalGold += value;
            break;
        case 'cards':
            dungeonStats.cardsPlayed += value;
            break;
        case 'damage':
            dungeonStats.totalDamage += value;
            break;
        case 'perfect':
            dungeonStats.perfectFloors += value;
            break;
        case 'time':
            if (!dungeonStats.fastestClear || value < dungeonStats.fastestClear) {
                dungeonStats.fastestClear = value;
            }
            break;
        case 'boss':
            dungeonStats.bossKills += value;
            break;
        case 'elite':
            dungeonStats.eliteKills += value;
            break;
        case 'shopVisit':
            dungeonStats.shopVisits += value;
            break;
        case 'goldSpent':
            dungeonStats.goldSpent += value;
            break;
        case 'uniqueCard':
            if (!dungeonStats.uniqueCards.includes(value)) {
                dungeonStats.uniqueCards.push(value);
            }
            break;
        case 'correctAnswer':
            dungeonStats.correctAnswers += value;
            dungeonStats.correctStreak += value;
            break;
        case 'wrongAnswer':
            dungeonStats.correctStreak = 0;
            break;
        case 'lowHpKill':
            dungeonStats.lowHpKills += value;
            break;
        case 'lowHpBossKill':
            dungeonStats.lowHpBossKills += value;
            break;
        case 'flawless':
            dungeonStats.flawlessVictory += value;
            break;
        case 'classVictory':
            if (!dungeonStats.classVictories[value]) {
                dungeonStats.classVictories[value] = 0;
            }
            dungeonStats.classVictories[value]++;
            break;
        case 'playTime':
            dungeonStats.playTime += value;
            break;
        case 'customDeck':
            dungeonStats.customDecks += value;
            break;
        case 'save':
            dungeonStats.totalSaves += value;
            break;
        case 'specialEvent':
            dungeonStats.specialEvents += value;
            break;
        case 'critical':
            dungeonStats.criticalHits += value;
            break;
        case 'dodge':
            dungeonStats.dodges += value;
            break;
        case 'firstFloorKill':
            dungeonStats.firstFloorKills += value;
            break;
        case 'floorKill':
            if (value > dungeonStats.maxFloorKills) {
                dungeonStats.maxFloorKills = value;
            }
            break;
        case 'room':
            dungeonStats.roomsVisited += value;
            break;
        case 'chest':
            dungeonStats.chestsOpened += value;
            break;
        case 'potion':
            dungeonStats.potionsUsed += value;
            break;
        case 'upgrade':
            dungeonStats.cardsUpgraded += value;
            break;
    }
    saveDungeonStats();
    checkAchievements();
}

function checkAchievements() {
    Object.values(dungeonAchievements).forEach(achievement => {
        if (!dungeonStats.unlockedAchievements.includes(achievement.id)) {
            if (achievement.condition(dungeonStats)) {
                unlockDungeonAchievement(achievement.id);
            }
        }
    });
}

function unlockDungeonAchievement(achievementId) {
    if (dungeonStats.unlockedAchievements.includes(achievementId)) return;
    
    dungeonStats.unlockedAchievements.push(achievementId);
    saveDungeonStats();
    
    const achievement = dungeonAchievements[achievementId];
    if (achievement) {
        showAchievementNotification(achievement);
    }
}

function showAchievementNotification(achievement) {
    let notification = document.getElementById('achievement-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'achievement-notification';
        notification.className = 'achievement-notification';
        document.body.appendChild(notification);
    }
    
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <span class="achievement-icon">${achievement.icon}</span>
            <div class="achievement-info">
                <div class="achievement-title">成就解锁！</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        </div>
    `;
    
    notification.classList.add('show');
    playDungeonSound('success');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function showAchievementsPanel() {
    let panel = document.getElementById('achievements-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'achievements-panel';
        panel.className = 'achievements-panel';
        document.querySelector('.dungeon-container').appendChild(panel);
    }
    
    let html = `
        <div class="achievements-content">
            <div class="achievements-header">
                <h2>🏆 成就</h2>
                <div class="achievements-count">
                    ${dungeonStats.unlockedAchievements.length} / ${Object.keys(dungeonAchievements).length}
                </div>
                <button class="achievements-close" onclick="closeAchievementsPanel()">×</button>
            </div>
            <div class="achievements-grid">
    `;
    
    Object.values(dungeonAchievements).forEach(achievement => {
        const unlocked = dungeonStats.unlockedAchievements.includes(achievement.id);
        html += `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}">
                <span class="achievement-card-icon">${unlocked ? achievement.icon : '🔒'}</span>
                <div class="achievement-card-info">
                    <div class="achievement-card-name">${achievement.name}</div>
                    <div class="achievement-card-desc">${achievement.desc}</div>
                </div>
                <div class="achievement-card-rarity">${getRarityName(achievement.rarity)}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    panel.innerHTML = html;
    panel.classList.add('show');
    playDungeonSound('open');
}

function closeAchievementsPanel() {
    const panel = document.getElementById('achievements-panel');
    if (panel) {
        panel.classList.remove('show');
    }
    playDungeonSound('close');
}

// ==================== 存档管理 ====================
let saveSlots = [];
let customDecks = [];
let collectedCards = [];

function loadSaveSlots() {
    const saved = localStorage.getItem('dungeonSaveSlots');
    if (saved) {
        try {
            saveSlots = JSON.parse(saved);
        } catch (e) {
            saveSlots = [];
        }
    }
    
    while (saveSlots.length < GAME_CONFIG.MAX_SAVE_SLOTS) {
        saveSlots.push({ empty: true, slot: saveSlots.length + 1 });
    }
}

function saveSaveSlots() {
    localStorage.setItem('dungeonSaveSlots', JSON.stringify(saveSlots));
}

function loadCustomDecks() {
    const saved = localStorage.getItem('dungeonCustomDecks');
    if (saved) {
        try {
            customDecks = JSON.parse(saved);
        } catch (e) {
            customDecks = [];
        }
    }
}

function saveCustomDecks() {
    localStorage.setItem('dungeonCustomDecks', JSON.stringify(customDecks));
}

function loadCollectedCards() {
    const saved = localStorage.getItem('dungeonCollectedCards');
    if (saved) {
        try {
            collectedCards = JSON.parse(saved);
        } catch (e) {
            collectedCards = [];
        }
    }
}

function saveCollectedCards() {
    localStorage.setItem('dungeonCollectedCards', JSON.stringify(collectedCards));
}

// ==================== 音效系统 ====================
function playDungeonSound(soundName) {
    if (!dungeonGameState.soundEnabled) return;
    
    const soundMap = {
        cardPlay: 'card',
        attack: 'attack',
        heal: 'heal',
        victory: 'victory',
        defeat: 'defeat',
        button: 'button',
        damage: 'damage',
        gold: 'gold',
        select: 'select',
        hover: 'hover',
        open: 'open',
        close: 'close',
        success: 'success',
        error: 'error',
        levelup: 'levelup',
        buff: 'buff',
        debuff: 'debuff',
        shield: 'shield',
        critical: 'critical',
        draw: 'draw',
        energy: 'energy',
        shop: 'shop',
        camp: 'camp',
        menu: 'menu'
    };
    
    const mappedSound = soundMap[soundName] || 'button';
    playGameSound(mappedSound);
}

function playGameSound(type) {
    if (!dungeonGameState.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const sounds = {
            card: { freq: 440, duration: 0.1, type: 'sine' },
            attack: { freq: 220, duration: 0.15, type: 'sawtooth' },
            heal: { freq: 523, duration: 0.2, type: 'sine' },
            victory: { freq: 659, duration: 0.3, type: 'sine' },
            defeat: { freq: 196, duration: 0.4, type: 'sawtooth' },
            button: { freq: 880, duration: 0.05, type: 'sine' },
            damage: { freq: 150, duration: 0.1, type: 'square' },
            gold: { freq: 1047, duration: 0.1, type: 'sine' },
            select: { freq: 660, duration: 0.08, type: 'sine' },
            hover: { freq: 1000, duration: 0.03, type: 'sine' },
            open: { freq: 523, duration: 0.12, type: 'triangle' },
            close: { freq: 392, duration: 0.1, type: 'triangle' },
            success: { freq: 784, duration: 0.15, type: 'sine' },
            error: { freq: 200, duration: 0.2, type: 'square' },
            levelup: { freq: 880, duration: 0.25, type: 'sine' },
            buff: { freq: 587, duration: 0.12, type: 'triangle' },
            debuff: { freq: 294, duration: 0.12, type: 'sawtooth' },
            shield: { freq: 440, duration: 0.15, type: 'triangle' },
            critical: { freq: 880, duration: 0.1, type: 'sawtooth' },
            draw: { freq: 494, duration: 0.08, type: 'sine' },
            energy: { freq: 698, duration: 0.1, type: 'sine' },
            shop: { freq: 784, duration: 0.12, type: 'triangle' },
            camp: { freq: 392, duration: 0.2, type: 'sine' },
            menu: { freq: 523, duration: 0.08, type: 'sine' }
        };
        
        const sound = sounds[type] || sounds.button;
        
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// ==================== 初始化函数 ====================
function initDungeonNew() {
    loadSaveSlots();
    loadCustomDecks();
    loadCollectedCards();
    loadDungeonStats();
    generateClassSelection();
    generateDeckSelection();
    setupEventListeners();
    setupGameMenuListeners();
    setupDeckSelectionEvents();
    initMarket();
}

// 生成职业选择
function generateClassSelection() {
    const grid = document.getElementById('class-selection-grid');
    if (!grid) return;
    
    let html = '';
    Object.values(dungeonClasses).forEach(cls => {
        html += `
            <div class="class-card-premium" data-class="${cls.id}">
                <div class="class-icon-premium">${cls.icon}</div>
                <div class="class-name-premium">${cls.name}</div>
                <div class="class-stats-premium">
                    <span>❤️ ${cls.baseHP}</span>
                    <span>⚔️ ${cls.baseATK}</span>
                    <span>🛡️ ${cls.baseDEF}</span>
                </div>
                <div class="class-passive-info">
                    <strong>${cls.passive.name}:</strong> ${cls.passive.desc}
                </div>
                <div class="class-unique-info">
                    <strong>${cls.uniqueMechanic.name}:</strong> ${cls.uniqueMechanic.description}
                </div>
                <div class="class-rarity-badge ${cls.rarity}">${getRarityName(cls.rarity)}</div>
            </div>
        `;
    });
    grid.innerHTML = html;
    
    grid.querySelectorAll('.class-card-premium').forEach(card => {
        card.addEventListener('click', function() {
            grid.querySelectorAll('.class-card-premium').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            dungeonGameState.playerClass = this.dataset.class;
            playDungeonSound('select');
        });
    });
}

function generateDeckSelection() {
    const container = document.getElementById('deck-selection');
    if (!container) return;
    
    let html = '';
    
    var collection = typeof gameState !== 'undefined' && gameState.collection ? gameState.collection : [];
    var collectionCount = collection.filter(function(c) { return c.dungeonUsable; }).length;
    
    html += `
        <div class="deck-card collection-deck" data-deck="collection">
            <div class="deck-card-icon">🎴</div>
            <div class="deck-card-name">收藏卡组</div>
            <div class="deck-card-desc">使用抽卡获得的卡牌战斗</div>
            <div class="deck-card-preview">
                ${collection.slice(0, 5).map(function(c) { 
                    var rarityClass = c.rarity || 'common';
                    return '<div class="mini-card rarity-' + rarityClass + '"></div>'; 
                }).join('')}
            </div>
            <div class="deck-card-count">${collectionCount} 张可用卡牌</div>
        </div>
    `;
    
    Object.values(defaultDecks).forEach(deck => {
        html += `
            <div class="deck-card" data-deck="${deck.id}">
                <div class="deck-card-icon">${deck.icon}</div>
                <div class="deck-card-name">${deck.name}</div>
                <div class="deck-card-desc">${deck.desc}</div>
                <div class="deck-card-preview">
                    ${deck.cards.slice(0, 5).map(() => '<div class="mini-card"></div>').join('')}
                </div>
                <div class="deck-card-count">${deck.cards.length} 张卡牌</div>
            </div>
        `;
    });
    
    customDecks.forEach((deck, index) => {
        html += `
            <div class="deck-card custom-deck" data-deck="custom_${index}">
                <div class="deck-card-icon">${deck.icon || '🎨'}</div>
                <div class="deck-card-name">${deck.name}</div>
                <div class="deck-card-desc">${deck.desc || '自定义卡组'}</div>
                <div class="deck-card-preview">
                    ${deck.cards.slice(0, 5).map(() => '<div class="mini-card"></div>').join('')}
                </div>
                <div class="deck-card-count">${deck.cards.length} 张卡牌</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.deck-card').forEach(card => {
        card.addEventListener('click', function() {
            container.querySelectorAll('.deck-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            dungeonGameState.selectedDeckId = this.dataset.deck;
            playDungeonSound('select');
        });
    });
}

// 设置事件监听
function setupEventListeners() {
    document.querySelectorAll('.mode-card-new').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.mode-card-new').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            dungeonGameState.mode = this.dataset.mode;
            playDungeonSound('select');
            
            const diffSelect = this.querySelector('.difficulty-select');
            if (diffSelect) {
                dungeonGameState.difficulty = diffSelect.value;
            }
        });
    });
    
    const classGrid = document.getElementById('class-selection-grid');
    if (classGrid) {
        classGrid.addEventListener('click', function(e) {
            const card = e.target.closest('.class-card-premium');
            if (card) {
                document.querySelectorAll('.class-card-premium').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                dungeonGameState.playerClass = card.dataset.class;
                playDungeonSound('select');
            }
        });
    }
    
    const startBtn = document.getElementById('start-dungeon-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startNewGame);
    }
    
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (endTurnBtn) {
        endTurnBtn.addEventListener('click', endTurn);
    }
    
    const drawCardBtn = document.getElementById('draw-card-btn');
    if (drawCardBtn) {
        drawCardBtn.addEventListener('click', function() {
            if (dungeonGameState.energy >= 1) {
                drawCards(1, true);
                playDungeonSound('draw');
            }
        });
    }
    
    const saveBtn = document.getElementById('save-game-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', showSaveSlotDialog);
    }
    
    const loadBtn = document.getElementById('load-game-btn');
    if (loadBtn) {
        loadBtn.addEventListener('click', showLoadSlotDialog);
    }
    
    const skipRewardBtn = document.getElementById('skip-reward-btn');
    if (skipRewardBtn) {
        skipRewardBtn.addEventListener('click', function() {
            completeRoom(currentRewardFloorIndex, currentRewardRoomIndex);
        });
    }
    
    const leaveShopBtn = document.getElementById('leave-shop-btn');
    if (leaveShopBtn) {
        leaveShopBtn.addEventListener('click', function() {
            completeRoom(currentShopFloorIndex, currentShopRoomIndex);
        });
    }
    
    const leaveCampBtn = document.getElementById('leave-camp-btn');
    if (leaveCampBtn) {
        leaveCampBtn.addEventListener('click', function() {
            completeRoom(currentCampFloorIndex, currentCampRoomIndex);
        });
    }
    
    const campRestBtn = document.getElementById('camp-rest');
    if (campRestBtn) {
        campRestBtn.addEventListener('click', function() {
            const healAmount = Math.floor(dungeonGameState.playerMaxHP * 0.3);
            dungeonGameState.playerHP = Math.min(dungeonGameState.playerMaxHP, dungeonGameState.playerHP + healAmount);
            alert(`休息成功！恢复了 ${healAmount} HP`);
            completeRoom(currentCampFloorIndex, currentCampRoomIndex);
        });
    }
    
    const gameoverRetryBtn = document.getElementById('gameover-retry-btn');
    if (gameoverRetryBtn) {
        gameoverRetryBtn.addEventListener('click', function() {
            showScreen('dungeon-home');
            resetGameState();
        });
    }
    
    const gameoverMenuBtn = document.getElementById('gameover-menu-btn');
    if (gameoverMenuBtn) {
        gameoverMenuBtn.addEventListener('click', function() {
            showScreen('dungeon-home');
            resetGameState();
        });
    }
    
    const victoryMenuBtn = document.getElementById('victory-menu-btn');
    if (victoryMenuBtn) {
        victoryMenuBtn.addEventListener('click', function() {
            showScreen('dungeon-home');
            resetGameState();
        });
    }
    
    const backFromDungeon = document.getElementById('back-from-dungeon');
    if (backFromDungeon) {
        backFromDungeon.addEventListener('click', function() {
            navigateTo('home');
        });
    }
}

// 设置游戏内菜单监听
function setupGameMenuListeners() {
    const menuBtn = document.getElementById('map-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleGameMenu);
    }
}

// 切换游戏菜单
function toggleGameMenu() {
    let menu = document.getElementById('game-menu-panel');
    
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'game-menu-panel';
        menu.className = 'game-menu-panel';
        menu.innerHTML = `
            <div class="menu-panel-content">
                <div class="menu-panel-header">
                    <span>游戏菜单</span>
                    <button class="menu-close-btn" onclick="closeGameMenu()">×</button>
                </div>
                <div class="menu-panel-items">
                    <button class="menu-item-btn" onclick="showSaveSlotDialog()">
                        <span class="menu-icon">💾</span>
                        <span>保存游戏</span>
                    </button>
                    <button class="menu-item-btn" onclick="showLoadSlotDialog()">
                        <span class="menu-icon">📂</span>
                        <span>读取存档</span>
                    </button>
                    <button class="menu-item-btn" onclick="showInventory()">
                        <span class="menu-icon">🎒</span>
                        <span>背包</span>
                    </button>
                    <button class="menu-item-btn" onclick="showDeckManager()">
                        <span class="menu-icon">🎴</span>
                        <span>卡组管理</span>
                    </button>
                    <button class="menu-item-btn" onclick="showAchievementsPanel()">
                        <span class="menu-icon">🏆</span>
                        <span>成就</span>
                    </button>
                    <button class="menu-item-btn" onclick="toggleSound()">
                        <span class="menu-icon" id="sound-icon">🔊</span>
                        <span id="sound-text">音效开关</span>
                    </button>
                    <button class="menu-item-btn" onclick="returnToHome()">
                        <span class="menu-icon">🏠</span>
                        <span>返回主页</span>
                    </button>
                </div>
            </div>
        `;
        document.querySelector('.dungeon-container').appendChild(menu);
    }
    
    const isShowing = menu.classList.toggle('show');
    playDungeonSound(isShowing ? 'menu' : 'close');
}

function closeGameMenu() {
    const menu = document.getElementById('game-menu-panel');
    if (menu) {
        menu.classList.remove('show');
        playDungeonSound('close');
    }
}

// ==================== 多存档系统 ====================
function showSaveSlotDialog() {
    closeGameMenu();
    
    let dialog = document.getElementById('save-slot-dialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'save-slot-dialog';
        dialog.className = 'save-slot-dialog';
        document.querySelector('.dungeon-container').appendChild(dialog);
    }
    
    let html = `
        <div class="save-slot-content">
            <div class="save-slot-header">
                <h3>选择存档槽</h3>
                <button class="save-slot-close" onclick="closeSaveSlotDialog()">×</button>
            </div>
            <div class="save-slots-list">
    `;
    
    saveSlots.forEach((slot, index) => {
        if (slot.empty) {
            html += `
                <div class="save-slot-item empty" onclick="saveToSlot(${index})">
                    <div class="slot-number">存档 ${index + 1}</div>
                    <div class="slot-info">空存档</div>
                    <div class="slot-action">点击保存</div>
                </div>
            `;
        } else {
            const date = new Date(slot.timestamp);
            html += `
                <div class="save-slot-item" onclick="saveToSlot(${index})">
                    <div class="slot-number">存档 ${index + 1}</div>
                    <div class="slot-info">
                        <span>${dungeonClasses[slot.playerClass]?.name || '未知'}</span>
                        <span>第 ${slot.floor} 层</span>
                        <span>HP: ${slot.playerHP}/${slot.playerMaxHP}</span>
                    </div>
                    <div class="slot-time">${date.toLocaleString()}</div>
                    <div class="slot-action">覆盖保存</div>
                </div>
            `;
        }
    });
    
    html += '</div></div>';
    dialog.innerHTML = html;
    dialog.classList.add('show');
}

function closeSaveSlotDialog() {
    const dialog = document.getElementById('save-slot-dialog');
    if (dialog) {
        dialog.classList.remove('show');
    }
}

function saveToSlot(slotIndex) {
    const saveData = {
        state: JSON.parse(JSON.stringify(dungeonGameState)),
        timestamp: Date.now(),
        playerClass: dungeonGameState.playerClass,
        floor: dungeonGameState.floor,
        playerHP: dungeonGameState.playerHP,
        playerMaxHP: dungeonGameState.playerMaxHP,
        empty: false
    };
    
    saveSlots[slotIndex] = saveData;
    saveSaveSlots();
    
    alert(`游戏已保存到存档 ${slotIndex + 1}！`);
    closeSaveSlotDialog();
}

function showLoadSlotDialog() {
    closeGameMenu();
    
    let dialog = document.getElementById('load-slot-dialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'load-slot-dialog';
        dialog.className = 'save-slot-dialog';
        document.querySelector('.dungeon-container').appendChild(dialog);
    }
    
    let html = `
        <div class="save-slot-content">
            <div class="save-slot-header">
                <h3>选择存档</h3>
                <button class="save-slot-close" onclick="closeLoadSlotDialog()">×</button>
            </div>
            <div class="save-slots-list">
    `;
    
    saveSlots.forEach((slot, index) => {
        if (slot.empty) {
            html += `
                <div class="save-slot-item empty disabled">
                    <div class="slot-number">存档 ${index + 1}</div>
                    <div class="slot-info">空存档</div>
                </div>
            `;
        } else {
            const date = new Date(slot.timestamp);
            html += `
                <div class="save-slot-item" onclick="loadFromSlot(${index})">
                    <div class="slot-number">存档 ${index + 1}</div>
                    <div class="slot-info">
                        <span>${dungeonClasses[slot.playerClass]?.name || '未知'}</span>
                        <span>第 ${slot.floor} 层</span>
                        <span>HP: ${slot.playerHP}/${slot.playerMaxHP}</span>
                    </div>
                    <div class="slot-time">${date.toLocaleString()}</div>
                    <div class="slot-action">点击读取</div>
                </div>
            `;
        }
    });
    
    html += '</div></div>';
    dialog.innerHTML = html;
    dialog.classList.add('show');
}

function closeLoadSlotDialog() {
    const dialog = document.getElementById('load-slot-dialog');
    if (dialog) {
        dialog.classList.remove('show');
    }
}

function loadFromSlot(slotIndex) {
    const slot = saveSlots[slotIndex];
    if (slot.empty) return;
    
    try {
        Object.assign(dungeonGameState, slot.state);
        
        if (dungeonGameState.inBattle) {
            showScreen('battle-screen');
            updateBattleUI();
        } else {
            showScreen('dungeon-map-screen');
            updateMapUI();
        }
        
        alert(`存档 ${slotIndex + 1} 加载成功！`);
        closeLoadSlotDialog();
    } catch (e) {
        alert('存档加载失败！');
    }
}

// ==================== 背包系统 ====================
function showInventory() {
    closeGameMenu();
    let inventoryPanel = document.getElementById('inventory-panel');
    
    if (!inventoryPanel) {
        inventoryPanel = document.createElement('div');
        inventoryPanel.id = 'inventory-panel';
        inventoryPanel.className = 'inventory-panel';
        document.querySelector('.dungeon-container').appendChild(inventoryPanel);
    }
    
    let html = `
        <div class="inventory-content">
            <div class="inventory-header">
                <h2>🎒 背包</h2>
                <button class="inventory-close" onclick="closeInventory()">×</button>
            </div>
            <div class="inventory-stats">
                <div class="inv-stat">❤️ HP: ${dungeonGameState.playerHP}/${dungeonGameState.playerMaxHP}</div>
                <div class="inv-stat">💰 金币: ${dungeonGameState.gold}</div>
                <div class="inv-stat">🎴 卡组: ${dungeonGameState.deck.length} 张</div>
            </div>
            <div class="inventory-deck">
                <h3>当前卡组</h3>
                <div class="deck-cards-list">
    `;
    
    const cardCounts = {};
    dungeonGameState.deck.forEach(card => {
        const effectId = card.effect;
        if (!cardCounts[effectId]) {
            cardCounts[effectId] = { count: 0, card: card };
        }
        cardCounts[effectId].count++;
    });
    
    Object.values(cardCounts).forEach(({ count, card }) => {
        html += `
            <div class="deck-card-mini rarity-${card.rarity}">
                <span class="mini-cost">${card.cost}</span>
                <span class="mini-name">${card.effectData.name}</span>
                <span class="mini-amount">x${count}</span>
            </div>
        `;
    });
    
    html += '</div></div></div>';
    inventoryPanel.innerHTML = html;
    inventoryPanel.classList.add('show');
}

function closeInventory() {
    const panel = document.getElementById('inventory-panel');
    if (panel) {
        panel.classList.remove('show');
    }
}

function toggleSound() {
    dungeonGameState.soundEnabled = !dungeonGameState.soundEnabled;
    const icon = document.getElementById('sound-icon');
    const text = document.getElementById('sound-text');
    if (icon) icon.textContent = dungeonGameState.soundEnabled ? '🔊' : '🔇';
    if (text) text.textContent = dungeonGameState.soundEnabled ? '音效开关' : '音效已关闭';
}

function returnToHome() {
    closeGameMenu();
    if (confirm('确定要返回主页吗？未保存的进度将丢失。')) {
        showScreen('dungeon-home');
        resetGameState();
    }
}

function resetGameState() {
    Object.assign(dungeonGameState, {
        floor: 1,
        currentFloor: 1,
        playerHP: 100,
        playerMaxHP: 100,
        playerATK: 10,
        playerDEF: 5,
        energy: 3,
        maxEnergy: 3,
        gold: 0,
        deck: [],
        hand: [],
        discardPile: [],
        inBattle: false,
        enemy: null,
        enemyHP: 0,
        enemyMaxHP: 0,
        isPlayerTurn: true,
        turnCount: 0,
        uniqueState: {},
        kills: 0,
        cardsPlayed: 0,
        damageDealt: 0,
        damageTaken: 0,
        goldEarned: 0,
        startTime: null,
        mapPath: [],
        currentRoomIndex: 0,
        buffs: [],
        debuffs: [],
        summons: [],
        firstStrikeUsed: false
    });
}

// ==================== 卡组管理系统 ====================
function showDeckManager() {
    closeGameMenu();
    
    let deckPanel = document.getElementById('deck-manager-panel');
    if (!deckPanel) {
        deckPanel = document.createElement('div');
        deckPanel.id = 'deck-manager-panel';
        deckPanel.className = 'deck-manager-panel';
        document.querySelector('.dungeon-container').appendChild(deckPanel);
    }
    
    const cardCounts = {};
    dungeonGameState.deck.forEach((card, index) => {
        const effectId = card.effect;
        if (!cardCounts[effectId]) {
            cardCounts[effectId] = { count: 0, card: card, indices: [] };
        }
        cardCounts[effectId].count++;
        cardCounts[effectId].indices.push(index);
    });
    
    let html = `
        <div class="deck-manager-content">
            <div class="deck-manager-header">
                <h2>🎴 卡组管理</h2>
                <button class="deck-manager-close" onclick="closeDeckManager()">×</button>
            </div>
            <div class="deck-manager-body">
                <div class="current-deck-section">
                    <h3>当前卡组 (${dungeonGameState.deck.length}张)</h3>
                    <div class="current-deck-cards" id="current-deck-cards">
    `;
    
    Object.entries(cardCounts).forEach(([effectId, { count, card }]) => {
        html += `
            <div class="deck-card-item rarity-${card.rarity}">
                <span class="card-cost">${card.cost}</span>
                <span class="card-name">${card.effectData.name}</span>
                <span class="card-amount">x${count}</span>
                <button class="remove-card-btn" onclick="removeEffectFromDeck('${effectId}')">-</button>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
                <div class="available-cards-section">
                    <h3>可用卡牌 (点击添加)</h3>
                    <div class="available-cards-list" id="available-cards-list">
    `;
    
    const availableEffects = Object.entries(dungeonCardEffects);
    availableEffects.forEach(([effectId, effect]) => {
        html += `
            <div class="available-card-item" onclick="addEffectToDeck('${effectId}')">
                <span class="card-cost">${effect.cost}</span>
                <span class="card-name">${effect.name}</span>
                <span class="card-desc">${effect.desc}</span>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
            </div>
        </div>
    `;
    
    deckPanel.innerHTML = html;
    deckPanel.classList.add('show');
}

function closeDeckManager() {
    const panel = document.getElementById('deck-manager-panel');
    if (panel) {
        panel.classList.remove('show');
    }
}

function removeCardFromDeck(index) {
    dungeonGameState.deck.splice(index, 1);
    showDeckManager();
    playDungeonSound('close');
}

function removeEffectFromDeck(effectId) {
    const index = dungeonGameState.deck.findIndex(c => c.effect === effectId);
    if (index > -1) {
        dungeonGameState.deck.splice(index, 1);
        showDeckManager();
        playDungeonSound('close');
    }
}

function addEffectToDeck(effectId) {
    addCardToDeck(effectId);
    showDeckManager();
    playDungeonSound('cardPlay');
}

// ==================== 自定义卡组系统 ====================
let tempCustomDeckCards = [];

function showCustomDeckCreator() {
    tempCustomDeckCards = [];
    
    let dialog = document.getElementById('custom-deck-dialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'custom-deck-dialog';
        dialog.className = 'custom-deck-dialog';
        document.querySelector('.dungeon-container').appendChild(dialog);
    }
    
    let html = `
        <div class="custom-deck-content">
            <div class="custom-deck-header">
                <h3>创建自定义卡组</h3>
                <button class="custom-deck-close" onclick="closeCustomDeckDialog()">×</button>
            </div>
            <div class="custom-deck-form">
                <input type="text" id="custom-deck-name" placeholder="卡组名称" maxlength="20">
                <input type="text" id="custom-deck-desc" placeholder="卡组描述" maxlength="50">
                <div class="selected-cards-count">已选: <span id="selected-cards-count">0</span> / ${GAME_CONFIG.DECK_SIZE} 张</div>
                <div class="custom-deck-cards" id="custom-deck-cards">
                    <p>点击卡牌添加（可重复添加相同卡牌）:</p>
                    <div class="card-selector">
    `;
    
    Object.entries(dungeonCardEffects).forEach(([effectId, effect]) => {
        html += `
            <div class="card-selector-item" data-effect="${effectId}" onclick="addCardToCustomDeck('${effectId}')">
                <span class="card-cost">${effect.cost}</span>
                <span class="card-name">${effect.name}</span>
                <span class="card-count-badge" id="count-${effectId}">0</span>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
                <div class="selected-cards-preview" id="selected-cards-preview"></div>
                <button class="btn-create-deck" onclick="createCustomDeck()">创建卡组 (需要${GAME_CONFIG.DECK_SIZE}张)</button>
            </div>
        </div>
    `;
    
    dialog.innerHTML = html;
    dialog.classList.add('show');
    updateCustomDeckPreview();
}

function closeCustomDeckDialog() {
    const dialog = document.getElementById('custom-deck-dialog');
    if (dialog) {
        dialog.classList.remove('show');
    }
    tempCustomDeckCards = [];
}

function addCardToCustomDeck(effectId) {
    if (tempCustomDeckCards.length >= GAME_CONFIG.DECK_SIZE) {
        alert(`卡组已满 ${GAME_CONFIG.DECK_SIZE} 张！`);
        return;
    }
    
    tempCustomDeckCards.push(effectId);
    updateCustomDeckUI();
    playDungeonSound('cardPlay');
}

function removeCardFromCustomDeck(effectId) {
    const index = tempCustomDeckCards.lastIndexOf(effectId);
    if (index > -1) {
        tempCustomDeckCards.splice(index, 1);
        updateCustomDeckUI();
    }
}

function updateCustomDeckUI() {
    const countEl = document.getElementById('selected-cards-count');
    if (countEl) {
        countEl.textContent = tempCustomDeckCards.length;
    }
    
    Object.keys(dungeonCardEffects).forEach(effectId => {
        const badge = document.getElementById(`count-${effectId}`);
        if (badge) {
            const count = tempCustomDeckCards.filter(e => e === effectId).length;
            badge.textContent = count;
            if (count > 0) {
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    });
    
    updateCustomDeckPreview();
}

function updateCustomDeckPreview() {
    const previewEl = document.getElementById('selected-cards-preview');
    if (!previewEl) return;
    
    if (tempCustomDeckCards.length === 0) {
        previewEl.innerHTML = '';
        return;
    }
    
    const cardCounts = {};
    tempCustomDeckCards.forEach(effectId => {
        cardCounts[effectId] = (cardCounts[effectId] || 0) + 1;
    });
    
    let html = '<div class="selected-preview-grid">';
    Object.entries(cardCounts).forEach(([effectId, count]) => {
        const effect = dungeonCardEffects[effectId];
        html += `
            <div class="preview-card-item" onclick="removeCardFromCustomDeck('${effectId}')">
                <span class="card-cost">${effect.cost}</span>
                <span class="card-name">${effect.name}</span>
                <span class="card-amount">x${count}</span>
                <span class="remove-hint">-</span>
            </div>
        `;
    });
    html += '</div>';
    previewEl.innerHTML = html;
}

function createCustomDeck() {
    const name = document.getElementById('custom-deck-name').value.trim();
    const desc = document.getElementById('custom-deck-desc').value.trim();
    
    if (!name) {
        alert('请输入卡组名称！');
        return;
    }
    
    if (tempCustomDeckCards.length !== GAME_CONFIG.DECK_SIZE) {
        alert(`卡组需要正好 ${GAME_CONFIG.DECK_SIZE} 张卡牌！当前已选 ${tempCustomDeckCards.length} 张。`);
        return;
    }
    
    if (customDecks.length >= GAME_CONFIG.MAX_CUSTOM_DECKS) {
        alert(`最多创建 ${GAME_CONFIG.MAX_CUSTOM_DECKS} 个自定义卡组！`);
        return;
    }
    
    customDecks.push({
        id: 'custom_' + Date.now(),
        name: name,
        desc: desc || '自定义卡组',
        icon: '🎨',
        cards: [...tempCustomDeckCards]
    });
    
    saveCustomDecks();
    tempCustomDeckCards = [];
    closeCustomDeckDialog();
    generateDeckSelection();
    updateCustomDecksList();
    
    alert('自定义卡组创建成功！');
}

function updateCustomDecksList() {
    const container = document.getElementById('custom-decks-list');
    if (!container) return;
    
    if (customDecks.length === 0) {
        container.innerHTML = '<span style="color: var(--text-tertiary); font-size: 0.875rem; padding: 12px; display: block;">点击上方按钮创建自定义卡组</span>';
        return;
    }
    
    let html = '';
    customDecks.forEach((deck, index) => {
        html += `
            <div class="custom-deck-item" data-deck="custom_${index}">
                <div class="custom-deck-info">
                    <span class="custom-deck-icon">${deck.icon || '🎨'}</span>
                    <span class="custom-deck-name">${deck.name}</span>
                    <span class="custom-deck-count">${deck.cards.length}张</span>
                </div>
                <div class="custom-deck-actions">
                    <button class="custom-deck-select-btn" onclick="selectCustomDeck(${index})">选择</button>
                    <button class="custom-deck-delete-btn" onclick="deleteCustomDeck(${index})">删除</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function selectCustomDeck(index) {
    const deckCards = document.querySelectorAll('.deck-card');
    deckCards.forEach(c => c.classList.remove('selected'));
    
    dungeonGameState.selectedDeckId = 'custom_' + index;
    
    const customDeckItems = document.querySelectorAll('.custom-deck-item');
    customDeckItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    playDungeonSound('select');
}

function deleteCustomDeck(index) {
    if (confirm('确定要删除这个自定义卡组吗？')) {
        customDecks.splice(index, 1);
        saveCustomDecks();
        generateDeckSelection();
        updateCustomDecksList();
        playDungeonSound('close');
    }
}

// ==================== 游戏流程 ====================
function startNewGame() {
    if (!dungeonGameState.playerClass) {
        dungeonGameState.playerClass = 'warrior';
    }
    
    if (!dungeonGameState.selectedDeckId) {
        dungeonGameState.selectedDeckId = 'balanced';
    }
    
    playDungeonSound('open');
    
    const cls = dungeonClasses[dungeonGameState.playerClass];
    if (!cls) {
        alert('职业数据错误！');
        return;
    }
    const diff = difficultyConfig[dungeonGameState.difficulty];
    
    dungeonGameState.playerHP = cls.baseHP;
    dungeonGameState.playerMaxHP = cls.baseHP;
    dungeonGameState.playerATK = cls.baseATK;
    dungeonGameState.playerDEF = cls.baseDEF;
    dungeonGameState.energy = diff.startEnergy;
    dungeonGameState.maxEnergy = diff.startEnergy;
    dungeonGameState.gold = 50;
    dungeonGameState.floor = 1;
    dungeonGameState.kills = 0;
    dungeonGameState.startTime = Date.now();
    dungeonGameState.firstStrikeUsed = false;
    
    initializeDeck(cls);
    generateMap();
    
    var dungeonStart = document.getElementById('dungeon-start');
    var dungeonMap = document.getElementById('dungeon-map-screen');
    if (dungeonStart) dungeonStart.style.display = 'none';
    if (dungeonMap) dungeonMap.style.display = 'block';
    
    showScreen('dungeon-map-screen');
    updateMapUI();
}

function initializeDeck(cls) {
    dungeonGameState.deck = [];
    dungeonGameState.hand = [];
    dungeonGameState.discardPile = [];
    
    let cardsToAdd = [];
    
    if (dungeonGameState.selectedDeckId === 'collection') {
        var collection = typeof gameState !== 'undefined' && gameState.collection ? gameState.collection : [];
        var usableCards = collection.filter(function(c) { return c.dungeonUsable && c.effect; });
        
        if (usableCards.length > 0) {
            usableCards.forEach(function(card) {
                addCollectionCardToDeck(card);
            });
            
            while (dungeonGameState.deck.length < GAME_CONFIG.DECK_SIZE) {
                const effects = Object.keys(dungeonCardEffects);
                const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                addCardToDeck(randomEffect);
            }
            
            shuffleDeck();
            return;
        }
    }
    
    if (dungeonGameState.selectedDeckId.startsWith('custom_')) {
        const customIndex = parseInt(dungeonGameState.selectedDeckId.replace('custom_', ''));
        const customDeck = customDecks[customIndex];
        if (customDeck) {
            cardsToAdd = [...customDeck.cards];
        }
    } else if (defaultDecks[dungeonGameState.selectedDeckId]) {
        cardsToAdd = [...defaultDecks[dungeonGameState.selectedDeckId].cards];
    }
    
    if (cardsToAdd.length === 0) {
        cardsToAdd = [...cls.startingCards];
        while (cardsToAdd.length < GAME_CONFIG.DECK_SIZE) {
            const effects = Object.keys(dungeonCardEffects);
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            cardsToAdd.push(randomEffect);
        }
    }
    
    cardsToAdd.forEach(effectId => {
        addCardToDeck(effectId);
    });
    
    shuffleDeck();
}

function addCollectionCardToDeck(collectionCard) {
    const effectId = collectionCard.effect;
    const effect = dungeonCardEffects[effectId];
    if (!effect) return;
    
    dungeonGameState.deck.push({
        id: Date.now() + Math.random(),
        word: collectionCard.word || 'Unknown',
        translation: collectionCard.meaning || '',
        effect: effectId,
        effectData: { ...effect },
        cost: effect.cost,
        rarity: collectionCard.rarity || 'common',
        fromCollection: true,
        collectionCardId: collectionCard.cardId
    });
}

function addCardToDeck(effectId, word = null, translation = null) {
    const effect = dungeonCardEffects[effectId];
    if (!effect) return;
    
    if (!word && typeof vocabulary3500 !== 'undefined' && vocabulary3500.words) {
        const randomWord = vocabulary3500.words[Math.floor(Math.random() * vocabulary3500.words.length)];
        word = randomWord.word;
        translation = randomWord.translation || randomWord.meaning || '';
    }
    
    const rarity = getCardRarity(effectId);
    
    dungeonGameState.deck.push({
        id: Date.now() + Math.random(),
        word: word || 'Unknown',
        translation: translation || '',
        effect: effectId,
        effectData: { ...effect },
        cost: effect.cost,
        rarity: rarity
    });
}

function getCardRarity(effectId) {
    const legendaryEffects = ['time_warp', 'full_heal', 'damage_immunity', 'super_critical'];
    const epicEffects = ['triple_attack', 'full_energy', 'big_lifesteal', 'holy_light'];
    const rareEffects = ['double_attack', 'big_heal', 'big_shield', 'super_poison', 'critical'];
    
    if (legendaryEffects.includes(effectId)) return 'legendary';
    if (epicEffects.includes(effectId)) return 'epic';
    if (rareEffects.includes(effectId)) return 'rare';
    return 'common';
}

function shuffleDeck() {
    for (let i = dungeonGameState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dungeonGameState.deck[i], dungeonGameState.deck[j]] = [dungeonGameState.deck[j], dungeonGameState.deck[i]];
    }
}

function drawCards(count, costEnergy = false) {
    for (let i = 0; i < count; i++) {
        if (dungeonGameState.hand.length >= GAME_CONFIG.MAX_HAND_SIZE) break;
        
        if (dungeonGameState.deck.length === 0) {
            dungeonGameState.deck = [...dungeonGameState.discardPile];
            dungeonGameState.discardPile = [];
            shuffleDeck();
        }
        
        if (dungeonGameState.deck.length > 0) {
            dungeonGameState.hand.push(dungeonGameState.deck.pop());
        }
    }
    
    if (costEnergy && dungeonGameState.energy > 0) {
        dungeonGameState.energy -= 1;
    }
    
    updateBattleUI();
}

// ==================== 地图系统 ====================
function generateMap() {
    dungeonGameState.mapPath = [];
    dungeonGameState.completedFloors = [];
    dungeonGameState.currentFloorRooms = [];
    
    const maxFloors = 20;
    
    for (let floor = 1; floor <= maxFloors; floor++) {
        const rooms = [];
        
        for (let i = 0; i < 3; i++) {
            let type;
            
            if (floor % 10 === 0 && i === 2) {
                type = 'boss';
            } else if (floor % 5 === 0 && i === 2) {
                type = 'elite_encounter';
            } else {
                type = generateRandomRoomType(floor);
            }
            
            rooms.push({ 
                type, 
                floor, 
                index: i,
                completed: false
            });
        }
        
        dungeonGameState.mapPath.push({ 
            floor, 
            rooms, 
            completed: false,
            selectedRoom: null
        });
    }
    
    dungeonGameState.currentFloor = 1;
}

function generateRandomRoomType(floor) {
    const rand = Math.random();
    let type;
    
    if (rand < 0.5) type = 'encounter';
    else if (rand < 0.65) type = 'merchant';
    else if (rand < 0.80) type = 'special';
    else if (rand < 0.95) type = 'camp';
    else type = 'reward';
    
    return type;
}

function updateMapUI() {
    const mapPath = document.getElementById('map-path');
    if (!mapPath) return;
    
    const currentFloor = dungeonGameState.currentFloor || 1;
    const startIndex = Math.max(0, currentFloor - 1);
    const visibleFloors = dungeonGameState.mapPath.slice(startIndex, startIndex + 5);
    
    let html = '';
    
    visibleFloors.forEach((floorData, index) => {
        const actualFloorIndex = startIndex + index;
        const floorNum = floorData.floor;
        const isCurrentFloor = floorNum === currentFloor;
        const isCompleted = floorData.completed;
        const isLocked = !isCurrentFloor && !isCompleted;
        
        let floorClass = 'map-floor';
        if (isCurrentFloor) floorClass += ' current-floor';
        if (isCompleted) floorClass += ' completed-floor';
        if (isLocked && index > 0) floorClass += ' locked-floor';
        
        html += `<div class="${floorClass}" data-floor="${floorNum}">`;
        html += `<div class="floor-label">第 ${floorNum} 层</div>`;
        html += `<div class="floor-rooms">`;
        
        floorData.rooms.forEach((room, roomIndex) => {
            const roomType = roomTypes[room.type];
            const roomSelected = floorData.selectedRoom === roomIndex;
            const canSelect = isCurrentFloor && !isCompleted && floorData.selectedRoom === null;
            
            let roomClass = `map-room ${room.type}`;
            if (canSelect) roomClass += ' selectable';
            if (roomSelected) roomClass += ' selected';
            if (isLocked && index > 0) roomClass += ' locked';
            
            const onclick = canSelect 
                ? `onclick="selectRoom(${actualFloorIndex}, ${roomIndex})"` 
                : '';
            
            html += `
                <div class="${roomClass}" ${onclick} data-room="${roomIndex}">
                    <span class="room-icon">${roomType.icon}</span>
                    <span class="room-name">${roomType.name}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    mapPath.innerHTML = html;
    
    document.getElementById('current-floor').textContent = currentFloor;
    document.getElementById('current-mode-display').textContent = '爬塔模式';
    
    document.getElementById('map-player-hp-bar').style.width = 
        `${(dungeonGameState.playerHP / dungeonGameState.playerMaxHP) * 100}%`;
    document.getElementById('map-player-hp').textContent = 
        `${dungeonGameState.playerHP}/${dungeonGameState.playerMaxHP}`;
    document.getElementById('map-player-gold').textContent = dungeonGameState.gold;
    document.getElementById('map-deck-count').textContent = dungeonGameState.deck.length;
}

function selectRoom(floorIndex, roomIndex) {
    const floorData = dungeonGameState.mapPath[floorIndex];
    if (!floorData || floorData.selectedRoom !== null) return;
    
    floorData.selectedRoom = roomIndex;
    
    playDungeonSound('select');
    
    const room = floorData.rooms[roomIndex];
    enterRoomByType(room.type, floorIndex, roomIndex);
}

function enterRoomByType(roomType, floorIndex, roomIndex) {
    const floorData = dungeonGameState.mapPath[floorIndex];
    
    switch (roomType) {
        case 'encounter':
        case 'elite_encounter':
        case 'boss':
            startBattle(roomType, floorIndex, roomIndex);
            break;
        case 'merchant':
            showShopScreen(floorIndex, roomIndex);
            break;
        case 'camp':
            showCampScreen(floorIndex, roomIndex);
            break;
        case 'special':
            showSpecialRoom(floorIndex, roomIndex);
            break;
        case 'reward':
            showRewardScreen(floorIndex, roomIndex);
            break;
    }
}

function completeRoom(floorIndex, roomIndex) {
    const floorData = dungeonGameState.mapPath[floorIndex];
    if (!floorData) return;
    
    floorData.rooms[roomIndex].completed = true;
    floorData.completed = true;
    
    dungeonGameState.currentFloor = floorData.floor + 1;
    dungeonGameState.floor = dungeonGameState.currentFloor;
    
    if (dungeonGameState.currentFloor > 20) {
        showVictoryScreen();
        return;
    }
    
    playDungeonSound('success');
    showScreen('dungeon-map-screen');
    updateMapUI();
}

function enterRoom(floorIndex, roomIndex) {
    const floorData = dungeonGameState.mapPath[floorIndex];
    if (!floorData) return;
    
    const room = floorData.rooms[roomIndex];
    if (!room) return;
    
    enterRoomByType(room.type, floorIndex, roomIndex);
}

function advanceFloor() {
    showScreen('dungeon-map-screen');
    updateMapUI();
}

// ==================== 战斗系统 ====================
let currentBattleFloorIndex = 0;
let currentBattleRoomIndex = 0;

function startBattle(roomType, floorIndex = 0, roomIndex = 0) {
    currentBattleFloorIndex = floorIndex;
    currentBattleRoomIndex = roomIndex;
    
    dungeonGameState.inBattle = true;
    dungeonGameState.turnCount = 0;
    dungeonGameState.isPlayerTurn = true;
    dungeonGameState.firstStrikeUsed = false;
    dungeonGameState.buffs = [];
    dungeonGameState.debuffs = [];
    dungeonGameState.uniqueState = {};
    
    let enemyPool;
    switch (roomType) {
        case 'boss':
            enemyPool = dungeonMonsters.boss;
            break;
        case 'elite_encounter':
            enemyPool = dungeonMonsters.elite;
            break;
        default:
            enemyPool = dungeonMonsters.normal;
    }
    
    const diff = difficultyConfig[dungeonGameState.difficulty];
    const enemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    
    const floorNum = (dungeonGameState.currentFloor || 1);
    
    dungeonGameState.enemy = enemy;
    dungeonGameState.enemyHP = Math.floor(enemy.hp * diff.hpMod * (1 + floorNum * 0.1));
    dungeonGameState.enemyMaxHP = dungeonGameState.enemyHP;
    
    dungeonGameState.hand = [];
    dungeonGameState.discardPile = [];
    shuffleDeck();
    drawCards(GAME_CONFIG.STARTING_HAND_SIZE);
    
    dungeonGameState.energy = dungeonGameState.maxEnergy;
    
    showScreen('dungeon-game');
    updateBattleUI();
    
    addBattleLog(`遭遇了 ${enemy.name}！`);
    playDungeonSound('attack');
}

function updateBattleUI() {
    if (!dungeonGameState.inBattle) return;
    
    const cls = dungeonClasses[dungeonGameState.playerClass];
    
    var playerAvatar = document.getElementById('player-avatar');
    var playerHp = document.getElementById('player-hp');
    var playerMaxHp = document.getElementById('player-max-hp');
    var playerHpFill = document.getElementById('player-hp-fill');
    
    if (playerAvatar) playerAvatar.textContent = cls.icon;
    if (playerHp) playerHp.textContent = dungeonGameState.playerHP;
    if (playerMaxHp) playerMaxHp.textContent = dungeonGameState.playerMaxHP;
    if (playerHpFill) playerHpFill.style.width = `${(dungeonGameState.playerHP / dungeonGameState.playerMaxHP) * 100}%`;
    
    if (dungeonGameState.enemy) {
        var enemyAvatar = document.getElementById('enemy-avatar');
        var enemyName = document.getElementById('enemy-name');
        var enemyHpFill = document.getElementById('enemy-hp-fill');
        
        if (enemyAvatar) enemyAvatar.textContent = dungeonGameState.enemy.icon;
        if (enemyName) enemyName.textContent = dungeonGameState.enemy.name;
        if (enemyHpFill) enemyHpFill.style.width = `${(dungeonGameState.enemyHP / dungeonGameState.enemyMaxHP) * 100}%`;
    }
    
    updateHandUI();
    
    var dungeonFloor = document.getElementById('dungeon-floor');
    var dungeonKills = document.getElementById('dungeon-kills');
    var dungeonCards = document.getElementById('dungeon-cards');
    
    if (dungeonFloor) dungeonFloor.textContent = dungeonGameState.floor;
    if (dungeonKills) dungeonKills.textContent = dungeonGameState.kills;
    if (dungeonCards) dungeonCards.textContent = dungeonGameState.deck.length + dungeonGameState.hand.length + dungeonGameState.discardPile.length;
}

function updateHandUI() {
    const handContainer = document.getElementById('dungeon-hand');
    if (!handContainer) return;
    
    let html = '';
    
    dungeonGameState.hand.forEach((card, index) => {
        const canPlay = dungeonGameState.energy >= card.cost && dungeonGameState.isPlayerTurn;
        const disabledClass = canPlay ? '' : 'disabled';
        
        html += `
            <div class="dungeon-card-premium rarity-${card.rarity} ${disabledClass}" 
                 data-index="${index}" onclick="playCard(${index})">
                <div class="card-cost">${card.cost}</div>
                <div class="card-word">${card.word}</div>
                <div class="card-effect">${card.effectData.name}</div>
                <div class="card-desc">${card.effectData.desc}</div>
            </div>
        `;
    });
    
    handContainer.innerHTML = html;
}

function playCard(index) {
    if (!dungeonGameState.isPlayerTurn) return;
    
    const card = dungeonGameState.hand[index];
    if (!card || dungeonGameState.energy < card.cost) return;
    
    dungeonGameState.energy -= card.cost;
    
    executeCardEffect(card);
    
    dungeonGameState.hand.splice(index, 1);
    dungeonGameState.discardPile.push(card);
    
    dungeonGameState.cardsPlayed++;
    
    playDungeonSound('cardPlay');
    
    if (dungeonGameState.enemyHP <= 0) {
        enemyDefeated();
    } else {
        updateBattleUI();
    }
}

// ==================== 卡牌效果执行 ====================
function executeCardEffect(card) {
    const effect = card.effectData;
    const cls = dungeonClasses[dungeonGameState.playerClass];
    
    let damage = dungeonGameState.playerATK;
    
    // 狂战士被动：HP越低攻击越高
    if (cls.id === 'berserker') {
        const hpPercent = 1 - (dungeonGameState.playerHP / dungeonGameState.playerMaxHP);
        damage = Math.floor(damage * (1 + hpPercent));
    }
    
    // 狂暴值消耗
    if (cls.id === 'berserker' && dungeonGameState.uniqueState.rage) {
        damage += Math.floor(dungeonGameState.uniqueState.rage * 0.5);
        dungeonGameState.uniqueState.rage = 0;
    }
    
    // 祝福光环
    if (cls.id === 'support' && dungeonGameState.uniqueState.blessingActive) {
        damage = Math.floor(damage * 1.3);
    }
    
    // 伤害提升buff
    const damageBoost = dungeonGameState.buffs.find(b => b.type === 'damage_boost');
    if (damageBoost) {
        damage = Math.floor(damage * (1 + damageBoost.value));
    }
    
    // 强化buff
    const powerUp = dungeonGameState.buffs.find(b => b.type === 'power_up');
    if (powerUp) {
        damage = Math.floor(damage * powerUp.value);
        dungeonGameState.buffs = dungeonGameState.buffs.filter(b => b !== powerUp);
    }
    
    switch (effect.type) {
        case 'attack':
            let finalDamage = Math.floor(damage * (effect.power || 1));
            const hits = effect.hits || 1;
            
            // 暴击判定
            let isCrit = effect.crit || false;
            
            // 刺客首击必暴
            if (cls.id === 'assassin' && !dungeonGameState.firstStrikeUsed) {
                isCrit = true;
                dungeonGameState.firstStrikeUsed = true;
                addBattleLog('暗影首击！必定暴击！');
            }
            
            // 射手暴击率
            if (cls.id === 'archer' && !isCrit && Math.random() < 0.3) {
                isCrit = true;
            }
            
            if (isCrit) {
                finalDamage = Math.floor(finalDamage * 1.5);
                addBattleLog('暴击！');
            }
            
            // 法师元素伤害加成
            if (cls.id === 'mage' && effect.element) {
                finalDamage = Math.floor(finalDamage * 1.5);
                addBattleLog('魔力增幅！');
            }
            
            // 元素师元素共鸣
            if (cls.id === 'elementalist' && effect.element) {
                if (dungeonGameState.uniqueState.lastElement === effect.element) {
                    dungeonGameState.uniqueState.elementCombo = (dungeonGameState.uniqueState.elementCombo || 1) * 2;
                    finalDamage = Math.floor(finalDamage * dungeonGameState.uniqueState.elementCombo);
                    addBattleLog(`元素共鸣！伤害x${dungeonGameState.uniqueState.elementCombo}！`);
                } else {
                    dungeonGameState.uniqueState.lastElement = effect.element;
                    dungeonGameState.uniqueState.elementCombo = 1;
                }
            }
            
            for (let i = 0; i < hits; i++) {
                dungeonGameState.enemyHP -= finalDamage;
                dungeonGameState.damageDealt += finalDamage;
                addBattleLog(`${card.word} 造成 ${finalDamage} 伤害！`);
            }
            
            // 吸血效果
            if (effect.lifesteal) {
                const heal = Math.floor(finalDamage * effect.lifesteal);
                dungeonGameState.playerHP = Math.min(
                    dungeonGameState.playerMaxHP, 
                    dungeonGameState.playerHP + heal
                );
                addBattleLog(`回复 ${heal} HP！`);
            }
            
            // 刺客连击点
            if (cls.id === 'assassin') {
                dungeonGameState.uniqueState.points = Math.min(5, (dungeonGameState.uniqueState.points || 0) + 1);
                addBattleLog(`连击点: ${dungeonGameState.uniqueState.points}/5`);
            }
            
            // 元素效果
            if (effect.element === 'fire') {
                dungeonGameState.debuffs.push({ type: 'burn', target: 'enemy', damage: 5, duration: 3 });
                addBattleLog('敌人被点燃！');
            }
            
            if (effect.element === 'thunder' && Math.random() < 0.3) {
                dungeonGameState.debuffs.push({ type: 'stun', target: 'enemy', duration: 1 });
                addBattleLog('敌人被眩晕！');
            }
            break;
            
        case 'heal':
            const healAmount = Math.floor(dungeonGameState.playerMaxHP * effect.amount);
            dungeonGameState.playerHP = Math.min(
                dungeonGameState.playerMaxHP,
                dungeonGameState.playerHP + healAmount
            );
            addBattleLog(`恢复 ${healAmount} HP！`);
            playDungeonSound('heal');
            
            // 辅助祝福光环
            if (cls.id === 'support') {
                dungeonGameState.uniqueState.blessingActive = true;
                addBattleLog('祝福光环激活！攻击力提升30%！');
            }
            
            if (effect.cleanse) {
                dungeonGameState.debuffs = dungeonGameState.debuffs.filter(d => d.target !== 'player');
                addBattleLog('净化负面效果！');
            }
            break;
            
        case 'defense':
            if (effect.effect === 'shield') {
                dungeonGameState.buffs.push({ type: 'shield', value: 0.5 });
                addBattleLog('获得护盾！下次伤害减半！');
            } else if (effect.effect === 'big_shield') {
                dungeonGameState.buffs.push({ type: 'shield', value: 0.75 });
                addBattleLog('获得大护盾！下次伤害减至25%！');
            } else if (effect.effect === 'immunity') {
                dungeonGameState.buffs.push({ type: 'immunity', duration: 1 });
                addBattleLog('本回合免疫伤害！');
            } else if (effect.effect === 'ice_shield') {
                dungeonGameState.buffs.push({ type: 'shield', value: 0.5 });
                dungeonGameState.debuffs.push({ type: 'freeze', target: 'enemy', duration: 1 });
                addBattleLog('获得冰盾！敌人被冻结！');
            }
            break;
            
        case 'debuff':
            if (effect.effect === 'poison') {
                dungeonGameState.debuffs.push({ type: 'poison', target: 'enemy', value: 0.1 });
                addBattleLog('敌人中毒！每回合损失10%HP！');
            } else if (effect.effect === 'super_poison') {
                dungeonGameState.debuffs.push({ type: 'poison', target: 'enemy', value: 0.2 });
                addBattleLog('敌人剧毒！每回合损失20%HP！');
            }
            break;
            
        case 'control':
            if (effect.effect === 'stun') {
                dungeonGameState.debuffs.push({ type: 'stun', target: 'enemy', duration: 1 });
                addBattleLog('敌人被眩晕！跳过下回合！');
            } else if (effect.effect === 'sleep') {
                dungeonGameState.debuffs.push({ type: 'stun', target: 'enemy', duration: 2 });
                addBattleLog('敌人被催眠！跳过两回合！');
            }
            break;
            
        case 'buff':
            if (effect.effect === 'power_up') {
                dungeonGameState.buffs.push({ type: 'power_up', value: 2 });
                addBattleLog('下次攻击伤害翻倍！');
            } else if (effect.effect === 'regen') {
                dungeonGameState.buffs.push({ type: 'regen', value: 0.1 });
                addBattleLog('获得再生效果！每回合恢复10%HP！');
            } else if (effect.effect === 'damage_boost') {
                dungeonGameState.buffs.push({ type: 'damage_boost', value: 0.3, duration: 3 });
                addBattleLog('伤害提升30%持续3回合！');
            }
            break;
            
        case 'resource':
            if (effect.effect === 'draw') {
                drawCards(effect.amount);
                addBattleLog(`抽了 ${effect.amount} 张牌！`);
            } else if (effect.effect === 'refresh') {
                while (dungeonGameState.hand.length < GAME_CONFIG.MAX_HAND_SIZE && 
                       (dungeonGameState.deck.length > 0 || dungeonGameState.discardPile.length > 0)) {
                    drawCards(1);
                }
                addBattleLog('手牌已抽满！');
            } else if (effect.effect === 'energy') {
                dungeonGameState.energy = Math.min(
                    dungeonGameState.maxEnergy,
                    dungeonGameState.energy + effect.amount
                );
                addBattleLog(`恢复 ${effect.amount} 能量！`);
            } else if (effect.effect === 'full_energy') {
                dungeonGameState.energy = dungeonGameState.maxEnergy;
                addBattleLog('能量恢复满！');
            }
            break;
            
        case 'special':
            if (effect.effect === 'extra_turn') {
                dungeonGameState.buffs.push({ type: 'extra_turn' });
                addBattleLog('获得额外回合！');
            }
            break;
    }
    
    // 战士护盾充能
    if (cls.id === 'warrior') {
        dungeonGameState.uniqueState.shieldCount = (dungeonGameState.uniqueState.shieldCount || 0) + 1;
        if (dungeonGameState.uniqueState.shieldCount >= 3) {
            dungeonGameState.buffs.push({ type: 'shield', value: 0.5 });
            addBattleLog('护盾充能完成！获得护盾！');
            dungeonGameState.uniqueState.shieldCount = 0;
        }
    }
    
    // 武僧斗气
    if (cls.id === 'monk' && card.cost === 0) {
        dungeonGameState.uniqueState.chi = Math.min(100, (dungeonGameState.uniqueState.chi || 0) + 20);
        addBattleLog(`斗气: ${dungeonGameState.uniqueState.chi}/100`);
    }
    
    // 射手连射
    if (cls.id === 'archer' && effect.type === 'attack') {
        dungeonGameState.uniqueState.comboCount = (dungeonGameState.uniqueState.comboCount || 0) + 1;
        dungeonGameState.uniqueState.comboMultiplier = 1 + (dungeonGameState.uniqueState.comboCount * 0.1);
    } else if (cls.id === 'archer') {
        dungeonGameState.uniqueState.comboCount = 0;
        dungeonGameState.uniqueState.comboMultiplier = 1;
    }
    
    playDungeonSound('attack');
}

function endTurn() {
    if (!dungeonGameState.isPlayerTurn) return;
    
    dungeonGameState.isPlayerTurn = false;
    dungeonGameState.turnCount++;
    
    processEndTurnEffects();
    
    const cls = dungeonClasses[dungeonGameState.playerClass];
    
    // 时空法师额外回合
    if (cls.id === 'timeMage' && dungeonGameState.turnCount % 3 === 0) {
        addBattleLog('时间操控！获得额外回合！');
        dungeonGameState.isPlayerTurn = true;
        dungeonGameState.energy = dungeonGameState.maxEnergy;
        drawCards(1);
        updateBattleUI();
        return;
    }
    
    const extraTurn = dungeonGameState.buffs.find(b => b.type === 'extra_turn');
    if (extraTurn) {
        addBattleLog('额外回合！');
        dungeonGameState.isPlayerTurn = true;
        dungeonGameState.energy = dungeonGameState.maxEnergy;
        drawCards(1);
        dungeonGameState.buffs = dungeonGameState.buffs.filter(b => b !== extraTurn);
        updateBattleUI();
        return;
    }
    
    enemyTurn();
}

function processEndTurnEffects() {
    const cls = dungeonClasses[dungeonGameState.playerClass];
    
    // 辅助被动治愈
    if (cls.id === 'support') {
        const heal = Math.floor(dungeonGameState.playerMaxHP * 0.1);
        dungeonGameState.playerHP = Math.min(dungeonGameState.playerMaxHP, dungeonGameState.playerHP + heal);
        addBattleLog(`被动治愈恢复 ${heal} HP！`);
    }
    
    // 武僧禅意
    if (cls.id === 'monk') {
        dungeonGameState.energy = Math.min(dungeonGameState.maxEnergy, dungeonGameState.energy + 1);
        addBattleLog('禅意恢复1点能量！');
    }
    
    // 圣骑士净化
    if (cls.id === 'paladin') {
        dungeonGameState.debuffs = dungeonGameState.debuffs.filter(d => d.target !== 'player');
        addBattleLog('圣光净化负面效果！');
    }
    
    // 召唤师召唤
    if (cls.id === 'summoner') {
        dungeonGameState.summons.push({ hp: 20, atk: 10 });
        if (dungeonGameState.summons.length > 3) {
            dungeonGameState.summons.shift();
        }
        addBattleLog('召唤了一个随从！');
    }
    
    // 再生效果
    const regen = dungeonGameState.buffs.find(b => b.type === 'regen');
    if (regen) {
        const heal = Math.floor(dungeonGameState.playerMaxHP * regen.value);
        dungeonGameState.playerHP = Math.min(dungeonGameState.playerMaxHP, dungeonGameState.playerHP + heal);
        addBattleLog(`再生恢复 ${heal} HP！`);
    }
    
    // 敌人毒素伤害
    const poison = dungeonGameState.debuffs.find(d => d.type === 'poison' && d.target === 'enemy');
    if (poison) {
        const dmg = Math.floor(dungeonGameState.enemyMaxHP * poison.value);
        dungeonGameState.enemyHP -= dmg;
        addBattleLog(`毒素造成 ${dmg} 伤害！`);
    }
    
    // 敌人燃烧伤害
    const burn = dungeonGameState.debuffs.find(d => d.type === 'burn' && d.target === 'enemy');
    if (burn) {
        dungeonGameState.enemyHP -= burn.damage;
        addBattleLog(`燃烧造成 ${burn.damage} 伤害！`);
        burn.duration--;
        if (burn.duration <= 0) {
            dungeonGameState.debuffs = dungeonGameState.debuffs.filter(d => d !== burn);
        }
    }
    
    // 伤害提升持续时间
    dungeonGameState.buffs.forEach(b => {
        if (b.duration) {
            b.duration--;
        }
    });
    dungeonGameState.buffs = dungeonGameState.buffs.filter(b => !b.duration || b.duration > 0);
}

function enemyTurn() {
    if (dungeonGameState.enemyHP <= 0) {
        enemyDefeated();
        return;
    }
    
    // 眩晕检查
    const stun = dungeonGameState.debuffs.find(d => d.type === 'stun' && d.target === 'enemy');
    if (stun) {
        addBattleLog(`${dungeonGameState.enemy.name} 被眩晕，跳过回合！`);
        stun.duration--;
        if (stun.duration <= 0) {
            dungeonGameState.debuffs = dungeonGameState.debuffs.filter(d => d !== stun);
        }
        startPlayerTurn();
        return;
    }
    
    // 冻结检查
    const freeze = dungeonGameState.debuffs.find(d => d.type === 'freeze' && d.target === 'enemy');
    if (freeze) {
        addBattleLog(`${dungeonGameState.enemy.name} 被冻结，跳过回合！`);
        freeze.duration--;
        if (freeze.duration <= 0) {
            dungeonGameState.debuffs = dungeonGameState.debuffs.filter(d => d !== freeze);
        }
        startPlayerTurn();
        return;
    }
    
    // 敌人攻击
    let enemyDamage = dungeonGameState.enemy.atk;
    
    // 免疫检查
    const immunity = dungeonGameState.buffs.find(b => b.type === 'immunity');
    if (immunity) {
        addBattleLog('免疫了敌人的攻击！');
        startPlayerTurn();
        return;
    }
    
    // 护盾减伤
    const shield = dungeonGameState.buffs.find(b => b.type === 'shield');
    if (shield) {
        enemyDamage = Math.floor(enemyDamage * (1 - shield.value));
        dungeonGameState.buffs = dungeonGameState.buffs.filter(b => b !== shield);
        addBattleLog(`护盾抵挡了部分伤害！`);
    }
    
    // 战士被动减伤
    const cls = dungeonClasses[dungeonGameState.playerClass];
    if (cls.id === 'warrior') {
        enemyDamage = Math.floor(enemyDamage * 0.8);
        addBattleLog('坚韧减少20%伤害！');
    }
    
    // 狂战士狂暴值增加
    if (cls.id === 'berserker') {
        dungeonGameState.uniqueState.rage = Math.min(100, (dungeonGameState.uniqueState.rage || 0) + enemyDamage);
    }
    
    // 圣骑士神圣能量
    if (cls.id === 'paladin') {
        dungeonGameState.uniqueState.holyPower = Math.min(100, (dungeonGameState.uniqueState.holyPower || 0) + enemyDamage);
    }
    
    dungeonGameState.playerHP -= enemyDamage;
    dungeonGameState.damageTaken += enemyDamage;
    addBattleLog(`${dungeonGameState.enemy.name} 造成 ${enemyDamage} 伤害！`);
    playDungeonSound('damage');
    
    // 随从承受伤害
    if (dungeonGameState.summons.length > 0) {
        const summon = dungeonGameState.summons[0];
        const summonDmg = Math.min(summon.hp, Math.floor(enemyDamage * 0.3));
        summon.hp -= summonDmg;
        if (summon.hp <= 0) {
            dungeonGameState.summons.shift();
            addBattleLog('随从被击败！');
        }
    }
    
    if (dungeonGameState.playerHP <= 0) {
        gameOver();
        return;
    }
    
    startPlayerTurn();
}

function startPlayerTurn() {
    dungeonGameState.isPlayerTurn = true;
    dungeonGameState.energy = dungeonGameState.maxEnergy;
    drawCards(1);
    updateBattleUI();
}

function enemyDefeated() {
    dungeonGameState.inBattle = false;
    dungeonGameState.kills++;
    
    // 更新成就统计
    updateStats('kill');
    updateStats('gold', dungeonGameState.goldEarned);
    updateStats('cards', dungeonGameState.cardsPlayed);
    updateStats('damage', dungeonGameState.damageDealt);
    updateStats('floor', dungeonGameState.floor);
    
    // 死灵法师被动
    const cls = dungeonClasses[dungeonGameState.playerClass];
    if (cls.id === 'necromancer') {
        const heal = Math.floor(dungeonGameState.playerMaxHP * 0.3);
        dungeonGameState.playerHP = Math.min(dungeonGameState.playerMaxHP, dungeonGameState.playerHP + heal);
        addBattleLog(`亡灵之力恢复 ${heal} HP！`);
        
        dungeonGameState.uniqueState.army = Math.min(5, (dungeonGameState.uniqueState.army || 0) + 1);
        addBattleLog(`亡灵军团: ${dungeonGameState.uniqueState.army}/5`);
    }
    
    const floorNum = (dungeonGameState.currentFloor || 1);
    const goldReward = Math.floor(10 + Math.random() * 20 + floorNum * 2);
    dungeonGameState.gold += goldReward;
    dungeonGameState.goldEarned += goldReward;
    
    playDungeonSound('victory');
    
    showRewardScreen(currentBattleFloorIndex, currentBattleRoomIndex);
}

// ==================== 奖励系统 ====================
let currentRewardOptions = [];
let currentRewardFloorIndex = 0;
let currentRewardRoomIndex = 0;

function showRewardScreen(floorIndex = 0, roomIndex = 0) {
    currentRewardFloorIndex = floorIndex;
    currentRewardRoomIndex = roomIndex;
    
    const optionsContainer = document.getElementById('reward-options');
    currentRewardOptions = generateRewardOptions();
    
    let html = '';
    currentRewardOptions.forEach((option, index) => {
        html += `
            <div class="reward-option" onclick="selectReward(${index})">
                <div class="reward-icon">${option.icon}</div>
                <div class="reward-name">${option.name}</div>
                <div class="reward-desc">${option.desc}</div>
            </div>
        `;
    });
    
    optionsContainer.innerHTML = html;
    showScreen('reward-screen');
    playDungeonSound('success');
}

function generateRewardOptions() {
    const options = [];
    
    const effects = Object.keys(dungeonCardEffects);
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    options.push({
        type: 'card',
        icon: '🎴',
        name: '新卡牌',
        desc: `获得一张${dungeonCardEffects[randomEffect].name}卡牌`,
        effect: randomEffect
    });
    
    const goldAmount = Math.floor(30 + Math.random() * 40);
    options.push({
        type: 'gold',
        icon: '💰',
        name: '金币',
        desc: `获得 ${goldAmount} 金币`,
        amount: goldAmount
    });
    
    const healAmount = Math.floor(dungeonGameState.playerMaxHP * 0.4);
    options.push({
        type: 'heal',
        icon: '❤️',
        name: '恢复',
        desc: `恢复 ${healAmount} HP`,
        amount: healAmount
    });
    
    if (Math.random() > 0.6) {
        options.push({
            type: 'max_hp',
            icon: '💗',
            name: '生命值上限+',
            desc: '最大HP +15',
            amount: 15
        });
    }
    
    if (Math.random() > 0.75) {
        options.push({
            type: 'atk',
            icon: '⚔️',
            name: '攻击力+',
            desc: '攻击力 +3',
            amount: 3
        });
    }
    
    if (Math.random() > 0.85) {
        options.push({
            type: 'def',
            icon: '🛡️',
            name: '防御力+',
            desc: '防御力 +2',
            amount: 2
        });
    }
    
    const shuffled = options.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}

function selectReward(index) {
    const option = currentRewardOptions[index];
    if (!option) return;
    
    switch (option.type) {
        case 'card':
            addCardToDeck(option.effect);
            addBattleLog('获得新卡牌！');
            break;
        case 'gold':
            dungeonGameState.gold += option.amount;
            dungeonGameState.goldEarned += option.amount;
            addBattleLog(`获得 ${option.amount} 金币！`);
            break;
        case 'heal':
            dungeonGameState.playerHP = Math.min(
                dungeonGameState.playerMaxHP,
                dungeonGameState.playerHP + option.amount
            );
            addBattleLog(`恢复 ${option.amount} HP！`);
            break;
        case 'max_hp':
            dungeonGameState.playerMaxHP += option.amount;
            dungeonGameState.playerHP += option.amount;
            addBattleLog(`最大HP提升 ${option.amount}！`);
            break;
        case 'atk':
            dungeonGameState.playerATK += option.amount;
            addBattleLog(`攻击力提升 ${option.amount}！`);
            break;
        case 'def':
            dungeonGameState.playerDEF += option.amount;
            addBattleLog(`防御力提升 ${option.amount}！`);
            break;
    }
    
    playDungeonSound('gold');
    completeRoom(currentRewardFloorIndex, currentRewardRoomIndex);
}

// ==================== 商店系统 ====================
let currentShopItems = [];
let currentShopFloorIndex = 0;
let currentShopRoomIndex = 0;

function showShopScreen(floorIndex = 0, roomIndex = 0) {
    currentShopFloorIndex = floorIndex;
    currentShopRoomIndex = roomIndex;
    
    currentShopItems = generateShopItems();
    renderShopItems();
    showScreen('shop-screen');
    playDungeonSound('shop');
}

function renderShopItems() {
    const shopItems = document.getElementById('shop-items');
    
    let html = '';
    currentShopItems.forEach((item, index) => {
        const soldClass = item.sold ? 'sold-out' : '';
        html += `
            <div class="shop-item ${soldClass}" onclick="buyItem(${index})">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc">${item.desc}</div>
                </div>
                <div class="item-price">${item.cost} 💰</div>
            </div>
        `;
    });
    
    shopItems.innerHTML = html;
    document.getElementById('shop-gold').textContent = dungeonGameState.gold;
}

function generateShopItems() {
    return [
        { type: 'card', icon: '🎴', name: '普通卡牌', desc: '添加一张普通卡牌', cost: 50, rarity: 'common' },
        { type: 'card', icon: '💎', name: '稀有卡牌', desc: '添加一张稀有卡牌', cost: 100, rarity: 'rare' },
        { type: 'card', icon: '🔮', name: '史诗卡牌', desc: '添加一张史诗卡牌', cost: 200, rarity: 'epic' },
        { type: 'heal', icon: '❤️', name: '生命药水', desc: '恢复50 HP', cost: 30, amount: 50 },
        { type: 'max_hp', icon: '💗', name: '生命上限', desc: '最大HP+20', cost: 150, amount: 20 },
        { type: 'max_energy', icon: '⚡', name: '能量上限', desc: '最大能量+1', cost: 200, amount: 1 }
    ];
}

function buyItem(index) {
    const item = currentShopItems[index];
    
    if (!item || item.sold || dungeonGameState.gold < item.cost) return;
    
    dungeonGameState.gold -= item.cost;
    item.sold = true;
    
    switch (item.type) {
        case 'card':
            const effects = Object.keys(dungeonCardEffects);
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            addCardToDeck(randomEffect);
            addBattleLog('购买了卡牌！');
            break;
        case 'heal':
            dungeonGameState.playerHP = Math.min(
                dungeonGameState.playerMaxHP,
                dungeonGameState.playerHP + item.amount
            );
            addBattleLog(`恢复了 ${item.amount} HP！`);
            break;
        case 'max_hp':
            dungeonGameState.playerMaxHP += item.amount;
            dungeonGameState.playerHP += item.amount;
            addBattleLog(`最大HP提升 ${item.amount}！`);
            break;
        case 'max_energy':
            dungeonGameState.maxEnergy += item.amount;
            addBattleLog('最大能量提升！');
            break;
    }
    
    playDungeonSound('gold');
    renderShopItems();
}

// ==================== 营地系统 ====================
let currentCampFloorIndex = 0;
let currentCampRoomIndex = 0;

function showCampScreen(floorIndex = 0, roomIndex = 0) {
    currentCampFloorIndex = floorIndex;
    currentCampRoomIndex = roomIndex;
    showScreen('camp-screen');
    playDungeonSound('camp');
}

// ==================== 特殊房间系统 ====================
let currentSpecialFloorIndex = 0;
let currentSpecialRoomIndex = 0;

function showSpecialRoom(floorIndex = 0, roomIndex = 0) {
    currentSpecialFloorIndex = floorIndex;
    currentSpecialRoomIndex = roomIndex;
    
    playDungeonSound('button');
    const specialContent = document.getElementById('special-content');
    
    if (typeof vocabulary3500 === 'undefined' || !vocabulary3500.words) {
        specialContent.innerHTML = '<p>词汇库未加载，跳过特殊房间</p><button class="btn-action" onclick="completeRoom(currentSpecialFloorIndex, currentSpecialRoomIndex)">继续</button>';
        showScreen('special-room');
        return;
    }
    
    const randomWord = vocabulary3500.words[Math.floor(Math.random() * vocabulary3500.words.length)];
    const correctAnswer = randomWord.translation || randomWord.meaning || '';
    
    let html = `
        <div class="special-question">
            <p>请选择 "${randomWord.word}" 的正确翻译：</p>
        </div>
        <div class="special-options" id="special-options">
    `;
    
    const options = [correctAnswer];
    while (options.length < 4) {
        const randomOpt = vocabulary3500.words[Math.floor(Math.random() * vocabulary3500.words.length)];
        const optText = randomOpt.translation || randomOpt.meaning || '';
        if (optText && !options.includes(optText)) {
            options.push(optText);
        }
    }
    
    options.sort(() => Math.random() - 0.5);
    
    options.forEach(opt => {
        const isCorrect = opt === correctAnswer;
        html += `<button class="special-option" onclick="answerSpecial(${isCorrect}, '${correctAnswer}')">${opt}</button>`;
    });
    
    html += '</div>';
    specialContent.innerHTML = html;
    showScreen('special-room');
}

function answerSpecial(correct, correctAnswer) {
    const content = document.getElementById('special-content');
    
    if (correct) {
        const goldReward = Math.floor(20 + Math.random() * 30);
        dungeonGameState.gold += goldReward;
        content.innerHTML = `
            <div class="special-result success">
                <p>🎉 回答正确！</p>
                <p class="correct-answer">正确答案: ${correctAnswer}</p>
                <p>获得 ${goldReward} 金币！</p>
                <button class="btn-action" onclick="completeRoom(currentSpecialFloorIndex, currentSpecialRoomIndex)">继续</button>
            </div>
        `;
    } else {
        const damage = Math.floor(dungeonGameState.playerMaxHP * 0.1);
        dungeonGameState.playerHP -= damage;
        content.innerHTML = `
            <div class="special-result fail">
                <p>❌ 回答错误！</p>
                <p class="correct-answer">正确答案: ${correctAnswer}</p>
                <p>受到 ${damage} 点伤害！</p>
                <button class="btn-action" onclick="completeRoom(currentSpecialFloorIndex, currentSpecialRoomIndex)">继续</button>
            </div>
        `;
    }
}

// ==================== 游戏结束 ====================
function gameOver() {
    dungeonGameState.inBattle = false;
    document.getElementById('gameover-floor').textContent = dungeonGameState.floor;
    document.getElementById('gameover-floors').textContent = dungeonGameState.floor;
    document.getElementById('gameover-kills').textContent = dungeonGameState.kills;
    document.getElementById('gameover-gold').textContent = dungeonGameState.goldEarned;
    showScreen('gameover-screen');
    playDungeonSound('defeat');
}

function showVictoryScreen() {
    const playTime = Math.floor((Date.now() - dungeonGameState.startTime) / 1000);
    const minutes = Math.floor(playTime / 60);
    const seconds = playTime % 60;
    
    document.getElementById('victory-floors').textContent = dungeonGameState.floor - 1;
    document.getElementById('victory-kills').textContent = dungeonGameState.kills;
    document.getElementById('victory-gold').textContent = dungeonGameState.goldEarned;
    document.getElementById('victory-cards').textContent = dungeonGameState.deck.length;
    document.getElementById('victory-time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('victory-class').textContent = 
        dungeonClasses[dungeonGameState.playerClass].name;
    
    showScreen('victory-screen');
    playDungeonSound('victory');
}

// ==================== 工具函数 ====================
function showScreen(screenId) {
    var dungeonStart = document.getElementById('dungeon-start');
    var dungeonGame = document.getElementById('dungeon-game');
    var dungeonMap = document.getElementById('dungeon-map-screen');
    var rewardScreen = document.getElementById('reward-screen');
    var shopScreen = document.getElementById('shop-screen');
    var campScreen = document.getElementById('camp-screen');
    var specialRoom = document.getElementById('special-room');
    var gameoverScreen = document.getElementById('gameover-screen');
    var victoryScreen = document.getElementById('victory-screen');
    
    if (dungeonStart) dungeonStart.style.display = 'none';
    if (dungeonGame) dungeonGame.style.display = 'none';
    if (dungeonMap) dungeonMap.style.display = 'none';
    if (rewardScreen) rewardScreen.style.display = 'none';
    if (shopScreen) shopScreen.style.display = 'none';
    if (campScreen) campScreen.style.display = 'none';
    if (specialRoom) specialRoom.style.display = 'none';
    if (gameoverScreen) gameoverScreen.style.display = 'none';
    if (victoryScreen) victoryScreen.style.display = 'none';
    
    const screen = document.getElementById(screenId);
    if (screen) screen.style.display = 'block';
}

function getRarityName(rarity) {
    const names = {
        common: '普通',
        rare: '稀有',
        epic: '史诗',
        legendary: '传说'
    };
    return names[rarity] || rarity;
}

function addBattleLog(message) {
    const log = document.getElementById('dungeon-log');
    if (!log) return;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// ==================== 市场系统 ====================
let marketCards = [];

function initMarket() {
    const marketNavBtn = document.querySelector('.gacha-nav-btn[data-section="market"]');
    if (marketNavBtn) {
        marketNavBtn.addEventListener('click', function() {
            showMarketSection();
        });
    }
    
    const refreshBtn = document.getElementById('market-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshMarket);
    }
    
    updateMarketScore();
}

function showMarketSection() {
    document.querySelectorAll('.gacha-section').forEach(s => s.classList.remove('active'));
    const marketSection = document.getElementById('gacha-market-section');
    if (marketSection) {
        marketSection.classList.add('active');
    }
    
    if (marketCards.length === 0) {
        refreshMarket();
    } else {
        renderMarketCards();
    }
    
    updateMarketScore();
}

function updateMarketScore() {
    const scoreEl = document.getElementById('market-score');
    if (scoreEl && typeof getScore === 'function') {
        scoreEl.textContent = getScore();
    } else if (scoreEl) {
        const score = localStorage.getItem('userScore') || 0;
        scoreEl.textContent = score;
    }
}

function refreshMarket() {
    const refreshCost = 50;
    let currentScore = 0;
    
    if (typeof getScore === 'function') {
        currentScore = getScore();
    } else {
        currentScore = parseInt(localStorage.getItem('userScore') || 0);
    }
    
    if (currentScore < refreshCost) {
        alert('积分不足！需要50积分刷新市场。');
        return;
    }
    
    if (typeof deductScore === 'function') {
        deductScore(refreshCost);
    } else {
        localStorage.setItem('userScore', currentScore - refreshCost);
    }
    
    updateMarketScore();
    
    marketCards = [];
    const cardCount = 8;
    
    for (let i = 0; i < cardCount; i++) {
        const rarity = getRandomMarketRarity();
        const card = generateMarketCard(rarity);
        card.price = getMarketCardPrice(rarity);
        card.sold = false;
        marketCards.push(card);
    }
    
    renderMarketCards();
}

function getRandomMarketRarity() {
    const rand = Math.random();
    if (rand < 0.5) return 'common';
    if (rand < 0.8) return 'rare';
    if (rand < 0.95) return 'epic';
    return 'legendary';
}

function getMarketCardPrice(rarity) {
    const prices = {
        common: 20,
        rare: 50,
        epic: 100,
        legendary: 200
    };
    return prices[rarity] || 20;
}

function generateMarketCard(rarity) {
    const effects = Object.keys(dungeonCardEffects);
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    const effect = dungeonCardEffects[randomEffect];
    
    let word = 'Unknown';
    let translation = '';
    let phonetic = '';
    
    if (typeof vocabulary3500 !== 'undefined' && vocabulary3500.words) {
        const randomWord = vocabulary3500.words[Math.floor(Math.random() * vocabulary3500.words.length)];
        word = randomWord.word;
        translation = randomWord.translation || randomWord.meaning || '';
        phonetic = randomWord.phonetic || '';
    }
    
    return {
        id: Date.now() + Math.random(),
        word,
        translation,
        phonetic,
        effect: randomEffect,
        effectData: { ...effect },
        rarity
    };
}

function renderMarketCards() {
    const grid = document.getElementById('market-grid');
    if (!grid) return;
    
    if (marketCards.length === 0) {
        grid.innerHTML = `
            <div class="market-empty">
                <div class="market-empty-icon">🏪</div>
                <p>市场暂无卡牌</p>
                <p>点击刷新按钮上架新卡牌</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    marketCards.forEach((card, index) => {
        html += `
            <div class="market-card ${card.sold ? 'sold' : ''}" onclick="buyMarketCard(${index})">
                <span class="market-card-rarity ${card.rarity}">${getRarityName(card.rarity)}</span>
                <div class="market-card-word">${card.word}</div>
                <div class="market-card-phonetic">${card.phonetic}</div>
                <div class="market-card-effect">
                    <div class="market-card-effect-name">${card.effectData.name}</div>
                    <div class="market-card-effect-desc">${card.effectData.desc}</div>
                </div>
                <div class="market-card-price">
                    <span>💰</span>
                    <span>${card.sold ? '已售出' : card.price}</span>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function buyMarketCard(index) {
    const card = marketCards[index];
    
    if (!card || card.sold) return;
    
    let currentScore = 0;
    if (typeof getScore === 'function') {
        currentScore = getScore();
    } else {
        currentScore = parseInt(localStorage.getItem('userScore') || 0);
    }
    
    if (currentScore < card.price) {
        alert('积分不足！');
        return;
    }
    
    if (typeof deductScore === 'function') {
        deductScore(card.price);
    } else {
        localStorage.setItem('userScore', currentScore - card.price);
    }
    
    card.sold = true;
    
    collectedCards.push(card);
    saveCollectedCards();
    
    updateMarketScore();
    renderMarketCards();
    
    alert(`成功购买卡牌：${card.word}！`);
}

// ==================== 卡组选择事件 ====================
function setupDeckSelectionEvents() {
    const deckCards = document.querySelectorAll('.deck-card');
    deckCards.forEach(card => {
        card.addEventListener('click', function() {
            deckCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            dungeonGameState.selectedDeckId = this.dataset.deck;
            playDungeonSound('button');
        });
    });
    
    const createCustomDeckBtn = document.getElementById('create-custom-deck-btn');
    if (createCustomDeckBtn) {
        createCustomDeckBtn.addEventListener('click', function() {
            showCustomDeckCreator();
        });
    }
    
    updateCustomDecksList();
}

// ==================== 音频播放器集成 ====================
function addDungeonAudioToPlayer(audioSrc, title) {
    if (typeof addToPlaylist === 'function') {
        addToPlaylist(title, audioSrc);
    }
}

function playDungeonBGM() {
    if (dungeonGameState.soundEnabled) {
        addDungeonAudioToPlayer('audio/dungeon-bgm.mp3', '地下城背景音乐');
    }
}

document.addEventListener('DOMContentLoaded', initDungeonNew);

console.log('单词地下城游戏逻辑 v3.0 加载完成！');
