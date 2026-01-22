import { NextResponse } from 'next/server';
import type { PermissionSet } from '@/config/permissions';
import {
  PERMISSION_STORAGE_KEY,
  ensurePermissionShape,
  getCreatorAdminEmail,
} from '@/config/permissions';
import { normaliseEmail } from '@/lib/strings';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { GaiaUser, GaiaUserPermissions, GaiaUserRole } from '@/lib/users/types';

const CREATOR_ADMIN_EMAIL = getCreatorAdminEmail();



function mapPermissionSetToGaia(perms: PermissionSet | null): GaiaUserPermissions {
  const safe = ensurePermissionShape(perms ?? null);
  return {
    canViewGalleryPrivate: Boolean((safe as any).gallery),
    canViewWealth: Boolean((safe as any).wealth),
    canViewHealth: Boolean((safe as any).health),
    canViewGuardian: Boolean((safe as any).guardian),
  };
}

async function loadSupabaseUsers(): Promise<GaiaUser[]> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return [];

  const permissionMap = new Map<string, PermissionSet>();
  const { data: permissionRows, error: permError } = await adminClient
    .from('user_storage')
    .select('user_id,value')
    .eq('key', PERMISSION_STORAGE_KEY);

  if (permError) {
    throw permError;
  }

  for (const row of permissionRows ?? []) {
    if (!row?.user_id) continue;
    let parsed = ensurePermissionShape(null);
    if (typeof row.value === 'string') {
      try {
        parsed = ensurePermissionShape(JSON.parse(row.value));
      } catch {
        parsed = ensurePermissionShape(null);
      }
    }
    permissionMap.set(row.user_id, parsed);
  }

  const users: GaiaUser[] = [];
  const perPage = 100;
  let page = 1;
  let keepGoing = true;

  while (keepGoing) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const batch = data?.users ?? [];
    for (const user of batch) {
      const email = user.email ?? null;
      const permissions = permissionMap.get(user.id) ?? ensurePermissionShape(null);
      const displayName =
        (user.user_metadata?.full_name as string | undefined)?.trim() ||
        (user.user_metadata?.name as string | undefined)?.trim() ||
        (email ? email.split('@')[0] : 'User');
      const normalisedEmail = normaliseEmail(email);
      const role: GaiaUserRole =
        normalisedEmail && normalisedEmail === CREATOR_ADMIN_EMAIL ? 'owner' : 'member';

      users.push({
        id: user.id,
        displayName,
        email,
        role,
        permissions: mapPermissionSetToGaia(permissions),
        createdAt: user.created_at ?? new Date().toISOString(),
      });
    }

    keepGoing = batch.length === perPage;
    page += 1;
  }

  return users;
}

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

async function isOwner() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;
  const user = session.user;
  return user?.user_metadata?.role === 'owner';
}

// GET /api/users
//   → list all GAIA internal users (for Settings > Users)
export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const supabaseUsers = await loadSupabaseUsers();
    return NextResponse.json({ ok: true, users: supabaseUsers });
  } catch (error) {
    console.error('[Users] GET error', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load users.' },
      { status: 500 }
    );
  }
}



// PUT /api/users
//   Body: { id, displayName?, email?, role?, permissions? }
export async function PUT(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? '').trim();
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required.' },
        { status: 400 }
      );
    }

    const patch: any = {};
    if (body.displayName !== undefined) {
      patch.full_name = String(body.displayName ?? '').trim();
    }
    if (body.role !== undefined) {
      patch.role = String(body.role);
    }
    if (body.permissions !== undefined) {
      patch.permissions = body.permissions;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Nothing to update.' },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create admin client.' },
        { status: 500 }
      );
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(id, {
      user_metadata: patch,
    });

    if (error) {
      console.error('[Users] PUT error', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to update user.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, user: data.user });
  } catch (err: any) {
    console.error('[Users] PUT unexpected error', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

// DELETE /api/users
//   Body: { id }
export async function DELETE(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? '').trim();
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required.' },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create admin client.' },
        { status: 500 }
      );
    }

    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) {
      console.error('[Users] DELETE error', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to delete user.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Users] DELETE unexpected error', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
