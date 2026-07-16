import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sessionsTable } from "@workspace/db";
import {
  SubmitAnswersABody,
  SubmitAnswersAParams,
  SubmitAnswersBBody,
  SubmitAnswersBParams,
  GetSessionParams,
  GetVerdictParams,
} from "@workspace/api-zod";
import { computeVerdict } from "../lib/verdict";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// POST /sessions — create a new session
router.post("/sessions", async (req, res): Promise<void> => {
  const sessionId = randomUUID();
  const partnerBToken = randomUUID();

  await db.insert(sessionsTable).values({
    id: sessionId,
    partnerBToken,
    state: "waiting_a",
  });

  res.status(201).json({ sessionId, partnerBToken });
});

// GET /sessions/:sessionId — get session status
router.get("/sessions/:sessionId", async (req, res): Promise<void> => {
  const parsed = GetSessionParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, parsed.data.sessionId));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json({
    sessionId: session.id,
    partnerBToken: session.partnerBToken,
    state: session.state,
    partnerAName: session.partnerAName ?? null,
    partnerBName: session.partnerBName ?? null,
    createdAt: session.createdAt,
  });
});

// POST /sessions/:sessionId/answers-a — submit Partner A answers
router.post(
  "/sessions/:sessionId/answers-a",
  async (req, res): Promise<void> => {
    const paramsParsed = SubmitAnswersAParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: paramsParsed.error.message });
      return;
    }

    const bodyParsed = SubmitAnswersABody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: bodyParsed.error.message });
      return;
    }

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, paramsParsed.data.sessionId));

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.state !== "waiting_a") {
      res.status(400).json({ error: "Partner A has already answered" });
      return;
    }

    const [updated] = await db
      .update(sessionsTable)
      .set({
        partnerAName: bodyParsed.data.partnerName,
        answersA: bodyParsed.data.answers,
        state: "waiting_b",
      })
      .where(eq(sessionsTable.id, paramsParsed.data.sessionId))
      .returning();

    res.json({
      sessionId: updated.id,
      partnerBToken: updated.partnerBToken,
      state: updated.state,
      partnerAName: updated.partnerAName ?? null,
      partnerBName: updated.partnerBName ?? null,
      createdAt: updated.createdAt,
    });
  }
);

// POST /sessions/:sessionId/answers-b — submit Partner B answers + compute verdict
router.post(
  "/sessions/:sessionId/answers-b",
  async (req, res): Promise<void> => {
    const paramsParsed = SubmitAnswersBParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: paramsParsed.error.message });
      return;
    }

    const bodyParsed = SubmitAnswersBBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: bodyParsed.error.message });
      return;
    }

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, paramsParsed.data.sessionId));

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.state !== "waiting_b") {
      res.status(400).json({
        error:
          session.state === "waiting_a"
            ? "Partner A has not yet answered"
            : "Session is already complete",
      });
      return;
    }

    if (bodyParsed.data.partnerBToken !== session.partnerBToken) {
      res.status(400).json({ error: "Invalid invite token" });
      return;
    }

    const answersA = session.answersA!;
    const answersB = bodyParsed.data.answers;
    const partnerAName = session.partnerAName!;
    const partnerBName = bodyParsed.data.partnerName;

    const verdict = computeVerdict(
      session.id,
      partnerAName,
      partnerBName,
      answersA,
      answersB
    );

    const [updated] = await db
      .update(sessionsTable)
      .set({
        partnerBName,
        answersB,
        state: "complete",
        verdict,
      })
      .where(eq(sessionsTable.id, paramsParsed.data.sessionId))
      .returning();

    res.json({
      sessionId: updated.id,
      partnerBToken: updated.partnerBToken,
      state: updated.state,
      partnerAName: updated.partnerAName ?? null,
      partnerBName: updated.partnerBName ?? null,
      createdAt: updated.createdAt,
    });
  }
);

// GET /sessions/:sessionId/verdict — get the verdict
router.get("/sessions/:sessionId/verdict", async (req, res): Promise<void> => {
  const parsed = GetVerdictParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, parsed.data.sessionId));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (session.state !== "complete" || !session.verdict) {
    res.status(400).json({ error: "Verdict is not ready yet" });
    return;
  }

  const v = session.verdict;
  res.json({
    sessionId: session.id,
    partnerAName: v.partnerAName,
    partnerBName: v.partnerBName,
    alignmentScore: v.alignmentScore,
    diceRoll: v.diceRoll,
    cards: v.cards,
  });
});

export default router;
