import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/overview", async (_req, res) => {
  const result = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM threads) AS "totalThreads",
      (SELECT COUNT(*)::int FROM replies) AS "totalReplies",
      (SELECT COUNT(*)::int FROM categories) AS "totalCategories",
      (SELECT COUNT(*)::int FROM threads WHERE created_at > NOW() - INTERVAL '7 days') AS "recentActivity"
  `);
  res.json(result.rows[0]);
});

export default router;
