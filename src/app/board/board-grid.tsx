"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { hhmm, pactCode } from "@/lib/ui";
import { StatusPill } from "@/components/status-pill";
import type { Pact, Status } from "@/lib/types";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withParams({
  backgroundColor: "rgba(255,255,255,0.0)",
  foregroundColor: "var(--color-ink)",
  headerBackgroundColor: "color-mix(in srgb, var(--color-canvas) 60%, transparent)",
  headerTextColor: "var(--color-ink-2)",
  headerFontWeight: 600,
  oddRowBackgroundColor: "rgba(255,255,255,0.0)",
  rowHoverColor: "rgba(11,99,246,0.06)",
  selectedRowBackgroundColor: "var(--color-mist)",
  borderColor: "var(--color-line)",
  accentColor: "var(--color-blue)",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  spacing: 8,
  wrapperBorder: false,
  wrapperBorderRadius: 20,
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
  return <StatusPill status={p.value!} />;
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
      { field: "time", headerName: "Time", width: 150 },
      { field: "code", headerName: "Pact", width: 110, cellClass: "t-num" },
      { field: "task", headerName: "For", flex: 2, minWidth: 220 },
      { field: "payee", headerName: "Payee", flex: 1, minWidth: 140 },
      { field: "amount", headerName: "Amount", width: 120, type: "rightAligned", cellClass: "t-num", valueFormatter: (p) => (p.value == null ? "—" : `$${p.value.toFixed(2)}`) },
      { field: "status", headerName: "Status", width: 150, cellRenderer: StatusCell, filter: true },
      { field: "promises", headerName: "Promises met", width: 140 },
      { field: "auth", headerName: "PayPal authorization", width: 200, cellClass: "t-num" },
      { field: "capture", headerName: "PayPal capture", width: 200, cellClass: "t-num" },
    ],
    [],
  );

  if (failed) return <p role="alert" className="t-small rounded-xl bg-stop-soft px-4 py-3 text-stop">The board could not load. Refresh to try again.</p>;

  return (
    <div className="card overflow-hidden">
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
