import {matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

export const latinSum:GrammarTableDefinition={
  id:"sum",language:"la",category:"Irregular Forms",title:"sum, esse, fuī",subtitle:"Present, imperfect, future",
  description:"The basic indicative of the irregular Latin verb ‘to be’.",
  tags:["verb","irregular","sum","present","imperfect","future"],relatedGrammarTopics:["sum","esse","irregular verbs"],
  sections:[matrix("indicative","Indicative forms",["Present","Imperfect","Future"],[
    ["1st singular","sum","eram","erō"],["2nd singular","es","erās","eris"],["3rd singular","est","erat","erit"],
    ["1st plural","sumus","erāmus","erimus"],["2nd plural","estis","erātis","eritis"],["3rd plural","sunt","erant","erunt"],
  ])],
  source:{label:"Dickinson College Commentaries, Allen and Greenough: sum",url:"https://dcc.dickinson.edu/grammar/latin/sum"},
};
