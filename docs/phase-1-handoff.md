# Learning Programme 2.0 — Phase 1 交接

專案：`C:\Users\USER\chunduans-learning-programme`。日期：2026-09-27。

程式碼與本機驗證已完成。**遠端 Supabase 尚未套用新 migration，也尚未部署網站。** 目前連接原資料庫時，舊資料可以閱讀；依賴新 schema 的編輯操作會停用並顯示提示。

## 1. 主要 routes

- `/`：只有 Languages、Philosophy、Fitness、Record 四張入口卡。
- `/languages`：六種語言；Cross-language 是獨立區塊。
- `/languages/{en,de,ru,ja,grc,la}`：各自的 Overview。
- `/languages/[language]/{vocabulary,sentences,texts,grammar,concepts}`：共用實作、嚴格限定語言。
- `/languages/cross-language`：跨語言比較、搜尋與舊比較檔案。
- `/languages/ja/{kana,analysis,anki}`：保留既有日文工具。
- `/record/{schedule,progress,daily-log}`：搬移既有 page wrapper，保持原功能。
- `/philosophy` 與 `/fitness`：只調整外層隔離與 PWA metadata。

全站 sidebar 已移除。環境內不提供 Home、其他環境或 app switcher。單語言內沒有其他語言／Cross-language 導航。

## 2. Shared components

- `VisualEntryCard` / `VisualSlot`：中性缺圖 fallback、比例槽、兩種卡片 variant。
- `LocalNavigation`：可換行的局部導覽，44px 觸控高度。
- `LanguageModule` / `EntryForm`：六語共用讀取、搜尋、CRUD 與依詞性變化的表單。
- `EntryTools`：既有句子朗讀及日文 Anki 草稿入口。
- `CrossLanguageWorkspace`：選語言、選類型、引用既有 entry、流程內建立正式 entry。
- `AppShell`：只處理登入狀態與共用頁面容器；`PwaRegistration` 註冊同源 service worker。

AI 草稿、隨機句子沿用原有 API。未更換模型、建立新 AI backend 或新增 morphology engine。

## 3. Data migration

檔案：`supabase/migrations/20260927032145_learning_programme_phase1.sql`。

這是 additive migration，使用既有 Supabase，不加入新 ORM 或正式資料庫服務。

- 既有 Vocabulary 增加 meanings、tags、metadata、language_metadata；共同模型透過 adapter 對接既有一般／日文表。
- `articles` 繼續作為 Texts 的 backing table，新增 text_type、custom_type、tags、metadata。未 rename 或 drop 原表。
- 新增 `language_notes`，存結構化 Grammar 與 Concept。
- 新增 `language_comparisons`、`language_comparison_links`。
- 新增 `sentence_text_sources`、`vocabulary_text_occurrences`。
- 只在舊 language 欄位為 NULL 時，從既有 language_id 關係補值。
- 新表有 owner RLS、authenticated grants、外鍵、必要索引與關係驗證 trigger。

`@electric-sql/pglite` 僅用於 devDependency 的暫存 PostgreSQL 測試，不是 app 的新 storage。

## 4. 舊資料保留

原有 row ID、language、Unicode 字串、筆記與原欄位保留。資料 adapter 將旧欄位接入共同模型；較特殊的舊資訊也可在 Metadata 中閱讀。

舊 `sentences.mode=all` 在單語言中僅投影該語言欄位；不能從單語言 UI 刪除整筆共享句子。修改該語言時也只更新該欄位。整筆共享註解保存在 Cross-language 的相容檔案中。

舊 `comparison_documents` / `term_alignments` 是複製文字型態，無法安全猜出每段文字對應哪一筆正式 entry。因此保留為可搜尋的唯讀 archive；不自動製造或猜測引用關係。需要編輯的比較可在新流程中以正確正式 entry 重建。

工作開始前已有修改的四個 AI API 及 Japanese sentence migration 經檔案雜湊確認未變動。原 Vocabulary／Sentences／Articles／Review／Dashboard 頁面來源保存在 `docs/phase1-legacy/`；另有開工前 `src` / `supabase` snapshot：`C:\Users\USER\Documents\Learning Programme\phase1-safety-snapshot`。

## 5. Languages architecture

`src/lib/languages/config.ts` 集中六語的 code、顯示名稱、route、visual、別名、模組、搜尋策略與詞性欄位。Ancient Greek 使用 `grc`，不接受 `el`。

`model.ts` 提供共同 LanguageEntry / VocabularyEntry / TextEntry / GrammarEntry、舊資料 adapter 與 payload 映射；`repository.ts` 管理既有 Supabase CRUD 與關係。查詢在資料庫層限定語言，再於搜尋層二次限定。

希臘文、拉丁文、德文、俄文、日文的語言／詞性 metadata 依 config 動態顯示；英語使用共同欄位。每個語言先到 Overview，不自動跳到上次頁面。可選功能 Continue where you left off 本期未加入。

## 6. Cross-language relations

比較保存 title、kind、2–6 個不同 language codes、notes。每個選取語言有一條 link，link 使用外鍵引用原 Vocabulary / Sentence / Concept / Text，不複製內容。Grammar comparison 不開放。

`save_language_comparison` RPC 在單一 transaction 中儲存比較與 links，避免半筆資料。資料庫會拒絕缺少第二語言、缺漏 entry、錯誤 owner、語言／類型不符等情況。刪除比較不會刪除原 entry；有引用的 entry 不可直接刪除。

Sentence → Text 是單一來源關係；Vocabulary ↔ Text 是可附 location、notes 的多對多 occurrences。關係只容許相同 owner 與語言。

單語言的 `Cross-language comparison exists` 是純文字 indicator，沒有 href 或 click handler。重新載入比較會讀取正式 entry 的最新內容；不是 realtime subscription。

## 7. Greek normalization

獨立 utility：`src/lib/languages/search.ts`。搜尋字串與搜尋用表示轉小寫、NFD 分解、移除 Unicode combining marks，再 NFC 組合；也統一 final sigma。涵蓋 acute、grave、circumflex、smooth／rough breathing、iota subscript。

例如 `ανθρωπος` 可找到 `ἄνθρωπος`。資料庫與 UI 始終保存／顯示原 polytonic 字串，不將 normalized representation 寫回原資料。其他語言不套用希臘文去音標規則。

## 8–9. Visual folders 與 exact paths

所有資源放在本 repo 的 `public/visuals/`；16 個預留目錄均已有 `.gitkeep`。

完整逐檔路徑列在 [`public/visuals/README.md`](../public/visuals/README.md)。該檔列出 11 個 cover.webp 與 5 個 icon-512.png 的 exact paths，並說明 optional 192px／180px icons。

Cover 預設 16:10；圖片與 icon 分開。沒有 stock image、AI image、gradient 或最終色彩設計。Phase 2 放入圖片後重新 build/deploy 即可，不必重構 layout。

## 10. PWA 與 authentication

| Entry | start_url | Manifest |
| --- | --- | --- |
| Learning Programme | `/` | `/pwa/main/manifest.webmanifest` |
| Languages | `/languages` | `/pwa/languages/manifest.webmanifest` |
| Philosophy | `/philosophy` | `/pwa/philosophy/manifest.webmanifest` |
| Fitness | `/fitness` | `/pwa/fitness/manifest.webmanifest` |
| Record | `/record` | `/pwa/record/manifest.webmanifest` |

五份 manifest 有不同 id、名稱、start_url、icon 路徑，各環境 layout 設置對應 manifest 與 Apple metadata。scope 均為 `/`，使共用 `/login` 保持在安裝範圍。六個單語言沒有另建 PWA。

登入沿用同一 Supabase client/session。過期登入時保留 pathname、query、hash 到 next；成功後回原位置。safeDestination 阻擋外站或登入循環。瀏覽器已驗證登入後回 Philosophy，並可直接進入 Languages、Record、Fitness，沒有再次登入。

service worker 不快取 private pages 或 API，也不宣稱提供離線編輯。iOS 真機的五個獨立主畫面安裝與跨安裝 storage/session 行為尚待驗證，不能以桌面模擬器結果保證。

## 11. Legacy redirects

| Old | Destination |
| --- | --- |
| `/schedule` | `/record/schedule` |
| `/progress` | `/record/progress` |
| `/daily-log` | `/record/daily-log` |
| `/vocabulary` | `/languages` |
| `/sentences` | `/languages` |
| `/articles` | `/languages` |
| `/language-comparison` | `/languages/cross-language` |
| `/review` | `/languages/cross-language` |
| `/dashboard` | `/` |

前三個語言資料舊網址若有已知 `?language=` 別名，會轉到相應 scoped module，例如 `/articles?language=de` → `/languages/de/texts`。未知或缺少語言時回 `/languages`。Next config 提供早期 HTTP 307；page wrapper 也保留 redirect。

## 12. 上線前與尚未驗證項目

1. 核對目標 Supabase 的 migration history 與可恢復備份，確認先前 migrations 已到位（包括日文相關 schema），再套用本次 additive migration。不要重設資料庫或直接重跑全部舊 SQL。
2. 遠端 migration 未執行；目前新 Language CRUD 的儲存、正式資料上的新 comparison、Text relations 尚未做瀏覽器端到端寫入。這些關係與 RLS 已在暫存 PostgreSQL 以測試資料驗證。
3. Migration 完成後，使用測試帳號驗證新增→編輯→比較引用更新→刪除關係、sentence source、vocabulary occurrence，最後確認原資料仍存在。
4. 實際 iPad/iPhone 安裝五個 PWA，檢查 icon、start_url、登入返回與平台 session 行為。此次 responsive 檢查是瀏覽器 viewport 模擬，不是 iOS 真機測試。
5. 提供 Phase 2 視覺資源。舊複製型比較如需轉成新引用型比較，需人工確認語意對應，不能自動猜測。

無需新增 Philosophy 或 Fitness 功能決策；兩者內部設計保留。Record 只移動 wrappers，另修正原組件觸發 lint 的 effect/state 寫法。Fitness 的六時段、圖表與原有 60–66kg y-axis 未改動。

## 13. 驗證結果

- `npm test`：25/25 通過（含原日文／Fitness 測試、Unicode、路由、安全 next、相容 adapter，以及實際暫存 PostgreSQL migration / RLS / transaction / FK 驗證）。
- `npm run typecheck`：通過。
- `npm run lint`：0 errors；3 個既有 Blog `<img>` warnings。
- `npm run build`：production build 通過。
- `node scripts/phase1-smoke.mjs`：8 個轉址、5 manifests、10 張 192/512 PNG、首頁四入口、無效路由驗證通過。Next 的非串流 notFound 回 404，串流 notFound 可回 200 + 404 boundary；測試明確處理此框架行為。
- 瀏覽器：首頁 1180×820 iPad 橫向、390×844 手機、1440×900 桌機；無水平溢出。已查看實際畫面與 DOM。
- 瀏覽器：German Overview、單語搜尋（Ansatz）、Ancient Greek Overview、Japanese Overview／Kana、Cross-language 選一語時不能建立／選兩語後出現表單；手機比較表單無溢出。
- 瀏覽器：Philosophy 僅內部 links；Record 僅 Record links；Fitness 沒有全站 links/sidebar；驗證路徑共用同一登入。
- 未呼叫付費 AI generation 做驗證；原 API 維持不變，新的 UI 接回原 POST endpoints。
- 最後兩項調整（日文工具 route key、512px icon 的縮放 fallback）已通過 typecheck、lint、production build；最終 HTTP smoke 也通過。其後再次重載瀏覽器被自動審核拒絕，原因是先前瀏覽器用量限制仍被視為有效，因此這兩項的最後一次視覺重驗尚未完成，未繞過限制。前述 responsive 與登入驗證已於限制前實際完成。

本機預覽：`http://localhost:3000`。未 commit、push 或部署。
