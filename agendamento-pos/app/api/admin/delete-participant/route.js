import { NextResponse } from "next/server";
import { getServiceClient } from "../../../../lib/supabase";
import { checkAdminAuth } from "../../../../lib/adminAuth";

export async function POST(request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const { participant_id } = await request.json();
  if (!participant_id) {
    return NextResponse.json({ error: "participant_id é obrigatório" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, slot_id")
    .eq("participant_id", participant_id);

  for (const b of bookings || []) {
    await supabase.rpc("release_slot", { p_slot_id: b.slot_id });
  }

  await supabase.from("participants").delete().eq("id", participant_id);

  return NextResponse.json({ success: true });
}
