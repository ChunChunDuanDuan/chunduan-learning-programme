import assert from "node:assert/strict";
import test from "node:test";
import {languages} from "../src/lib/languages/config";
import {safeContinuePath} from "../src/lib/languages/continue";
import {emptyEntry} from "../src/lib/languages/model";
import {favoritesStorageKey,parseFavorites} from "../src/lib/grammar-tables/favorites";
import {grammarTables,tableById,tablesForLanguage} from "../src/lib/grammar-tables/registry";
import {relatedGrammarNotes,relatedVocabulary,searchGrammarTables} from "../src/lib/grammar-tables/relations";

test("Grammar Tables are unique, scoped, and reachable only in Ancient Greek and Latin",()=>{
  assert.equal(tablesForLanguage("grc").length,8);
  assert.equal(tablesForLanguage("la").length,14);
  assert.equal(new Set(grammarTables.map(table=>`${table.language}/${table.id}`)).size,grammarTables.length);
  for(const table of grammarTables)assert.equal(tableById(table.language,table.id),table);
  for(const language of ["en","de","ru","ja"] as const)assert.ok(!languages[language].modules.includes("grammar-tables"));
  for(const language of ["grc","la"] as const)assert.ok(languages[language].modules.includes("grammar-tables"));
  assert.equal(safeContinuePath("grc","/languages/grc/grammar-tables/second-declension"),"/languages/grc/grammar-tables/second-declension");
  assert.equal(safeContinuePath("de","/languages/de/grammar-tables/second-declension"),null);
});

test("Every reference section has explicit rectangular data and supported cells",()=>{
  for(const table of grammarTables){
    assert.ok(table.sections.length>0,table.id);
    assert.ok(table.source?.url.startsWith("https://"),table.id);
    assert.equal(new Set(table.sections.map(section=>section.id)).size,table.sections.length,table.id);
    for(const section of table.sections){
      assert.ok(section.columns.length>0,`${table.id}/${section.id}`);
      assert.ok(section.rows.length>0,`${table.id}/${section.id}`);
      for(const row of section.rows){
        const width=row.cells.reduce<number>((sum,cell)=>sum+(typeof cell==="string"?1:cell.colSpan),0);
        assert.equal(width,section.columns.length,`${table.language}/${table.id}/${section.id}/${row.label}`);
      }
    }
  }
});

test("Greek core tables retain the requested paradigms and Reading Greek subtype labels",()=>{
  const article=tableById("grc","article")!;
  assert.deepEqual(article.sections[0].rows.map(row=>row.label),["Nominative","Genitive","Dative","Accusative"]);
  assert.deepEqual(article.sections[0].rows[0].cells,["ὁ","ἡ","τό","οἱ","αἱ","τά"]);
  assert.deepEqual(tableById("grc","first-declension")!.sections.map(section=>section.id),["1a","1b","1c","1d","1d-as"]);
  assert.deepEqual(tableById("grc","second-declension")!.sections.map(section=>section.id),["2a","2b"]);
  assert.ok(tableById("grc","third-declension")!.sections.length>=4);
  assert.equal(tableById("grc","eimi")!.sections[0].rows.length,6);
  assert.equal(tableById("grc","luo")!.sections.length,3);
  assert.ok(tableById("grc","prepositions")!.sections[0].rows.length>10);
});

test("Latin declensions, adjective patterns, conjugations, sum and prepositions have full core coverage",()=>{
  for(const id of ["first","second","third","fourth","fifth"]){
    const table=tableById("la",`${id}-declension`)!;
    assert.ok(table);
    for(const section of table.sections)assert.deepEqual(section.rows.map(row=>row.label),["Nominative","Genitive","Dative","Accusative","Ablative","Vocative"]);
  }
  assert.equal(tableById("la","adjectives")!.sections.length,4);
  for(const id of ["first","second","third","third-io","fourth"]){
    assert.equal(tableById("la",`${id}-conjugation`)!.sections[0].rows.length,6);
  }
  assert.deepEqual(tableById("la","sum")!.sections[0].columns.map(column=>column.label),["Present","Imperfect","Future"]);
  assert.equal(tableById("la","sum")!.sections[0].rows.length,6);
  assert.ok(tableById("la","irregular-verbs")!.sections[0].rows.length>=6);
  assert.equal(tableById("la","prepositions")!.sections.length,3);
});

test("Table search uses metadata of the table and never crosses languages or searches form cells",()=>{
  assert.deepEqual(searchGrammarTables(grammarTables,"grc","article","All").map(table=>table.id),["article"]);
  assert.deepEqual(searchGrammarTables(grammarTables,"la","article","All"),[]);
  assert.deepEqual(searchGrammarTables(grammarTables,"la","puellam","All"),[]);
  assert.ok(searchGrammarTables(grammarTables,"la","declension","Nominals").length>=5);
});

test("Related vocabulary needs same-language structured metadata and deduplicates sections",()=>{
  const greek={...emptyEntry("grc","vocabulary"),id:"greek-2a",title:"ἄνθρωπος",partOfSpeech:"noun",languageMetadata:{declensionClass:"2a"}};
  const latin={...emptyEntry("la","vocabulary"),id:"latin-1",title:"puella",partOfSpeech:"noun",languageMetadata:{declension:"1"}};
  const wrongLanguage={...latin,language:"grc" as const,id:"wrong-language"};
  const wrongType={...greek,id:"wrong-type",partOfSpeech:"verb"};
  const wordEnding={...emptyEntry("grc","vocabulary"),id:"word-ending",title:"λόγος",partOfSpeech:"noun"};
  assert.deepEqual(relatedVocabulary(tableById("grc","second-declension")!,[greek,latin,wrongType,wordEnding]).map(item=>item.entry.id),["greek-2a"]);
  assert.deepEqual(relatedVocabulary(tableById("la","first-declension")!,[greek,latin,wrongLanguage]).map(item=>item.entry.id),["latin-1"]);
  const second={...latin,id:"latin-2",languageMetadata:{declension:"2"}};
  assert.deepEqual(relatedVocabulary(tableById("la","second-declension")!,[second]).map(item=>item.entry.id),["latin-2"]);
  const verb={...emptyEntry("la","vocabulary"),id:"latin-verb",partOfSpeech:"verb",languageMetadata:{conjugation:"3rd-io"}};
  assert.deepEqual(relatedVocabulary(tableById("la","third-io-conjugation")!,[verb]).map(item=>item.entry.id),["latin-verb"]);
});

test("Related grammar notes are same-language references, and favorites are user and language scoped",()=>{
  const greek={...emptyEntry("grc","grammar"),id:"g",title:"Second Declension",topic:"nouns"};
  const latin={...greek,id:"l",language:"la" as const};
  assert.deepEqual(relatedGrammarNotes(tableById("grc","second-declension")!,[greek,latin]).map(entry=>entry.id),["g"]);
  assert.deepEqual(relatedGrammarNotes(tableById("grc","second-declension")!,[{...greek,id:"g2",title:"Greek Second Declension notes"}]).map(entry=>entry.id),["g2"]);
  assert.notEqual(favoritesStorageKey("one","grc"),favoritesStorageKey("two","grc"));
  assert.notEqual(favoritesStorageKey("one","grc"),favoritesStorageKey("one","la"));
  assert.deepEqual(parseFavorites('["article","article","unknown"]',["article"]),["article"]);
  assert.deepEqual(parseFavorites("invalid",["article"]),[]);
});
