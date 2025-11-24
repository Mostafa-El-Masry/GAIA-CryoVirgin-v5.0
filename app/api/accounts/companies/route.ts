import { NextRequest, NextResponse } from "next/server";
import { createCompany, getCompanies } from "../../../../lib/accountsDb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const companies = await getCompanies();

    return NextResponse.json({
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        isActive: c.is_active,
        createdAt: c.created_at,
      })),
    });
  } catch (err: any) {
    console.error("Accounts companies GET error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to load companies. Check database connection.";
    return NextResponse.json(
      { error: message },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Invalid body. Expected JSON with a 'name' field." },
        { status: 400 }
      );
    }

    const trimmed = body.name.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Company name cannot be empty." },
        { status: 400 }
      );
    }

    const company = await createCompany(trimmed);

    return NextResponse.json(
      {
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          isActive: company.is_active,
          createdAt: company.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Accounts companies POST error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to create company. Check database connection.";
    return NextResponse.json(
      { error: message },
      {
        status: 500,
      }
    );
  }
}
