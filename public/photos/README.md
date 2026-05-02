# 照片放在这里 📸

这个文件夹专门用来放真实旅行照片。Vite 会把 `public/` 下的所有文件原样发布到网站根路径，所以 `public/photos/foo.jpg` 在浏览器里访问的路径就是 `/photos/foo.jpg`。

## 一、上传位置

```
public/photos/                      ← 把照片放在这里
├── homestay/
│   ├── room.jpg
│   └── map.jpg
├── raincoat/
├── mountain/
├── shrine/
├── auntie/
├── temple/
├── pancake_shop/
└── night_market/
```

子目录可以随意取名，只是为了方便整理。也可以全部平铺直接放 `public/photos/` 下。

支持格式：`.jpg`、`.jpeg`、`.png`、`.webp`、`.gif`、`.avif`。

## 二、把照片接到游戏里

打开对应的数据文件：

- 夜市章节：[`src/data/travelData.js`](../../src/data/travelData.js)
- 雨天的神社路线：[`src/data/rainyShrineRoute.js`](../../src/data/rainyShrineRoute.js)

找到对应的 `photo(...)`，在最后那个对象参数里加上 `imageUrl`。例如：

```js
// 修改前（默认显示渐变 + emoji）
photo('p_homestay_1', '房间的窗户', '午后柔和的光，雨点打在玻璃上。', {
  type: 'main',
  emoji: '🛏️',
  gradient: 'from-amber-100 via-rose-100 to-sky-100',
}),

// 修改后（显示真实照片）
photo('p_homestay_1', '房间的窗户', '午后柔和的光，雨点打在玻璃上。', {
  type: 'main',
  emoji: '🛏️',
  gradient: 'from-amber-100 via-rose-100 to-sky-100',
  imageUrl: '/photos/homestay/room.jpg',   // ← 只要加这一行
}),
```

`gradient` 和 `emoji` 可以保留，照片加载失败时会作为回退。

## 三、scene 场景背景图

每个事件的场景背景也支持真实照片。在事件对象里把 `backgroundImage` 设成路径：

```js
{
  id: 'rs_e1',
  // ...
  backgroundImage: '/photos/homestay/scene.jpg',  // ← 替代渐变背景
  sceneGradient: 'from-amber-100 via-rose-100 to-sky-100', // 留着作为回退
  sceneEmoji: '🏡',
}
```

## 四、命名建议

按「章节 / 事件 / 主图或细节」取名，找起来不会乱：

```
public/photos/
└── rainy_shrine/
    ├── e01_homestay_main.jpg
    ├── e01_homestay_map.jpg
    ├── e02_raincoat_main.jpg
    ├── e05_abandoned_main.jpg
    ├── e05_abandoned_eaves.jpg
    └── e09_auntie_umbrella.jpg
```

## 五、改完之后

`npm run dev` 的开发服务器会自动热更新，不需要重启。

---

## 进阶：用 import 而不是 public 路径

如果想要 Vite 帮你做哈希、压缩和懒加载（资源会被打包，文件名会带版本号），可以放进 `src/assets/photos/` 然后 `import`：

```js
// src/data/rainyShrineRoute.js 顶部
import roomPhoto from '../assets/photos/homestay/room.jpg'

photo('p_homestay_1', '房间的窗户', '...', {
  imageUrl: roomPhoto,
}),
```

两种方式都可以。`public/photos/` 简单直观，`import` 更适合上线。
