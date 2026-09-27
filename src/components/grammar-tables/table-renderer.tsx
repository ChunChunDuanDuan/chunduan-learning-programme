import type {GrammarTableSection} from "@/lib/grammar-tables/types";

export function TableRenderer({section}:{section:GrammarTableSection}){
  const grouped=section.columns.some(column=>column.group);
  const groups:{label:string;span:number}[]=[];
  if(grouped)for(const column of section.columns){
    const label=column.group??"";
    if(groups.at(-1)?.label===label)groups[groups.length-1].span++;
    else groups.push({label,span:1});
  }
  return <section id={section.id} aria-labelledby={`${section.id}-title`} className="min-w-0 space-y-3">
    <h2 id={`${section.id}-title`} className="text-xl font-semibold">{section.title}</h2>
    {section.description?<p className="text-sm text-neutral-600">{section.description}</p>:null}
    <div className="language-surface max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-neutral-200" role="region" aria-label={`${section.title} table`} tabIndex={0}>
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead className="bg-neutral-100">
          {grouped?<tr><th rowSpan={2} scope="col" className="sticky left-0 z-10 border-b border-r border-neutral-200 bg-neutral-100 px-3 py-2">{section.tableType==="case-preposition"?"Preposition":"Form / case"}</th>{groups.map((group,index)=><th key={`${group.label}-${index}`} scope="colgroup" colSpan={group.span} className="border-b border-neutral-200 px-3 py-2 text-center font-semibold">{group.label}</th>)}</tr>:null}
          <tr>{!grouped?<th scope="col" className="sticky left-0 z-10 border-b border-r border-neutral-200 bg-neutral-100 px-3 py-2">{section.tableType==="case-preposition"?"Preposition":"Form / case"}</th>:null}{section.columns.map((column,index)=><th key={`${column.label}-${index}`} scope="col" className="border-b border-neutral-200 px-3 py-2 font-semibold">{column.label}</th>)}</tr>
        </thead>
        <tbody>{section.rows.map((row,index)=><tr key={`${row.label}-${index}`} className="border-b border-neutral-100 last:border-0"><th scope="row" className="sticky left-0 border-r border-neutral-200 bg-white px-3 py-2 font-medium">{row.label}</th>{row.cells.map((cell,cellIndex)=><td key={cellIndex} colSpan={typeof cell==="string"?undefined:cell.colSpan} className="px-3 py-2 align-top">{typeof cell==="string"?cell:cell.text}</td>)}</tr>)}</tbody>
      </table>
    </div>
    {section.notes?.length?<ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600">{section.notes.map(note=><li key={note}>{note}</li>)}</ul>:null}
  </section>;
}
