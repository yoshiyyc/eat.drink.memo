# UI Redesign Design Spec

## Goal

將 eat.drink.memo 從 SaaS Dashboard 風格改為 Editorial / Personal Journal 風格。目標感受：「A personal bubble tea journal disguised as an independent magazine.」

## 核心原則

- Typography 優先於裝飾
- 留白建立層次，不依賴陰影
- 細線 divider 取代卡片
- Accent 色只佔畫面約 3–5%，不做大面積色塊
- 內容（店名、飲料名、評語）本身就是視覺主角

## 色彩系統

```css
--color-bg:           #F7F4EF;   /* 米白底色 */
--color-text:         #1A1A1A;   /* 近黑主文字 */
--color-accent:       #4D8070;   /* Soda Green — section label、評分、連結、active 狀態 */
--color-border:       #D4C5B0;   /* 主要邊框、分隔線 */
--color-border-light: #E8DED0;   /* 列表項之間的細線 */
--color-muted:        #888888;   /* 次要文字、日期 */
--color-faded:        #CCCCCC;   /* 空星、未激活狀態 */
```

**禁止使用：**
- Tailwind 預設 indigo 配色（`indigo-*`）
- `rounded-xl` / `rounded-2xl`（最多 `rounded-sm` 或不圓角）
- `shadow-*`（任何陰影）
- Hero section / 彩色 banner
- 彩色卡片背景

## 字體層次

| 用途 | 大小 | 粗細 | 顏色 |
|------|------|------|------|
| Section label | 12px | 700 | `--color-accent` |
| 飲料名稱（主角） | 14px | 600 | `--color-text` |
| 店家名稱 | 12px | 400 | `--color-accent` |
| 暱稱 | 13px | 600 | `--color-text` |
| 評語引言 | 12px | 400 | `#666` |
| 日期 | 11px | 400 | `--color-muted` |
| 本週排行編號 | 11px | 400 | accent（#1）/ border（其他）|

## Signature UI Patterns

### Section Label
```
UPPERCASE · letter-spacing 1.5px · 12px · font-weight 700 · accent 色
──────────────────────── （1px border 線，color-border）
```

### 日期格式
- 同年：`06.14`
- 跨年：`2026.06.14`
- 不附星期縮寫

### 評分
- 星星 ★，填滿用 `--color-accent`，空星用 `--color-faded`
- 例：`★★★★☆`（4 分）

### 引言
- 使用 `「」` 書名號，不使用 `""`

### 最新紀錄條目排版
```
暱稱（13px bold）                    日期（11px muted）
店名（12px accent）· 飲料名（14px bold）   ★★★★☆
「評語內容」（12px #666）
```

### 本週排行條目排版
```
01  五十嵐 · 黃金烏龍茶拿鐵            ×4（accent bold）
02  珍煮丹 · 黑糖珍珠鮮奶              ×2（border 色，次要）
```
- 編號 01：accent 色
- 編號 02+：`--color-border`（漸退）

## 版面結構（首頁，順序不變）

### 1. Navbar
```
eat.drink.memo                    + 記錄這杯
─────────────────────────────────────（1.5px border-bottom）
```
- 左：品牌名 14px bold
- 右：黑底白字按鈕（`bg: #1A1A1A, color: #F7F4EF`），不用 accent 色
- 無 Hero section

### 2. 店家
- Section label + 細線
- Grid：`grid-cols-3 sm:grid-cols-4 md:grid-cols-5`
- 每格：`border: 1px solid --color-border`，padding，圓角最多 `rounded-sm`，無 shadow
- 最後一格（看全部）：`border-style: dashed`，文字 accent 色

### 3. 本週排行
- Section label + 細線
- Editorial list，用 `border-bottom: 1px solid --color-border-light` 分隔

### 4. 最新紀錄
- Section label + 細線
- Feed 格式，用 `border-bottom: 1px solid --color-border-light` 分隔
- 無外框卡片

## 需要改動的範圍

**全站通用（每個頁面都要更新）：**
- `src/index.css`：設定 CSS variables + `body { background: var(--color-bg) }`
- `src/components/layout/Navbar.jsx`：重設樣式
- `src/components/layout/Layout.jsx`：背景色

**首頁：**
- `src/pages/HomePage.jsx`：移除 Hero，套用新 section label、店家格、排行、最新紀錄排版

**其他頁面（後續迭代）：**
- `src/pages/ShopPage.jsx`
- `src/pages/DrinkPage.jsx`
- `src/pages/NewReviewPage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/ShopsPage.jsx`
