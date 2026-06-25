import { Router } from "express";
import { db, threadsTable, categoriesTable, repliesTable } from "@workspace/db";
import { eq, desc, ilike, sql, and } from "drizzle-orm";
import { CreateThreadBody, GetThreadParams, DeleteThreadParams } from "@workspace/api-zod";

const router = Router();

const threadWithMeta = async (where?: any) => {
  const query = sql`
    SELECT t.id, t.title, t.body, t.author_name AS "authorName", t.is_anonymous AS "isAnonymous",
           t.category_id AS "categoryId", c.name AS "categoryName", c.color AS "categoryColor",
           COUNT(r.id)::int AS "replyCount",
           t.created_at AS "createdAt", t.updated_at AS "updatedAt"
    FROM threads t
    JOIN categories c ON c.id = t.category_id
    LEFT JOIN replies r ON r.thread_id = t.id
    ${where ? sql`WHERE ${where}` : sql``}
    GROUP BY t.id, c.name, c.color
    ORDER BY t.created_at DESC
  `;
  const result = await db.execute(query);
  return result.rows;
};

router.get("/recent", async (_req, res) => {
  const result = await db.execute(sql`
    SELECT t.id, t.title, t.body, t.author_name AS "authorName", t.is_anonymous AS "isAnonymous",
           t.category_id AS "categoryId", c.name AS "categoryName", c.color AS "categoryColor",
           COUNT(r.id)::int AS "replyCount",
           t.created_at AS "createdAt", t.updated_at AS "updatedAt"
    FROM threads t
    JOIN categories c ON c.id = t.category_id
    LEFT JOIN replies r ON r.thread_id = t.id
    GROUP BY t.id, c.name, c.color
    ORDER BY t.created_at DESC
    LIMIT 5
  `);
  res.json(result.rows);
});

router.get("/", async (req, res) => {
  const { categoryId, search, limit = "20", offset = "0" } = req.query as Record<string, string>;

  let whereParts: string[] = [];
  const params: any[] = [];

  if (categoryId) {
    params.push(parseInt(categoryId));
    whereParts.push(`t.category_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    whereParts.push(`(t.title ILIKE $${params.length} OR t.body ILIKE $${params.length})`);
  }

  const where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
  const limitNum = parseInt(limit) || 20;
  const offsetNum = parseInt(offset) || 0;

  const result = await db.execute(sql.raw(`
    SELECT t.id, t.title, t.body, t.author_name AS "authorName", t.is_anonymous AS "isAnonymous",
           t.category_id AS "categoryId", c.name AS "categoryName", c.color AS "categoryColor",
           COUNT(r.id)::int AS "replyCount",
           t.created_at AS "createdAt", t.updated_at AS "updatedAt"
    FROM threads t
    JOIN categories c ON c.id = t.category_id
    LEFT JOIN replies r ON r.thread_id = t.id
    ${where}
    GROUP BY t.id, c.name, c.color
    ORDER BY t.created_at DESC
    LIMIT ${limitNum} OFFSET ${offsetNum}
  `, params));
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const parsed = CreateThreadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
    return;
  }
  const { title, body, authorName, isAnonymous, categoryId } = parsed.data;
  const [row] = await db.insert(threadsTable).values({
    title,
    body,
    authorName,
    isAnonymous,
    categoryId,
  }).returning();

  const result = await db.execute(sql`
    SELECT t.id, t.title, t.body, t.author_name AS "authorName", t.is_anonymous AS "isAnonymous",
           t.category_id AS "categoryId", c.name AS "categoryName", c.color AS "categoryColor",
           0::int AS "replyCount",
           t.created_at AS "createdAt", t.updated_at AS "updatedAt"
    FROM threads t
    JOIN categories c ON c.id = t.category_id
    WHERE t.id = ${row.id}
    GROUP BY t.id, c.name, c.color
  `);
  res.status(201).json(result.rows[0]);
});

router.get("/:id", async (req, res) => {
  const parsed = GetThreadParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const result = await db.execute(sql`
    SELECT t.id, t.title, t.body, t.author_name AS "authorName", t.is_anonymous AS "isAnonymous",
           t.category_id AS "categoryId", c.name AS "categoryName", c.color AS "categoryColor",
           COUNT(r.id)::int AS "replyCount",
           t.created_at AS "createdAt", t.updated_at AS "updatedAt"
    FROM threads t
    JOIN categories c ON c.id = t.category_id
    LEFT JOIN replies r ON r.thread_id = t.id
    WHERE t.id = ${parsed.data.id}
    GROUP BY t.id, c.name, c.color
  `);
  if (!result.rows[0]) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteThreadParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(threadsTable).where(eq(threadsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
