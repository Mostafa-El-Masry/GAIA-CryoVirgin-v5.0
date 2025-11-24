"use client";

import { useEffect, useMemo, useState } from "react";

type Company = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  isNew?: boolean;
};

type CompaniesResponse = {
  companies: {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
  }[];
};

type CreateCompanyResponse = {
  company: {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
  };
};

type ImportResult = {
  jobId: number;
  message: string;
} | null;

type ImportError = string | null;

/**
 * Helper to read a File as UTF-8 text.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onabort = () => reject(new Error("File reading aborted"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file);
  });
}

/**
 * Original Call Center + Python UI,
 * now wrapped as a reusable panel that receives the current company.
 * Logic is unchanged except that we also pass companyId to the API body
 * (for future logging).
 */
function CallCenterPythonPanel({
  companyName,
  companyId,
}: {
  companyName: string;
  companyId: number | null;
}) {
  const [summaryFile, setSummaryFile] = useState<File | null>(null);
  const [detailsFile, setDetailsFile] = useState<File | null>(null);
  const [monthLabel, setMonthLabel] = useState<string>("Nov'2025");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGeneratePython() {
    try {
      setError(null);
      if (!summaryFile || !detailsFile) {
        setError("Please select both CSV files first.");
        return;
      }
      if (!companyId) {
        setError("No company selected. Please create or select a company first.");
        return;
      }

      setIsProcessing(true);

      const [summaryText, detailsText] = await Promise.all([
        readFileAsText(summaryFile),
        readFileAsText(detailsFile),
      ]);

      const label = monthLabel.trim() || "MonthYear";

      const res = await fetch("/api/accounts/call-center-python", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summaryCsv: summaryText,
          detailsCsv: detailsText,
          monthLabel: label,
          companyId,
        }),
      });

      if (!res.ok) {
        let message = "Server error while generating reports.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore JSON parse error
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CallCenterReports-${label}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Something went wrong while generating reports.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100/80 p-4 sm:p-6 shadow-lg">
      <header className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Call Center · Mirror Bot (Python)
        </h2>
        <p className="text-xs text-base-content/70">
          Company: <span className="font-medium">{companyName}</span>
        </p>
        <p className="text-xs text-base-content/70">
          Upload the two raw call center CSV exports and let GAIA call the
          Python engine to generate the fully formatted{" "}
          <span className="font-medium">Call Center Report</span> and{" "}
          <span className="font-medium">Call Center Report Details</span> as an
          Excel ZIP.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Summary CSV (per-branch totals)
          </label>
          <p className="text-xs text-base-content/70">
            This is the file that only has one row per Queue (branch), usually
            the first download you get in the morning.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSummaryFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full cursor-pointer text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-content hover:file:bg-primary-focus"
          />
          {summaryFile && (
            <p className="mt-1 text-xs text-success">
              Selected: {summaryFile.name}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">
            Detailed CSV (branch details + calls)
          </label>
          <p className="text-xs text-base-content/70">
            This is the file that contains the same queues on top, followed by
            many rows with individual calls (ID, time, call from, etc.).
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setDetailsFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full cursor-pointer text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-content hover:file:bg-primary-focus"
          />
          {detailsFile && (
            <p className="mt-1 text-xs text-success">
              Selected: {detailsFile.name}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr,auto] sm:items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Month label for file names
          </label>
          <p className="text-xs text-base-content/70">
            Used in the downloaded file names, e.g.{" "}
            <code className="rounded bg-base-200 px-1.5 py-0.5 text-[11px]">
              Call Center Report-Nov&apos;2025.xlsx
            </code>
            .
          </p>
          <input
            type="text"
            value={monthLabel}
            onChange={(e) => setMonthLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/60"
            placeholder="Nov'2025"
          />
        </div>

        <button
          type="button"
          onClick={handleGeneratePython}
          disabled={
            isProcessing || !summaryFile || !detailsFile || !companyId
          }
          className="inline-flex items-center justify-center rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-content shadow-md transition hover:bg-primary-focus disabled:cursor-not-allowed disabled:border-base-300 disabled:bg-base-200 disabled:text-base-content/60"
        >
          {isProcessing ? "Generating with Python…" : "Generate Reports (Python)"}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-error">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-base-300 bg-base-200/70 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/70">
          Notes about the Python engine
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-base-content/80">
          <li>
            This button calls a local Python script{" "}
            <code className="rounded bg-base-100 px-1 py-0.5 text-[11px]">
              scripts/call_center_report.py
            </code>{" "}
            on your machine.
          </li>
          <li>
            Python 3 and{" "}
            <code className="rounded bg-base-100 px-1 py-0.5 text-[11px]">
              openpyxl
            </code>{" "}
            must be installed.
          </li>
          <li>
            The script loads your formatted Excel template from{" "}
            <code className="rounded bg-base-100 px-1 py-0.5 text-[11px]">
              public/templates/CallCenterReportTemplate.xlsx
            </code>{" "}
            so colours, borders, merged cells and charts follow that file.
          </li>
          <li>
            GAIA only passes the raw CSV data, month label, and company id; all
            formatting logic happens in Python using your own template.
          </li>
        </ul>
      </div>
    </section>
  );
}

type ImportTargetKey =
  | "branches"
  | "staff"
  | "customers"
  | "services"
  | "products"
  | "sales"
  | "payments"
  | "payroll";

type ImportTargetConfig = {
  key: ImportTargetKey;
  label: string;
  description: string;
  hint?: string;
  accepted?: string;
};

const IMPORT_TARGETS: ImportTargetConfig[] = [
  {
    key: "branches",
    label: "Branches",
    description: "Initial list of branches / areas for this company.",
    hint: "Small CSV or Excel export with area names and optional codes.",
  },
  {
    key: "staff",
    label: "Staff",
    description: "Employees (reception, call center, therapists, etc.).",
    hint: "Use a simple CSV from your HR sheet with name, role, branch, phone.",
  },
  {
    key: "customers",
    label: "Customers",
    description: "Client base with phone numbers and names.",
    hint: "Phone is usually the unique field per company.",
  },
  {
    key: "services",
    label: "Services",
    description: "Treatments / appointment types with default prices.",
  },
  {
    key: "products",
    label: "Products",
    description: "Retail items with SKUs and default prices.",
  },
  {
    key: "sales",
    label: "Sales (Bills)",
    description: "Daily / monthly sales report to feed the sales table.",
    hint: "Later this will map your Total Sales Report into the sales schema.",
  },
  {
    key: "payments",
    label: "Payments",
    description: "Per-channel payments (KNET, VISA, cash, online...).",
  },
  {
    key: "payroll",
    label: "Payroll",
    description: "Optional bulk import of payroll periods and entries.",
  },
];

function ImportCard({
  companyId,
  target,
}: {
  companyId: number | null;
  target: ImportTargetConfig;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult>(null);
  const [error, setError] = useState<ImportError>(null);

  async function handleUpload() {
    try {
      setError(null);
      setResult(null);
      if (!companyId) {
        setError("Please select a company first.");
        return;
      }
      if (!file) {
        setError("Please choose a file to import.");
        return;
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append("companyId", String(companyId));
      formData.append("file", file);

      const res = await fetch(`/api/accounts/import/${target.key}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Import failed.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const data = (await res.json()) as ImportResult;
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ??
          "Something went wrong while creating the import job. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-base-300 bg-base-100/80 p-3 text-xs sm:text-[13px]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{target.label}</h3>
          <p className="text-[11px] text-base-content/70">
            {target.description}
          </p>
        </div>
        <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-base-content/70">
          Import
        </span>
      </div>

      {target.hint && (
        <p className="mb-2 text-[11px] text-base-content/70">{target.hint}</p>
      )}

      <input
        type="file"
        accept={
          target.accepted ??
          ".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setResult(null);
          setError(null);
        }}
        className="mt-1 block w-full cursor-pointer text-[11px] file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-primary-content hover:file:bg-primary-focus"
      />
      {file && (
        <p className="mt-1 text-[11px] text-base-content/70">
          Selected: <span className="font-medium">{file.name}</span>
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={isUploading || !companyId}
        className="mt-3 inline-flex items-center justify-center rounded-xl border border-primary bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-content shadow-sm transition hover:bg-primary-focus disabled:cursor-not-allowed disabled:border-base-300 disabled:bg-base-200 disabled:text-base-content/60"
      >
        {isUploading ? "Creating import job…" : "Upload & create import job"}
      </button>

      {error && (
        <p className="mt-2 text-[11px] text-error">{error}</p>
      )}

      {result && (
        <p className="mt-2 text-[11px] text-success">
          {result.message} (Job #{result.jobId})
        </p>
      )}

      <p className="mt-2 text-[10px] text-base-content/60">
        For now GAIA only logs this upload in the{" "}
        <code className="rounded bg-base-200 px-1 py-0.5 text-[9px]">
          import_jobs
        </code>{" "}
        table. In later weeks, each loader will parse the file and push real
        rows into the corresponding Accounts tables.
      </p>
    </div>
  );
}

export default function AccountsPage() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingNewCompany, setSavingNewCompany] = useState(false);
  const [newCompanyError, setNewCompanyError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await fetch("/api/accounts/companies", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        if (!res.ok) {
          let message = "Failed to load companies.";
          try {
            const data = (await res.json()) as { error?: string };
            if (data?.error) message = data.error;
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const data = (await res.json()) as CompaniesResponse;
        const mapped: Company[] = data.companies.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          isActive: c.isActive,
        }));

        setCompanies(mapped);
        if (mapped.length > 0) {
          setSelectedCompanyId(mapped[0].id);
        } else {
          setSelectedCompanyId(null);
        }
      } catch (err: any) {
        console.error(err);
        setLoadError(
          err?.message ??
            "Unable to load companies. Check database connection and try again."
        );
        setCompanies([]);
        setSelectedCompanyId(null);
      } finally {
        setLoading(false);
      }
    }

    void loadCompanies();
  }, []);

  const selectedCompany = useMemo(
    () => companies?.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId]
  );

  function handleStartAddCompany() {
    setIsAdding(true);
    setNewCompanyName("");
    setNewCompanyError(null);
  }

  function handleCancelNewCompany() {
    setIsAdding(false);
    setNewCompanyName("");
    setNewCompanyError(null);
  }

  async function handleSaveNewCompany() {
    try {
      setNewCompanyError(null);
      const trimmed = newCompanyName.trim();
      if (!trimmed) {
        setNewCompanyError("Please enter a company name.");
        return;
      }

      setSavingNewCompany(true);

      const res = await fetch("/api/accounts/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        let message = "Failed to create company.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const data = (await res.json()) as CreateCompanyResponse;
      const created: Company = {
        id: data.company.id,
        name: data.company.name,
        slug: data.company.slug,
        isActive: data.company.isActive,
        isNew: true,
      };

      setCompanies((prev) => {
        const base = prev ?? [];
        return [...base, created];
      });
      setSelectedCompanyId(created.id);
      setIsAdding(false);
      setNewCompanyName("");
    } catch (err: any) {
      console.error(err);
      setNewCompanyError(
        err?.message ??
          "Something went wrong while creating the company. Please try again."
      );
    } finally {
      setSavingNewCompany(false);
    }
  }

  return (
    <div className="min-h-screen w-full px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        {/* Left rail: company selector */}
        <aside className="w-full max-w-xs rounded-2xl border border-base-300 bg-base-100/80 p-4 lg:w-72">
          <header className="mb-3 space-y-1">
            <h1 className="text-lg font-semibold tracking-tight">
              Accounts · Companies
            </h1>
            <p className="text-xs text-base-content/70">
              v5.1 · Multi-company wiring · Week 3–4
              <br />
              <span className="text-[11px]">
                Week 3: Mon Feb 15, 2027 → Sun Feb 21, 2027
              </span>
              <br />
              <span className="text-[11px]">
                Week 4: Mon Feb 22, 2027 → Sun Feb 28, 2027
              </span>
            </p>
          </header>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Select company
            </p>

            {loading ? (
              <div className="space-y-1">
                <div className="h-8 w-full animate-pulse rounded-xl bg-base-200" />
                <div className="h-8 w-full animate-pulse rounded-xl bg-base-200" />
              </div>
            ) : loadError ? (
              <div className="rounded-xl border border-error bg-error/10 px-3 py-2 text-xs text-error">
                {loadError}
              </div>
            ) : companies && companies.length > 0 ? (
              <div className="space-y-1">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(company.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                      company.id === selectedCompanyId
                        ? "bg-primary text-primary-content"
                        : "bg-base-200 text-base-content hover:bg-base-300"
                    }`}
                  >
                    <span>{company.name}</span>
                    {company.isNew && (
                      <span className="rounded-full bg-base-100/30 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                        New
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/70">
                No companies yet. Create your first company to start wiring
                Accounts.
              </p>
            )}

            {!isAdding ? (
              <button
                type="button"
                onClick={handleStartAddCompany}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-100 px-3 py-2 text-xs font-medium text-base-content/80 hover:bg-base-200"
              >
                + Add new company
              </button>
            ) : (
              <div className="mt-3 space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
                <p className="text-xs font-semibold text-base-content/80">
                  New company
                </p>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Company name"
                  className="w-full rounded-lg border border-base-300 bg-base-100 px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                />
                {newCompanyError && (
                  <p className="text-[11px] text-error">{newCompanyError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveNewCompany}
                    disabled={savingNewCompany}
                    className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-xs font-medium text-primary-content hover:bg-primary-focus disabled:cursor-not-allowed disabled:bg-base-300"
                  >
                    {savingNewCompany ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelNewCompany}
                    className="flex-1 rounded-lg bg-base-200 px-2 py-1.5 text-xs font-medium text-base-content/80 hover:bg-base-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-base-300 bg-base-100/80 p-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-base-content/70">
              Wiring checklist (per new company)
            </h2>
            <ul className="mt-2 list-decimal space-y-1 pl-5 text-xs text-base-content/80">
              <li>
                GAIA creates a row in the{" "}
                <code className="rounded bg-base-200 px-1 py-0.5 text-[10px]">
                  companies
                </code>{" "}
                table (Supabase/Postgres) whenever you add a company.
              </li>
              <li>
                All Accounts tables (sales, staff, branches, etc.) include a{" "}
                <code className="rounded bg-base-200 px-1 py-0.5 text-[10px]">
                  company_id
                </code>{" "}
                column (already in the core schema).
              </li>
              <li>
                The new Import section logs every upload into{" "}
                <code className="rounded bg-base-200 px-1 py-0.5 text-[10px]">
                  import_jobs
                </code>{" "}
                with company + target.
              </li>
              <li>
                In future weeks, each import job will be processed into the real
                Accounts tables.
              </li>
            </ul>
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-base-300 bg-base-200 px-2 py-1.5 text-xs font-medium text-base-content/80 hover:bg-base-300"
            >
              Run wiring check (placeholder)
            </button>
            <p className="mt-1 text-[11px] text-base-content/60">
              For now this is UI only. Use it as a reminder of the steps needed
              for each new company.
            </p>
          </div>
        </aside>

        {/* Main content: modules for selected company */}
        <main className="flex-1 space-y-5">
          <header className="rounded-2xl border border-base-300 bg-base-100/80 p-4 sm:p-5">
            <h2 className="text-base font-semibold">
              {selectedCompany ? selectedCompany.name : "No company selected"} ·
              Modules
            </h2>
            <p className="mt-1 text-xs text-base-content/70">
              Every company uses the same Accounts logic: Call Center, Imports,
              BRS, Sales, Commissions, and more. For now, Call Center (Python)
              and Data Loaders are available; other modules are placeholders.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                Call Center · Active
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                Data Loaders · Active
              </span>
              <span className="rounded-full bg-base-200 px-2 py-0.5 text-base-content/70">
                BRS · Coming soon
              </span>
              <span className="rounded-full bg-base-200 px-2 py-0.5 text-base-content/70">
                Sales / Assets · Coming soon
              </span>
              <span className="rounded-full bg-base-200 px-2 py-0.5 text-base-content/70">
                Commissions · Coming soon
              </span>
            </div>
          </header>

          {selectedCompany ? (
            <>
              <CallCenterPythonPanel
                companyName={selectedCompany.name}
                companyId={selectedCompany.id}
              />

              <section className="rounded-2xl border border-base-300 bg-base-100/80 p-4 sm:p-6">
                <header className="mb-4 space-y-1">
                  <h2 className="text-base font-semibold tracking-tight">
                    Data loaders · Imports
                  </h2>
                  <p className="text-xs text-base-content/70">
                    Load your existing Excel / CSV reports once, and GAIA will
                    remember them for this company in the online database. Each
                    tile below creates an{" "}
                    <code className="rounded bg-base-200 px-1 py-0.5 text-[10px]">
                      import_jobs
                    </code>{" "}
                    entry for the selected company.
                  </p>
                  <p className="text-[11px] text-base-content/60">
                    Today: logging only. Later weeks: each loader will parse the
                    file and push real rows into{" "}
                    <span className="font-medium">
                      branches, staff, customers, services, products, sales,
                      payments
                    </span>{" "}
                    and payroll.
                  </p>
                </header>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {IMPORT_TARGETS.map((cfg) => (
                    <ImportCard
                      key={cfg.key}
                      companyId={selectedCompany.id}
                      target={cfg}
                    />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-dashed border-base-300 bg-base-100/60 p-4 text-sm text-base-content/80">
              <p>
                No company selected. Create a company in the left panel to start
                using Accounts modules like Call Center and Data Loaders.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
