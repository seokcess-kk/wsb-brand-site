import { neon } from "@neondatabase/serverless";

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required for e2e seeding");
  return neon(url);
}

export async function seedInquiry(): Promise<number> {
  const sql = sqlClient();
  const rows = (await sql`
    insert into inquiries (company, name, email, category, message, locale, status)
    values ('E2E Test Co', 'E2E Tester', 'e2e@example.com', 'Sourcing',
            'This is an automated e2e seed message.', 'ko', 'new')
    returning id
  `) as { id: number }[];
  return rows[0].id;
}

export async function deleteInquiry(id: number): Promise<void> {
  const sql = sqlClient();
  await sql`delete from inquiries where id = ${id}`;
}
