import { NextRequest, NextResponse } from "next/server";
import { logImportJob } from "../../../../../lib/accountsDb";

export const runtime = "nodejs";

const ALLOWED_TARGETS = [
  "branches",
  "staff",
  "customers",
  "services",
  "products",
  "sales",
  "payments",
  "payroll",
];

type RouteParams = {
  params: {
    target: string;
  };
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const target = params.target;

    if (!ALLOWED_TARGETS.includes(target)) {
      return NextResponse.json(
        {
          error: `Unsupported import target '${target}'.`,
        },
        { status: 400 }
      );
    }

    const form = await req.formData();

    const companyIdRaw = form.get("companyId");
    const file = form.get("file");

    if (!companyIdRaw) {
      return NextResponse.json(
        { error: "Missing companyId in form data." },
        { status: 400 }
      );
    }

    const companyId = Number(companyIdRaw);
    if (!Number.isFinite(companyId) || companyId <= 0) {
      return NextResponse.json(
        { error: "Invalid companyId." },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file in form data." },
        { status: 400 }
      );
    }

    const originalFilename = file.name || "unknown";

    // For now we are not parsing the file. We just log that this import was requested.
    const job = await logImportJob({
      companyId,
      target,
      originalFilename,
    });

    return NextResponse.json(
      {
        jobId: job.id,
        message: `Import job created for '${target}' with file '${originalFilename}'.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Accounts import POST error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to create import job. Check database connection.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
