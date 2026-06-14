import { NextResponse } from "next/server";
import { createSupabaseServiceClient, createSupabaseUserClient } from "../../../../../lib/supabase/server";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: "Missing user session." }, { status: 401 });
    }

    const userClient = createSupabaseUserClient(token);
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError) throw userError;
    if (!user) {
      return NextResponse.json({ error: "User is not logged in." }, { status: 401 });
    }

    const { id } = await params;
    const serviceClient = createSupabaseServiceClient();
    const { error } = await serviceClient
      .from("texts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}