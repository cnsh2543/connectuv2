importScripts("//cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.core.min.js"),self.addEventListener("message",(function(e){var s=XLSX.read(e.data,{raw:!0}),a=s.Sheets[s.SheetNames[0]],t=XLSX.utils.sheet_to_json(a,{dateNF:"YYYY-MM-DD"});self.postMessage(t)}));
//# sourceMappingURL=823.3c93593e.chunk.js.map