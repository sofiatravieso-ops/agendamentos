import { NextResponse } from "next/server";
import { getServiceClient } from "../../../lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get("participant_id");

  if (!participantId) {
    return NextResponse.json({ error: "participant_id é obrigatório" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: participant, error: pErr } = await supabase
    .from("participants")
    .select("id, name, whatsapp")
    .eq("id", participantId)
    .single();

  if (pErr) {
    return NextResponse.json({ error: "Participante não encontrado." }, { status: 404 });
  }

  const { data: bookings, error: bErr } = await supabase
    .from("bookings")
    .select("id, test_id, slot:slots(id, date, time)")
    .eq("participant_id", participantId);

  if (bErr) {
    return NextResponse.json({ error: bErr.message }, { status: 500 });
  }

  return NextResponse.json({ participant, bookings });
}
