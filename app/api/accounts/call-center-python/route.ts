import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import fs from "fs/promises";
import JSZip from "jszip";

export const runtime = "nodejs";

async function runPythonReport(
  summaryPath: string,
  detailsPath: string,
  templatePath: string,
  outSummaryPath: string,
  outDetailsPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const projectRoot = process.cwd();
    const scriptPath = path.join(projectRoot, "scripts", "call_center_report.py");

    const pythonExe = process.env.PYTHON_PATH || "python";

    const args = [
      scriptPath,
      summaryPath,
      detailsPath,
      templatePath,
      outSummaryPath,
      outDetailsPath,
    ];

    const child = spawn(pythonExe, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python exited with code ${code}.
${stderr}`));
      }
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const summaryCsv = String(body.summaryCsv ?? "");
    const detailsCsv = String(body.detailsCsv ?? "");
    const monthLabelRaw = String(body.monthLabel ?? "MonthYear");

    if (!summaryCsv || !detailsCsv) {
      return NextResponse.json(
        { error: "Both summaryCsv and detailsCsv are required." },
        { status: 400 }
      );
    }

    const monthLabel = monthLabelRaw.trim() || "MonthYear";
    const safeLabel = monthLabel.replace(/[^0-9A-Za-z_'\-]/g, "_");

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "callcenter-"));

    const summaryPath = path.join(tmpDir, "summary.csv");
    const detailsPath = path.join(tmpDir, "details.csv");

    await fs.writeFile(summaryPath, summaryCsv, "utf8");
    await fs.writeFile(detailsPath, detailsCsv, "utf8");

    const projectRoot = process.cwd();
    const templatePath = path.join(
      projectRoot,
      "public",
      "templates",
      "CallCenterReportTemplate.xlsx"
    );

    const outSummaryPath = path.join(
      tmpDir,
      `Call Center Report-${safeLabel}.xlsx`
    );
    const outDetailsPath = path.join(
      tmpDir,
      `Call Center Report-Details-${safeLabel}.xlsx`
    );

    await runPythonReport(
      summaryPath,
      detailsPath,
      templatePath,
      outSummaryPath,
      outDetailsPath
    );

    const [summaryBuf, detailsBuf] = await Promise.all([
      fs.readFile(outSummaryPath),
      fs.readFile(outDetailsPath),
    ]);

    // JSZip typings don't accept Node Buffer directly; convert to ArrayBuffer.
    const toUint8 = (buf: Buffer) => new Uint8Array(buf);

    const zip = new JSZip();
    zip.file(
      `Call Center Report-${safeLabel}.xlsx`,
      toUint8(summaryBuf),
      { binary: true }
    );
    zip.file(
      `Call Center Report-Details-${safeLabel}.xlsx`,
      toUint8(detailsBuf),
      { binary: true }
    );

    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipContent, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="CallCenterReports-${safeLabel}.zip"`,
      },
    });
  } catch (err: any) {
    console.error("Python report error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ??
          "Failed to generate reports via Python. Check that Python and openpyxl are installed.",
      },
      { status: 500 }
    );
  }
}
