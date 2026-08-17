const s=e=>{const t=e==null?"":String(e);return/[",\n]/.test(t)?`"${t.replace(/"/g,'""')}"`:t};function u(e,t,d){const r=t.map(n=>s(n.header)).join(","),l=d.map(n=>t.map(p=>s(p.value(n))).join(",")).join(`
`),a=`${r}
${l}`,i=new Blob([`\uFEFF${a}`],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(i),o=document.createElement("a");o.href=c,o.download=e.endsWith(".csv")?e:`${e}.csv`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(c)}export{u as e};
