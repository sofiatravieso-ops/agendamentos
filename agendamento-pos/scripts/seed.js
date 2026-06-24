// Importa os horários do arquivo data/tests-data.json para o banco Supabase.
// Rode com: npm run seed
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Erro: configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local antes de rodar o seed."
  );
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const dataPath = path.join(__dirname, "..", "data", "tests-data.json");
  const tests = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // Limpa horários existentes (cuidado: isso também removerá agendamentos via cascade)
  const { error: delErr } = await supabase
    .from("slots")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) {
    console.error("Erro ao limpar slots antigos:", delErr.message);
    process.exit(1);
  }

  let totalInserted = 0;
  for (const testId of Object.keys(tests)) {
    const test = tests[testId];
    const rows = test.slots.map((s) => ({
      test_id: testId,
      date: s.date,
      time: s.time,
      capacity: test.capacity_per_slot || 1,
      booked_count: 0,
    }));

    const { error } = await supabase.from("slots").insert(rows);
    if (error) {
      console.error(`Erro ao inserir horários de ${testId}:`, error.message);
      process.exit(1);
    }
    totalInserted += rows.length;
    console.log(`✔ ${test.label}: ${rows.length} horários importados`);
  }

  console.log(`\nImportação concluída! Total: ${totalInserted} horários.`);
}

main();
