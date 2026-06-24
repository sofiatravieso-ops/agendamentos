import { NextResponse } from "next/server";
import { getServiceClient } from "../../../lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get("test_id");

  if (!testId) {
    return NextResponse.json({ error: "test_id é obrigatório" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("slots")
    .select("id, date, time, capacity, booked_count")
    .eq("test_id", testId)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Só retorna horários que ainda têm vaga
  const available = data.filter((s) => s.booked_count < s.capacity);

  return NextResponse.json({ slots: available });
}
