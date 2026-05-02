// 所有旅行内容的汇总入口。每个地点与章节可以放在自己的文件里（见
// rainyShrineRoute.js）。要新增地点/章节：
//   1. 在 src/data/ 下建立新的文件，导出 `<name>Location`、
//      `<name>Items`、`<name>PhotoGroups`。
//   2. 在这里 import 并合并到 `locations`、`items`、`photoGroups`。

import {
  rainyShrineLocation,
  rainyShrineItems,
  rainyShrinePhotoGroups,
} from './rainyShrineRoute.js'

// ---------- 短章节使用的纪念品 ----------
const nightMarketItems = {
  paper_bag: {
    id: 'paper_bag',
    name: '夜市的纸袋',
    emoji: '🛍️',
    description: '它装着那一晚所有小吃的味道。',
  },
  recommendation_note: {
    id: 'recommendation_note',
    name: '老板的手写推荐',
    emoji: '📝',
    description: '摊贩随口的一句话，却成了那段记忆的方向。',
  },
  map_fragment: {
    id: 'map_fragment',
    name: '地图残片',
    emoji: '🗒️',
    description: '被小狗叼回来的、那张被风吹皱的纸。',
  },
}

// ---------- 夜市章节的相片集 ----------
const photo = (id, title, caption, opts = {}) => ({
  id,
  title,
  caption,
  imageUrl: opts.imageUrl ?? null,
  type: opts.type || 'detail',
  emoji: opts.emoji || '📸',
  gradient: opts.gradient || 'from-amber-200 to-rose-200',
})

const nightMarketPhotoGroups = {
  pg_dog_alley: {
    id: 'pg_dog_alley',
    title: '巷口的小狗',
    caption: '它抬头看了你一眼，又小跑回摊位的暖光里。',
    photos: [
      photo('p_dog_1', '那只小狗', '嘴里还叼着一张破掉的地图残片。', { type: 'main', emoji: '🐶', gradient: 'from-amber-200 via-rose-200 to-orange-300' }),
      photo('p_dog_2', '摊位的背景', '黄昏里的灯笼和蒸汽。', { emoji: '🏮', gradient: 'from-rose-200 to-amber-200' }),
    ],
  },
  pg_night_market_evening: {
    id: 'pg_night_market_evening',
    title: '夜市的傍晚',
    caption: '那一晚的灯光，比记忆里还要再亮一些。',
    photos: [
      photo('p_nm_1', '全景', '摊位之间流动的暖色光河。', { type: 'main', emoji: '🏮', gradient: 'from-rose-300 via-amber-200 to-yellow-200' }),
      photo('p_nm_2', '人声与烟', '一百个让你慢下来的小理由。', { emoji: '🍢', gradient: 'from-amber-200 to-rose-200' }),
    ],
  },
}

// ---------- 夜市地点（短章节） ----------
const nightMarketLocation = {
  id: 'night_market',
  name: '夜市',
  emoji: '🏮',
  description: '灯光、烟气，还有一百个让你慢下来的小理由。',
  pos: { top: '38%', left: '54%' },
  status: 'available',
  chapterType: 'short',
  parts: [{ id: 'evening', name: '走在摊位之间' }],
  events: [
    {
      id: 'nm_e1',
      partId: 'evening',
      time: '18:20',
      title: '抵达夜市入口',
      scene: '夜市入口',
      sceneGradient: 'from-amber-200 via-rose-200 to-orange-200',
      sceneEmoji: '🏮',
      interactable: { label: '夜市招牌', emoji: '🪧' },
      actionButtonText: '看一眼夜市招牌',
      narration:
        '灯一盏一盏亮了起来，空气里都是小吃的味道。',
      rewardItemIds: ['paper_bag'],
      unlockPhotoGroupIds: [],
    },
    {
      id: 'nm_e2',
      partId: 'evening',
      time: '18:35',
      title: '摊贩老板的推荐',
      scene: '小吃摊',
      sceneGradient: 'from-rose-200 via-amber-200 to-orange-200',
      sceneEmoji: '🍢',
      interactable: { label: '摊贩老板', emoji: '🧑\u200d🍳' },
      actionButtonText: '听老板说两句',
      dialogue:
        '第一次来吧？再往前走几步，那边有一家甜品店很受欢迎哦。',
      rewardItemIds: ['recommendation_note'],
      unlockPhotoGroupIds: [],
    },
    {
      id: 'nm_e3',
      partId: 'evening',
      time: '18:50',
      title: '巷口的小狗',
      scene: '摊位之间的小巷',
      sceneGradient: 'from-amber-200 via-rose-200 to-orange-300',
      sceneEmoji: '🐶',
      interactable: { label: '小狗', emoji: '🐶' },
      actionButtonText: '蹲下来打个招呼',
      narration:
        '一只小狗从摊位旁边跑了过来，嘴里叼着被风吹走的地图残片。',
      rewardItemIds: ['map_fragment'],
      unlockPhotoGroupIds: ['pg_dog_alley'],
    },
    {
      id: 'nm_e4',
      partId: 'evening',
      time: '19:10',
      title: '夜市的那张照片',
      scene: '人最多的摊位排',
      sceneGradient: 'from-rose-300 via-amber-200 to-yellow-200',
      sceneEmoji: '📷',
      interactable: { label: '相机', emoji: '📷' },
      actionButtonText: '按下快门',
      narration:
        '你停下来拍了一张照。那一晚没发生什么戏剧性的事，可是灯光和人声都留在了记忆里。',
      rewardItemIds: [],
      unlockPhotoGroupIds: ['pg_night_market_evening'],
      isFinal: true,
    },
  ],
}

// ---------- 锁定中 / 即将推出的地点 ----------
const lockedLocations = [
  {
    id: 'taipei_main',
    name: '台北车站',
    emoji: '🚉',
    description: '每段旅程的起点，也是每段旅程的终点。',
    pos: { top: '32%', left: '44%' },
    status: 'locked',
    parts: [],
    events: [],
  },
  {
    id: 'seaside',
    name: '海边',
    emoji: '🌊',
    description: '东海岸某个地方，风里都是盐的味道。',
    pos: { top: '60%', left: '64%' },
    status: 'locked',
    parts: [],
    events: [],
  },
  {
    id: 'return_trip',
    name: '回程',
    emoji: '✈️',
    description: '回去的路，总是比来时还要长一点。',
    pos: { top: '82%', left: '40%' },
    status: 'locked',
    parts: [],
    events: [],
  },
]

// ---------- 对外导出 ----------
export const items = {
  ...nightMarketItems,
  ...rainyShrineItems,
}

export const photoGroups = {
  ...nightMarketPhotoGroups,
  ...rainyShrinePhotoGroups,
}

export const locations = [
  lockedLocations[0],            // 台北车站
  nightMarketLocation,
  rainyShrineLocation,
  lockedLocations[1],            // 海边
  lockedLocations[2],            // 回程
]

export const STORAGE_KEY = 'return_to_taiwan_v2'
