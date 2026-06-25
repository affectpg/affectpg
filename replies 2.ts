import { Router } from "express";
import { db, repliesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { CreateReplyBody, CreateReplyParams } from "@workspace/api-zod";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid thread id" });
    return;
  }
  const replies = await db.select().from(repliesTable)
    .where(eq(repliesTable.threadId, id))
    .orderBy(asc(repliesTable.createdAt));

  res.json(replies.map(r => ({
    id: r.id,
    threadId: r.threadId,
    body: r.body,
    authorName: r.authorName,
    isAnonymous: r.isAnonymous,
    createdAt: r.createdAt,
  })));
});

router.post("/", async (req, res) => {
  const paramsParsed = CreateReplyParams.safeParse({ id: parseInt(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid thread id" });
    return;
  }
  const bodyParsed = CreateReplyBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid input", issues: bodyParsed.error.issues });
    return;
  }

  const { body, authorName, isAnonymous } = bodyParsed.data;
  const [reply] = await db.insert(repliesTable).values({
    threadId: paramsParsed.data.id,
    body,
    authorName,
    isAnonymous,
  }).returning();

  res.status(201).json({
    id: reply.id,
    threadId: reply.threadId,
    body: reply.body,
    authorName: reply.authorName,
    isAnonymous: reply.isAnonymous,
    createdAt: reply.createdAt,
  });
});

export default router;
