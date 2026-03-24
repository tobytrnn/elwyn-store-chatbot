import { retrieveContext } from "./retrieveContext";

const questions = [
  "Can I return sale items?",
  "How long does standard shipping take?",
  "What sizes does the Elara Dress come in?",
  "Is the Selene Cardigan in stock?",
];

for (const question of questions) {
  console.log("\nQUESTION:", question);
  console.log(JSON.stringify(retrieveContext(question), null, 2));
  console.log("=".repeat(80));
}