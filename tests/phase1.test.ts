import assert from "node:assert/strict";
import test from "node:test";
import {LANGUAGE_CODES,languageCode,vocabularyFields} from "../src/lib/languages/config";
import {normalizeSearch} from "../src/lib/languages/search";
import {adaptRow,emptyEntry,entryPayload,entryKey,resolveComparison,searchEntries,validateComparison,vocabularyHeadword,type Comparison} from "../src/lib/languages/model";
import {continueStorageKey,safeContinuePath} from "../src/lib/languages/continue";
import {environments,ENVIRONMENT_KEYS,pwaEntries} from "../src/lib/environments";
import {safeDestination,loginUrl} from "../src/lib/auth-destination";
import {legacyLanguageDestination} from "../src/lib/languages/legacy-redirect";

test("Greek search folds polytonic marks, canonical decompositions and final sigma without changing original data",()=>{
  const originals=["ἄνθρωπος","ἂνθρωπος","ἆνθρωπος","ἁνθρωπος","ἀνθρωπος","ᾄνθρωπος"];
  for(const value of originals){assert.equal(normalizeSearch(value,"grc"),"ανθρωποσ");assert.equal(normalizeSearch(value.normalize("NFD"),"grc"),"ανθρωποσ");}
  const greek={...emptyEntry("grc","vocabulary"),title:"ἄνθρωπος",id:"greek"};
  assert.equal(searchEntries([greek],"ανθρωπος","grc")[0].title,"ἄνθρωπος");
  assert.equal(greek.title,"ἄνθρωπος");
  assert.equal(searchEntries([greek],"ανθρωπος","de").length,0);
  assert.equal(normalizeSearch("が","ja"),"が");
});
test("Greek search matches day and house under NFC and NFD input",()=>{
  for(const [original,plain] of [["ἡμέρα","ημερα"],["οἶκος","οικος"]]){
    const entry={...emptyEntry("grc","vocabulary"),title:original};
    assert.equal(searchEntries([entry],plain,"grc").length,1);
    assert.equal(searchEntries([entry],plain.normalize("NFD"),"grc").length,1);
    assert.equal(searchEntries([{...entry,title:original.normalize("NFD")}],plain,"grc").length,1);
    assert.equal(entry.title,original);
  }
});
test("all six language configurations use one extensible architecture",()=>{
  assert.deepEqual(LANGUAGE_CODES,["en","de","ru","ja","grc","la"]);
  assert.equal(languageCode("el"),undefined);assert.equal(languageCode("Deutsch"),"de");
  assert.ok(vocabularyFields("grc","noun").some(f=>f.key==="genitive"));
  assert.ok(vocabularyFields("la","verb").some(f=>f.key==="principal_parts"));
  assert.ok(vocabularyFields("de","verb").some(f=>f.key==="reflexive_status"));
  assert.ok(vocabularyFields("ja","動詞").some(f=>f.key==="reading"));
});
test("legacy adapters preserve IDs and language and do not duplicate mixed content",()=>{
  const row={id:"old",mode:"all",english:"knowledge",german:"Wissen",russian:"знание",japanese:"知識",notes:"shared",created_at:"today"};
  const german=adaptRow(row,"sentences","de")!;
  assert.equal(german.title,"Wissen");assert.equal(german.id,"old");
  assert.equal(adaptRow(row,"sentences","grc"),null);
  assert.deepEqual(entryPayload({...german,title:"Erkenntnis"}),{german:"Erkenntnis"});
  const oldText=adaptRow({id:"article",language:"Deutsch",title:"Old text",content:"Body",translation:"翻譯",key_vocabulary:[{word:"Wissen"}]},"articles","de")!;
  assert.equal(oldText.kind,"text");assert.equal(oldText.translation,"翻譯");assert.equal(oldText.textType,"Article");assert.deepEqual(oldText.metadata.key_vocabulary,[{word:"Wissen"}]);
  assert.equal(adaptRow({language:"日本語",id:"j",word:"知識"},"vocabulary","de"),null);
});
test("comparison references resolve current entry values and accept two languages",()=>{
  const de={...emptyEntry("de","vocabulary"),id:"de",title:"Wissen"},grc={...emptyEntry("grc","vocabulary"),id:"grc",title:"ἐπιστήμη"};
  const comparison:Comparison={id:"c",title:"Knowledge",kind:"vocabulary",languages:["de","grc"],notes:"",links:[de,grc].map(({id,table,kind,language})=>({id,table,kind,language}))};
  assert.equal(validateComparison("vocabulary",comparison.languages,comparison.links),null);
  assert.ok(validateComparison("vocabulary",["de"],[de]));
  assert.ok(validateComparison("text",comparison.languages,comparison.links));
  assert.equal(resolveComparison(comparison,[{...de,title:"Updated Wissen"},grc])[0].title,"Updated Wissen");
  assert.equal(entryKey(de),"vocabulary:de:de");
  assert.equal(JSON.stringify(comparison.links).includes("Wissen"),false);
});
test("metadata edits survive legacy columns and preserve original source text",()=>{
  const word=adaptRow({id:"ja",writing:"知識",reading_kana:"ちしき",example_sentence:"old",metadata:{example_sentence:"edited"},language_metadata:{kanji_form:"知識・知"}},"japanese_vocabulary","ja")!;
  assert.equal(word.metadata.example_sentence,"edited");
  assert.equal(word.languageMetadata.kanji_form,"知識・知");
  assert.equal(word.languageMetadata.reading,"ちしき");
  const sentence=adaptRow({id:"s",language:"Deutsch",target_sentence:"Wissen",source_zh:"知識"},"sentences","de")!;
  assert.equal(sentence.metadata.source_zh,"知識");
});
test("dictionary headwords use stored Greek and Latin forms",()=>{
  const greek={...emptyEntry("grc","vocabulary"),title:"λόγος",languageMetadata:{nominative:"λόγος",genitive:"λόγου",article:"ὁ"}};
  const latin={...emptyEntry("la","vocabulary"),title:"amō",partOfSpeech:"verb",languageMetadata:{principal_parts:"amō, amāre, amāvī, amātum"}};
  assert.equal(vocabularyHeadword(greek),"λόγος, λόγου, ὁ");
  assert.equal(vocabularyHeadword(latin),"amō, amāre, amāvī, amātum");
});
test("language resume paths are scoped and environment PWA entries share configuration",()=>{
  const id="10000000-0000-4000-8000-000000000001";
  for(const language of LANGUAGE_CODES){
    assert.equal(safeContinuePath(language,`/languages/${language}/texts/${id}`),`/languages/${language}/texts/${id}`);
    assert.equal(safeContinuePath(language,`/languages/${language}/search`),`/languages/${language}/search`);
    assert.equal(safeContinuePath(language,`/languages/de/texts/${id}`),language==="de"?`/languages/de/texts/${id}`:null);
    assert.ok(continueStorageKey(language).includes(language));
  }
  for(const path of ["//evil.test","/languages/de/../../record","/languages/de/texts/not-an-id","/languages/de/texts/id?next=/fitness"]){assert.equal(safeContinuePath("de",path),null);}
  for(const id of ENVIRONMENT_KEYS){assert.equal(environments[id].basePath,`/${id}`);assert.equal(pwaEntries[id].startUrl,environments[id].basePath);}
});
test("intended login destinations are preserved and external redirects rejected",()=>{
  for(const url of ["/philosophy","/languages/de/vocabulary?q=test#word","/record/daily-log"])assert.equal(safeDestination(url),url);
  for(const url of ["//evil.test","https://evil.test","/\\evil.test","/login?next=/login","javascript:alert(1)"])assert.equal(safeDestination(url),"/");
  assert.equal(loginUrl("/philosophy"),"/login?next=%2Fphilosophy");
});
test("legacy redirects only infer language from known aliases",()=>{
  assert.equal(legacyLanguageDestination("texts",undefined),"/languages");
  assert.equal(legacyLanguageDestination("texts","de"),"/languages/de/texts");
  assert.equal(legacyLanguageDestination("vocabulary","Ancient Greek"),"/languages/grc/vocabulary");
  assert.equal(legacyLanguageDestination("sentences","el"),"/languages");
});
