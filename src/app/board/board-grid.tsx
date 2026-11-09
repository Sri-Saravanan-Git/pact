"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { STATUS, hhmm, pactCode } from "@/lib/ui";
import type { Pact, Status } from "@/lib/types";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withParams({
  backgroundColor: "#121314",
  foregroundColor: "#f4f1e8",
  headerBackgroundColor: "#121314",
  headerTextColor: "#ffc72c",
  headerFontWeight: 700,
  oddRowBackgroundColor: "#17181a",
  rowHoverColor: "#232427",
  selectedRowBackgroundColor: "#2a2b2e",
  borderColor: "rgba(244,241,232,0.12)",
  accentColor: "#ffc72c",
  fontFamily: "var(--font-flap)",
  fontSize: 14,
  spacing: 7,
  wrapperBorder: false,
  wrapperBorderRadius: 0,
  columnBorder: false,
});

type Row = {
  id: string;
  time: string;
  code: string;
  task: string;
  payee: string;
  amount: number | null;
  status: Status;
  promises: string;
  auth: string;
  capture: string;
};

function StatusCell(p: ICellRendererParams<Row, Status>) {
  const s = STATUS[p.value!];
  return (
    <span className="font-bold tracking-[0.12em]" style={{ color: s.color }}>
      {s.flap}
    </span>
  );
}

export function BoardGrid() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/pacts")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((ps: Pact[]) =>
        setRows(
          ps.map((p) => {
            const last = p.submissions.at(-1);
            return {
              id: p.id,
              time: `${new Date(p.createdAt).toLocaleDateString([], { day: "2-digit", month: "short" })} ${hhmm(p.createdAt)}`,
              code: pactCode(p.id),
              task: p.mandate?.task ?? p.request,
              payee: p.offer?.seller ?? "—",
              amount: p.offer?.price ?? p.mandate?.budget ?? null,
              status: p.status,
              promises: last ? `${last.results.filter((r) => r.pass).length}/${last.results.length}` : p.criteria ? `0/${p.criteria.length}` : "—",
              auth: p.paypal.authorizationId ?? "—",
              capture: p.paypal.captureId ?? "—",
            };
          }),
        ),
      )
      .catch(() => setFailed(true));
  }, []);

  const cols = useMemo<ColDef<Row>[]>(
    () => [
      { field: "time", headerName: "TIME", width: 150 },
      { field: "code", headerName: "PACT", width: 110 },
      { field: "task", headerName: "FOR", flex: 2, minWidth: 220 },
      { field: "payee", headerName: "PAYEE", flex: 1, minWidth: 140 },
      { field: "amount", headerName: "AMOUNT", width: 120, type: "rightAligned", valueFormatter: (p) => (p.value == null ? "—" : `$${p.value.toFixed(2)}`) },
      { field: "status", headerName: "STATUS", width: 130, cellRenderer: StatusCell, filter: true },
      { field: "promises", headerName: "PROMISES MET", width: 140 },
      { field: "auth", headerName: "PAYPAL AUTH", width: 190 },
      { field: "capture", headerName: "PAYPAL CAPTURE", width: 190 },
    ],
    [],
  );

  if (failed) return <p role="alert">The board could not load. Refresh to try again.</p>;

  return (
    <div>
      <AgGridReact<Row>
        theme={theme}
        domLayout="autoHeight"
        rowData={rows}
        columnDefs={cols}
        defaultColDef={{ sortable: true, resizable: true }}
        loading={rows === null}
        overlayNoRowsTemplate="No pacts yet. Start one to see it depart."
        onRowClicked={(e) => e.data && router.push(`/pact/${e.data.id}`)}
        rowClass="cursor-pointer"
      />
    </div>
  );
}
