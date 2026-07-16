import type { VerdictCard, VerdictData } from "@workspace/db";

// Questions have 4 options each (0-3). We score alignment per question.
// If both partners pick the same index → 3 points
// Adjacent → 1 point
// Far → 0 points
function questionAlignment(a: number, b: number): number {
  const diff = Math.abs(a - b);
  if (diff === 0) return 3;
  if (diff === 1) return 1;
  return 0;
}

function computeAlignment(answersA: number[], answersB: number[]): number {
  const maxScore = answersA.length * 3;
  let score = 0;
  for (let i = 0; i < answersA.length; i++) {
    score += questionAlignment(answersA[i], answersB[i]);
  }
  return Math.round((score / maxScore) * 100);
}

// Seeded pseudo-random to keep dice deterministic per session
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 0x9e3779b9);
  }
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  let s = h >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const CAT_REACTIONS = [
  "...I suspected as much.",
  "Hmm. Interesting.",
  "The evidence is overwhelming.",
  "I should probably pretend I didn't see that.",
  "I've heard enough.",
  "...Most revealing.",
  "The court has taken note.",
  "As expected.",
  "...Bold of you both.",
  "The truth has sharp edges.",
];

function pickReaction(seed: string, index: number): string {
  const rng = seededRandom(seed + index);
  return CAT_REACTIONS[Math.floor(rng() * CAT_REACTIONS.length)];
}

const COUPLE_TITLES: { min: number; max: number; title: string; description: (a: string, b: string) => string }[] = [
  { min: 85, max: 100, title: "The Synchronized Souls", description: (a, b) => `${a} and ${b} move through life in rare alignment. The court has seldom seen such coherence.` },
  { min: 70, max: 84, title: "The Comfortable Constellation", description: (a, b) => `${a} and ${b} orbit each other with practiced ease. A partnership built on genuine understanding.` },
  { min: 55, max: 69, title: "The Productive Contradiction", description: (a, b) => `${a} and ${b} disagree well. Their differences are not flaws — they are features. The court approves.` },
  { min: 40, max: 54, title: "The Work-in-Progress", description: (a, b) => `${a} and ${b} are still writing their story. The most interesting chapters may lie ahead.` },
  { min: 0, max: 39, title: "The Chaotic Duo", description: (a, b) => `${a} and ${b} approach life from entirely different galaxies. The court finds this... impressive.` },
];

const STRENGTHS = [
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[1], ab[1]) >= 2, title: "Conflict Grace", description: "You navigate disagreements without destruction. This is rarer than diamonds." },
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[5], ab[5]) >= 2, title: "Shared Vision", description: "Your futures are facing the same direction. That alignment is the foundation of everything." },
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[3], ab[3]) >= 2, title: "Emotional Intelligence", description: "You understand each other's stress responses. This is the quiet superpower of lasting relationships." },
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[8], ab[8]) >= 2, title: "Space and Closeness Balance", description: "You've found the rare balance between togetherness and independence. The court is impressed." },
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[7], ab[7]) >= 2, title: "Spontaneous Spirit", description: "Your relationship still surprises itself. That spark is precious — protect it." },
  { trigger: () => true, title: "Endurance", description: "The fact that you are both here, in this court, willing to be seen — that itself is a strength." },
];

const COMPLAINTS = [
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[6], ab[6]) === 0, title: "Communication Gaps", description: "You two speak different dialects of emotion. The gaps are not insurmountable, but they are present." },
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[3], ab[3]) === 0, title: "Stress Mismatches", description: "When storms come, you seek different shelters. Consider building one together." },
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[1], ab[1]) === 0, title: "Apology Asymmetry", description: "The weight of reconciliation does not fall evenly. The court has observed this imbalance." },
  { trigger: (aa: number[], ab: number[]) => questionAlignment(aa[7], ab[7]) === 0, title: "Surprise Deficit", description: "Predictability has its comforts. But the court wonders — when did you last genuinely astonish each other?" },
  { trigger: () => true, title: "Minor Mysteries", description: "The court has identified small untranslated territories between you. They are not dangerous. Yet." },
];

const CONTRADICTIONS = [
  { title: "The Weekend Divergence", description: "One of you craves adventure. The other invented the concept of not leaving the couch. Both are correct." },
  { title: "The Space Paradox", description: "You both agreed you have plenty of space. Your partner disagreed. About the space you agreed on. The court is amused." },
  { title: "The Spontaneity Spiral", description: "You believe you are spontaneous. Your partner planned to say something about that." },
  { title: "The Future Frequency", description: "You discuss the future constantly. Your partner thinks you occasionally mention it. You are apparently at different frequencies." },
  { title: "The Appreciation Loop", description: "You feel appreciated. You show appreciation differently. Yet somehow, across this gap, you persist." },
];

const PREDICTIONS = [
  { min: 75, prediction: (a: string, b: string) => ({ title: "The Long Game", description: `The Cat foresees ${a} and ${b} in the same argument, twenty years from now, and laughing about it.` }) },
  { min: 55, prediction: (a: string, b: string) => ({ title: "The Growth Arc", description: `The Cat sees growth ahead — not in the dramatic, tear-filled way. In the quiet way. The best way.` }) },
  { min: 40, prediction: (a: string, b: string) => ({ title: "The Plot Twist", description: `Something unexpected approaches. ${a} and ${b} will surprise each other — and themselves. The court watches with interest.` }) },
  { min: 0, prediction: (a: string, b: string) => ({ title: "The Adventure", description: `The Cat predicts that ${a} and ${b} are at the beginning of something. Chaotic, uncertain, and entirely worth it.` }) },
];

const SENTENCES = [
  { min: 80, sentence: "Sentenced to continued happiness with the occasional minor disagreement for texture." },
  { min: 60, sentence: "Sentenced to mutual growth, shared meals, and learning each other's strange habits." },
  { min: 40, sentence: "Sentenced to honest conversations, small adjustments, and discovering what you already know." },
  { min: 0, sentence: "Sentenced to the magnificent chaos of two different people choosing each other anyway." },
];

export function computeVerdict(
  sessionId: string,
  partnerAName: string,
  partnerBName: string,
  answersA: number[],
  answersB: number[]
): VerdictData {
  const alignmentScore = computeAlignment(answersA, answersB);
  const rng = seededRandom(sessionId);
  const die1 = Math.floor(rng() * 6) + 1;
  const die2 = Math.floor(rng() * 6) + 1;

  const cards: VerdictCard[] = [];

  // 1. Couple Title
  const titleEntry = COUPLE_TITLES.find(t => alignmentScore >= t.min && alignmentScore <= t.max) ?? COUPLE_TITLES[COUPLE_TITLES.length - 1];
  cards.push({
    type: "couple_title",
    emoji: "🏆",
    title: titleEntry.title,
    description: titleEntry.description(partnerAName, partnerBName),
    catReaction: pickReaction(sessionId, 0),
  });

  // 2. Secret Strength
  const strength = STRENGTHS.find(s => s.trigger(answersA, answersB)) ?? STRENGTHS[STRENGTHS.length - 1];
  cards.push({
    type: "secret_strength",
    emoji: "💚",
    title: strength.title,
    description: strength.description,
    catReaction: pickReaction(sessionId, 1),
  });

  // 3. Mild Complaint
  const complaint = COMPLAINTS.find(c => c.trigger(answersA, answersB)) ?? COMPLAINTS[COMPLAINTS.length - 1];
  cards.push({
    type: "mild_complaint",
    emoji: "🚩",
    title: complaint.title,
    description: complaint.description,
    catReaction: pickReaction(sessionId, 2),
  });

  // 4. Funniest Contradiction
  const contradictionIdx = Math.floor(rng() * CONTRADICTIONS.length);
  const contradiction = CONTRADICTIONS[contradictionIdx];
  cards.push({
    type: "funniest_contradiction",
    emoji: "😂",
    title: contradiction.title,
    description: contradiction.description,
    catReaction: pickReaction(sessionId, 3),
  });

  // 5. Future Prediction
  const predEntry = PREDICTIONS.find(p => alignmentScore >= p.min) ?? PREDICTIONS[PREDICTIONS.length - 1];
  const pred = predEntry.prediction(partnerAName, partnerBName);
  cards.push({
    type: "future_prediction",
    emoji: "🔮",
    title: pred.title,
    description: pred.description,
    catReaction: pickReaction(sessionId, 4),
  });

  // 6. Court Sentence
  const sentenceEntry = SENTENCES.find(s => alignmentScore >= s.min) ?? SENTENCES[SENTENCES.length - 1];
  cards.push({
    type: "court_sentence",
    emoji: "⚖️",
    title: "The Sentence",
    description: sentenceEntry.sentence,
    catReaction: "The court has spoken.",
  });

  return {
    partnerAName,
    partnerBName,
    alignmentScore,
    diceRoll: { die1, die2, total: die1 + die2 },
    cards,
  };
}
