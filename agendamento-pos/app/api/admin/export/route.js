import { getServiceClient } from "../../../../lib/supabase";
import { checkAdminAuth } from "../../../../lib/adminAuth";
import ExcelJS from "exceljs";
import { TESTS, formatDateBR } from "../../../../lib/tests";

export async function GET(request) {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: "Senha incorreta." }), { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: participants } = await supabase
    .from("participants")
    .select("id, name, whatsapp, created_at")
    .order("name", { ascending: true });

  const { data: bookings } = await supabase
    .from("bookings")
    .select("participant_id, test_id, slot:slots(date, time)");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Agendamentos");

  const headerLabels = ["Nome", "WhatsApp", ...TESTS.map((t) => t.label)];
  sheet.addRow(headerLabels);
  sheet.getRow(1).font = { bold: true };
  sheet.columns = [{ width: 28 }, { width: 18 }, ...TESTS.map(() => ({ width: 26 }))];

  for (const p of participants || []) {
    const row = [p.name, p.whatsapp];
    for (const t of TESTS) {
      const b = (bookings || []).find(
        (bk) => bk.participant_id === p.id && bk.test_id === t.id
      );
      if (b && b.slot) {
        const dateStr = formatDateBR(b.slot.date);
        row.push(b.slot.time ? `${dateStr} às ${b.slot.time}` : dateStr);
      } else {
        row.push("—");
      }
    }
    sheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="agendamentos.xlsx"`,
    },
  });
}
