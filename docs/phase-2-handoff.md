# Learning Programme 2.0 Phase 2 — 交付紀錄

日期：2026-09-27。此次只修改既有專案，沒有重置 Phase 1 的未提交工作，也沒有部署或改動遠端資料庫。詳細的改版前狀態見 [Phase 1 audit](./phase-2-audit.md)。

| # | 項目 | 結果 |
| --- | --- | --- |
| 1 | Phase 1 audit | 四環境、六語動態路由、共用資料模型、PWA 與舊路由已存在；遠端資料庫尚未套用 2026-07-22 Japanese 及 2026-09-27 Phase 1 migration。 |
| 2 | 原本已完整 | 基本單語 CRUD、語言 scoped adapters、Text types、Greek normalization utility、comparison 參照模型及原子 RPC、舊資料 read-only archive。 |
| 3 | 原本未完成 | 全語搜尋、詞條詳情路由、續讀、Text 作者/來源表單、Text 端建立與管理關聯、比較篩選及部分語言詞性欄位。 |
| 4 | Future-proof environments | `src/lib/environments.ts` 成為 ID、路徑、視覺插槽、PWA 和環境內導覽的單一設定；Record 使用該設定，root 認證仍只管登入。 |
| 5 | Languages shared architecture | 六語共用 `config.ts`、`model.ts`、`repository.ts`、`EntryForm`、`LanguageModule` 和動態路由；語言差異由設定及 adapters 表達。 |
| 6 | 六種語言 | English、German、Russian、Japanese、Ancient Greek、Latin 都經同一套路由提供 Overview、Vocabulary、Sentences、Texts、Grammar、Search 及詞條詳情；日語 Kana/Analysis/Anki 保留。 |
| 7 | Vocabulary schema | 共用 lemma、meanings、part of speech、notes、tags、`metadata`、`language_metadata`；新資料沿用既有 `vocabulary` / `japanese_vocabulary` 表和 Phase 1 擴充欄位。 |
| 8 | 各語言 metadata | English：複數、動詞主要形式、形容詞比較級/最高級。German：性、複數、不定式、主要形式、可分性、前綴、格支配/配價、反身、形容詞形式。Russian：性、體/體對、格支配。Japanese：漢字/書寫、讀音、及物性、動詞/形容詞類型。Greek：主格、屬格、冠詞、性、名詞類別、形容詞詞典形、動詞主要形式/類別。Latin：主格、屬格、性、變格、主要形式、變位、形容詞詞典形/類別。 |
| 9 | Ancient Greek normalization | 搜尋專用 NFD 去組合記號及末尾 sigma 正規化；顯示/儲存不改原文。測試涵蓋 ἄνθρωπος、ἡμέρα、οἶκος 及 NFC/NFD。 |
| 10 | Sentences | 六語共用新增、列表、詳情、編輯、刪除、搜尋、標籤、翻譯、解釋及 optional source Text。Text 內可直接建立預設來源的 Sentence。 |
| 11 | Texts | 六語沿用 `articles` 適配為 Texts；支援 title、body、type、可重用 custom type、作者、來源、翻譯、notes、tags、來源句與出現詞彙。 |
| 12 | Grammar | `language_notes` 的語言 scoped Grammar CRUD、詳情、搜尋和標籤；沒有跨語言 Grammar 比較。 |
| 13 | 單語搜尋 | `/languages/[language]/search` 僅載入該語言資料，可依詞條類型篩選；列表本身亦有搜尋、詞性/標籤篩選。 |
| 14 | Cross-language model | `language_comparisons` + `language_comparison_links` 儲存 2–6 語的 Vocabulary、Sentence、Concept、Text 參照；不複製來源詞條。 |
| 15 | Link existing entry | 比較編輯器各語有 scoped picker，可搜尋及替換現有 entry；比較卡片連到來源詳情，並可依 type / language 篩選。 |
| 16 | Create missing entry | 比較編輯器直接開共用 `EntryForm`；成功建立後把新 entry 加入 picker 並選為當前語言的 link。 |
| 17 | Data migration | 本次無破壞性新 migration；依賴 repo 既有的 Japanese 及 Phase 1 additive migrations。PGlite 成功套用 Phase 1 migration；遠端尚未套用。 |
| 18 | 舊資料保護 | 保留舊 ID、舊 Text 內容、日語工具、legacy mixed sentence columns/舊 comparison archive；更新 mixed sentence 時只改目標語言欄位。 |
| 19 | 刪除關聯 | Text 與 Vocabulary/Sentence 可解除來源關聯；刪 comparison 只刪參照，資料庫 FK 限制仍在引用中的 entry/Text 刪除。 |
| 20 | Philosophy/Fitness/Record | 原路由保留、正式 build 成功產生；Record 導覽改用環境設定。未有登入態資料的逐頁互動驗收，因此不聲稱遠端功能已實測。 |
| 21 | iPad/iPhone responsive | 新頁面採可換行導覽、`min-w-0`、響應式 grid、44px 以上操作目標；尚未完成實際裝置視覺檢查。 |
| 22 | Lint | `npm run lint`：0 errors；既有 Blog `<img>` 仍有 3 warnings。 |
| 23 | Typecheck | `npm run typecheck` 通過。 |
| 24 | Tests | `npm test`：30 passed，含 PostgreSQL migration/RLS/關聯、三語比較增減、六語 note CRUD、Greek 搜尋及續讀路徑。 |
| 25 | Production build | `npm run build` 通過，包含新增詞條詳情路由。 |
| 26 | 尚待處理 | 遠端需先套用 202607220001 Japanese migration，再套用 20260927032145 Phase 1 migration；之後需要登入態六語 CRUD/比較與 iPad/iPhone 實機或瀏覽器驗收，才能宣稱正式環境完整可用。 |
| 27 | Phase 3 技術債 | 若資料量增加，可把 Cross-language 一次載入六語改成分批/搜尋 API；目前 metadata JSON 是擴充點，後續可視實際需求再增加專用欄位，不必預先建立形態變化引擎。 |

## 上線順序

1. 備份現有 Supabase 資料，先審閱 repo 的兩個尚未套用 migration。按時間順序套用 Japanese，再套用 Phase 1；確認 migration history、五張新表、RLS、RPC 及舊資料列數。
2. 執行 `npm test`、`npm run typecheck`、`npm run lint`、`npm run build`。
3. 使用登入帳號逐語建立、修改、刷新、刪除 Vocabulary / Sentence / Text / Grammar，驗證 Text ↔ Vocabulary、Text → Sentence、2/6 語 comparison、來源資料更新反映與安全刪除。
4. 於 iPad landscape 與 iPhone 驗收指定頁面無頁面級水平溢出，再照目前專案的部署管道發佈。

程式在缺少 migration 時會顯示 schema 警告並停用新增/編輯，避免把新功能誤寫進不完整的遠端資料庫。相關瀏覽器操作先前被自動審核拒絕，沒有繞過審核進行視覺驗收。
