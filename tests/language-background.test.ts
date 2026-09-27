import assert from "node:assert/strict";
import test from "node:test";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {LanguageBackground} from "../src/components/languages/language-background";
import {LANGUAGE_CODES,DEFAULT_LANGUAGE_BACKGROUND_OPACITY,languages} from "../src/lib/languages/config";
import {visualAsset} from "../src/lib/pwa";

test("six single-language configurations keep cover and background paths separate",()=>{
  assert.equal(DEFAULT_LANGUAGE_BACKGROUND_OPACITY,0.14);
  for(const code of LANGUAGE_CODES){
    assert.equal(languages[code].visual,`/visuals/languages/${code}/cover.webp`);
    assert.equal(languages[code].background.src,`/visuals/languages/${code}/background.webp`);
    assert.equal(languages[code].background.repeat,"no-repeat");
  }
});

test("missing artwork renders a neutral shell without an image request",()=>{
  assert.equal(visualAsset("/visuals/languages/en/__missing-background__.webp"),null);
  const html=renderToStaticMarkup(createElement(LanguageBackground,{background:languages.en.background,source:null},createElement("p",null,"Readable content")));
  assert.match(html,/Readable content/);
  assert.doesNotMatch(html,/<img|background-image/);
  assert.match(html,/language-environment-content/);
});

test("available artwork is a single decorative image behind content",()=>{
  const html=renderToStaticMarkup(createElement(LanguageBackground,{background:languages.la.background,source:"/visuals/languages/la/background.webp"},createElement("button",null,"Open")));
  assert.equal((html.match(/<img/g)??[]).length,1);
  assert.match(html,/alt=""/);
  assert.match(html,/aria-hidden="true"/);
  assert.match(html,/opacity:0\.14/);
  assert.match(html,/Open/);
  assert.doesNotMatch(html,/position:fixed/);
});
