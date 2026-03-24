import faqs from "@/data/faqs.json";
import policies from "@/data/policies.json";
import products from "@/data/products.json";

type FAQ = {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
};

type Policy = {
  id: string;
  policyType: string;
  title: string;
  content: string;
  keywords: string[];
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  sizes: string[];
  colors: string[];
  materials: string[];
  stockStatus: string;
  description: string;
  careInstructions: string;
  keywords: string[];
};

export type RetrievedContext = {
  matchedFaqs: FAQ[];
  matchedPolicies: Policy[];
  matchedProducts: Product[];
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "do",
  "for",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "what",
  "when",
  "where",
  "which",
  "with",
  "you",
  "your",
]);

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));
}

function countKeywordMatches(userQuestion: string, keywords: string[]): number {
  const normalizedQuestion = normalizeText(userQuestion);

  return keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return normalizedQuestion.includes(normalizedKeyword) ? score + 5 : score;
  }, 0);
}

function countTokenOverlap(userQuestion: string, textFields: string[]): number {
  const questionTokens = new Set(tokenize(userQuestion));
  const fieldTokens = tokenize(textFields.join(" "));

  let overlap = 0;

  for (const token of fieldTokens) {
    if (questionTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap;
}

function scoreFaq(userQuestion: string, faq: FAQ): number {
  const keywordScore = countKeywordMatches(userQuestion, faq.keywords);
  const textScore = countTokenOverlap(userQuestion, [
    faq.category,
    faq.question,
    faq.answer,
  ]);

  return keywordScore + textScore;
}

function scorePolicy(userQuestion: string, policy: Policy): number {
  const keywordScore = countKeywordMatches(userQuestion, policy.keywords);
  const textScore = countTokenOverlap(userQuestion, [
    policy.policyType,
    policy.title,
    policy.content,
  ]);

  return keywordScore + textScore;
}

function scoreProduct(userQuestion: string, product: Product): number {
  const keywordScore = countKeywordMatches(userQuestion, product.keywords);
  const textScore = countTokenOverlap(userQuestion, [
    product.name,
    product.category,
    product.description,
    product.stockStatus,
    product.materials.join(" "),
    product.colors.join(" "),
    product.sizes.join(" "),
    product.careInstructions,
  ]);

  return keywordScore + textScore;
}

export function retrieveContext(userQuestion: string): RetrievedContext {
  const matchedFaqs = [...faqs]
    .map((faq) => ({
      ...faq,
      score: scoreFaq(userQuestion, faq),
    }))
    .filter((faq) => faq.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...faq }) => faq);

  const matchedPolicies = [...policies]
    .map((policy) => ({
      ...policy,
      score: scorePolicy(userQuestion, policy),
    }))
    .filter((policy) => policy.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ score, ...policy }) => policy);

  const matchedProducts = [...products]
    .map((product) => ({
      ...product,
      score: scoreProduct(userQuestion, product),
    }))
    .filter((product) => product.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ score, ...product }) => product);

  return {
    matchedFaqs,
    matchedPolicies,
    matchedProducts,
  };
}