/** Format an ISO date into a readable Thai date, e.g. "18 มิ.ย. 2569". */
export function formatThaiDate(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
