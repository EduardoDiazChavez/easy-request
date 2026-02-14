declare module "xlsx" {
  interface WorkSheet {
    "!cols"?: { wch: number }[];
  }
  interface Workbook {
    SheetNames: string[];
    Sheets: Record<string, WorkSheet>;
  }
  const utils: {
    aoa_to_sheet: (data: unknown[][]) => WorkSheet;
    book_new: () => Workbook;
    book_append_sheet: (wb: Workbook, ws: WorkSheet, name: string) => void;
  };
  function writeFile(wb: Workbook, filename: string): void;
}
