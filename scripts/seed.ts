import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { branches, executives, services } from "../src/db/schema";
import { BRANCHES, EXECUTIVES, SERVICES } from "../src/lib/catalog";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  for (const b of BRANCHES) {
    await db
      .insert(branches)
      .values(b)
      .onConflictDoUpdate({
        target: branches.slug,
        set: {
          name: b.name,
          region: b.region,
          province: b.province,
          city: b.city,
          address: b.address,
          contact: b.contact,
          email: b.email,
          hours: b.hours,
          latitude: b.latitude,
          longitude: b.longitude,
          isHq: b.isHq ?? false,
          notes: b.notes ?? null,
        },
      });
  }

  await db.delete(executives);
  await db.insert(executives).values(EXECUTIVES);

  for (const s of SERVICES) {
    await db
      .insert(services)
      .values(s)
      .onConflictDoUpdate({ target: services.sku, set: { ...s } });
  }

  const [branchCount] = await db
    .select({ count: branches.id })
    .from(branches)
    .where(eq(branches.region, "NCR"));
  console.log(
    `Seeded ${BRANCHES.length} branches, ${EXECUTIVES.length} executives, ${SERVICES.length} services (last NCR row id ${branchCount?.count}).`,
  );
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });
