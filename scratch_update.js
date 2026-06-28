require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("*");
  if (pErr) return console.error(pErr);
  
  const santiProfile = profiles.find(p => JSON.stringify(p).toLowerCase().includes("santi"));
  if (!santiProfile) return console.error("Santi not found");
  
  console.log("Found Santi ID:", santiProfile.id, santiProfile);
  
  const { error: pUpdateErr } = await supabase
    .from("profiles")
    .update({ total_points: 59 })
    .eq("id", santiProfile.id);
    
  if (pUpdateErr) console.error("Profile update error:", pUpdateErr);
  else console.log("Successfully updated Santi total_points to 59!");
}

main();
