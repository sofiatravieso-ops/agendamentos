import { NextResponse } from "next/server";
import { getServiceClient } from "../../../../lib/supabase";
import { checkAdminAuth } from "../../../../lib/adminAuth";

export async function GET(request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: participants, error: pErr } = await supabase
    .from("participants")
    .select("id, name, whatsapp, created_at")
    .order("created_at", { ascending: false });

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  const { data: bookings, error: bErr } = await supabase
    .from("bookings")
    .select("id, participant_id, test_id, slot:slots(id, date, time)");

  if (bErr) {
    return NextResponse.json({ error: bErr.message }, { status: 500 });
  }

  const result = participants.map((p) => ({
    ...p,
    bookings: bookings.filter((b) => b.participant_id === p.id),
  }));

  return NextResponse.json({ participants: result });
}
