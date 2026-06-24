import { NextResponse } from "next/server";
import { getServiceClient } from "../../../lib/supabase";

export async function POST(request) {
  const body = await request.json();
  const { participant_id, name, whatsapp, slot_id, test_id } = body;

  if (!slot_id || !test_id) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  const supabase = getServiceClient();
  let pid = participant_id;

  if (!pid) {
    if (!name || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se este WhatsApp já tem os 4 testes agendados (não pode agendar de novo)
    const cleanWhats = whatsapp.replace(/\D/g, "");
    const { data: existing } = await supabase
      .from("participants")
      .select("id, whatsapp, bookings(count)")
      .eq("whatsapp", cleanWhats);

    if (existing && existing.length > 0) {
      const already = existing.find((p) => (p.bookings?.[0]?.count || 0) >= 4);
      if (already) {
        return NextResponse.json(
          {
            error:
              "Este WhatsApp já completou o agendamento de todos os testes. Se precisar alterar algo, peça para a organizadora.",
          },
          { status: 409 }
        );
      }
      // reaproveita participante existente que ainda não completou tudo
      pid = existing[0].id;
    } else {
      const { data: newP, error: pErr } = await supabase
        .from("participants")
        .insert({ name, whatsapp: cleanWhats })
        .select("id")
        .single();
      if (pErr) {
        return NextResponse.json({ error: pErr.message }, { status: 500 });
      }
      pid = newP.id;
    }
  }

  // Impede agendar duas vezes o mesmo teste para a mesma pessoa
  const { data: dup } = await supabase
    .from("bookings")
    .select("id")
    .eq("participant_id", pid)
    .eq("test_id", test_id)
    .maybeSingle();

  if (dup) {
    return NextResponse.json(
      { error: "Você já agendou este teste." },
      { status: 409 }
    );
  }

  // Reserva atômica do horário (evita duas pessoas pegarem a mesma vaga)
  const { data: ok, error: rpcErr } = await supabase.rpc("book_slot", {
    p_slot_id: slot_id,
  });

  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 });
  }
  if (!ok) {
    return NextResponse.json(
      { error: "Esse horário acabou de ser ocupado por outra pessoa. Escolha outro horário." },
      { status: 409 }
    );
  }

  const { error: bErr } = await supabase
    .from("bookings")
    .insert({ participant_id: pid, slot_id, test_id });

  if (bErr) {
    // desfaz a reserva do horário já que o agendamento falhou
    await supabase.rpc("release_slot", { p_slot_id: slot_id });
    return NextResponse.json({ error: bErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, participant_id: pid });
}
