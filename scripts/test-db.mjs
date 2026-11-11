import { createClient } from '@supabase/supabase-js';

const url = 'https://sfcsncrdczzrscscarty.supabase.co';
const key = 'sb_publishable_xPMMyInm8gzZ0z28TmdLyw_cUbkeiZl';

const supabase = createClient(url, key);

const TABLES = [
  'profiles', 'addresses',
  'collections', 'products', 'product_variants', 'product_images', 'product_reviews',
  'discount_codes', 'carts', 'cart_items', 'orders', 'order_items',
  'announcements', 'campaigns',
  'page_views', 'analytics_events', 'daily_stats',
];

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  ORIIKO — Supabase Connection Test\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let passed = 0;
let failed = 0;

for (const table of TABLES) {
  const { error } = await supabase.from(table).select('id').limit(1);
  if (!error) {
    console.log(`  ✅  ${table}`);
    passed++;
  } else {
    console.log(`  ❌  ${table}  →  ${error.message}`);
    failed++;
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  ${passed} tables reachable  |  ${failed} errors`);

if (failed === 0) {
  console.log('  🟢  Database fully connected and all tables present.\n');
} else {
  console.log('  🔴  Some tables are missing or inaccessible. Re-run the migration.\n');
}

