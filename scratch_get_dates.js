require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from("matches")
    .select("id, match_number, match_date")
    .gte("match_number", 73)
    .lte("match_number", 88)
    .order("match_number", { ascending: true });

  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log(data);
}

run();
