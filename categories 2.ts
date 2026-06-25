import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await db.execute(sql`
    SELECT c.id, c.name, c.description, c.color,
           COUNT(t.id)::int AS "threadCount"
    FROM categories c
    LEFT JOIN threads t ON t.category_id = c.id
    GROUP BY c.id
    ORDER BY c.id
  `);
  res.json(categories.rows);
});

export default router;
