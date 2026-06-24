import { NextResponse } from "next/server";
import { getServiceClient } from "../../../../lib/supabase";
import { checkAdminAuth } from "../../../../lib/adminAuth";

export async function POST(request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const { booking_id } = await request.json();
  if (!booking_id) {
    return NextResponse.json({ error: "booking_id é obrigatório" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: booking, error: getErr } = await supabase
    .from("bookings")
    .select("id, slot_id")
    .eq("id", booking_id)
    .single();

  if (getErr || !booking) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }

  const { error: delErr } = await supabase.from("bookings").delete().eq("id", booking_id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  // Libera a vaga do horário para que outra pessoa possa agendar
  await supabase.rpc("release_slot", { p_slot_id: booking.slot_id });

  return NextResponse.json({ success: true });
}
