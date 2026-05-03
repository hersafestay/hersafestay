/**
 * HerSafeStay — Female Reviewer Detector
 *
 * Heuristic name-based classifier that estimates the probability that a reviewer
 * is female. No external API required — works entirely from curated name lists
 * and linguistic patterns.
 *
 * Returns { isFemale: boolean|null, confidence: number } where:
 *   confidence 0.0  = definitely male
 *   confidence 0.5  = ambiguous / unknown
 *   confidence 1.0  = very likely female
 *   isFemale null   = could not determine (empty/anonymous reviewer name)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Name bank — common female first names across major travel demographics
// ─────────────────────────────────────────────────────────────────────────────

const FEMALE_NAMES = new Set([
  // English
  "emma","olivia","ava","isabella","sophia","mia","charlotte","amelia","harper",
  "evelyn","abigail","emily","elizabeth","mila","ella","avery","sofía","camila",
  "aria","scarlett","victoria","madison","luna","grace","chloe","penelope","layla",
  "riley","zoey","nora","lily","eleanor","hannah","lillian","addison","aubrey",
  "ellie","stella","natalie","zoe","leah","hazel","violet","aurora","savannah",
  "audrey","brooklyn","bella","claire","skylar","lucy","paisley","everly","anna",
  "caroline","nova","genesis","emilia","kennedy","samantha","maya","willow","kinsley",
  "naomi","aaliyah","elena","sarah","ariana","allison","gabriella","alice","madelyn",
  "cora","ruby","eva","serenity","autumn","adeline","hailey","gianna","valentina",
  "isla","eliana","quinn","nevaeh","ivy","sadie","piper","lydia","alexa","josephine",
  "emery","julia","delilah","arianna","vivian","kaylee","sophie","brielle","madeline",
  // European
  "marie","anne","julie","claire","laura","camille","manon","alice","justine","sarah",
  "lucie","margot","inès","lea","charlotte","emma","chloe","océane","elisa","anais",
  "anna","lena","julia","sarah","lisa","hannah","emma","leonie","mia","sophie",
  "maria","lucia","elena","carla","alba","nuria","paula","marta","andrea","patricia",
  // Asian
  "mei","ling","xiu","fang","jing","hui","yan","li","na","min","dan","fen","hong",
  "ping","qian","sha","wei","xia","yun","zhen","sakura","yuki","hana","aoi","saki",
  "nana","rina","moe","kana","miku","ayaka","yui","mizuki","haruka","akane",
  "priya","ananya","divya","pooja","neha","shreya","swati","asha","meera","deepa",
  // Latin American
  "valentina","sofía","isabella","camila","valeria","luciana","mariana","fernanda",
  "gabriela","natalia","carolina","alejandra","daniela","paula","andrea","monica",
  // Scandinavian
  "astrid","freya","ingrid","sigrid","solveig","ragna","hilde","marit","guro",
  // Others
  "fatima","aisha","zainab","amira","nour","sara","lara","rania","dina","hana",
]);

const MALE_NAMES = new Set([
  "james","john","robert","michael","william","david","richard","joseph","thomas",
  "charles","christopher","daniel","matthew","anthony","mark","donald","steven",
  "paul","andrew","joshua","kevin","brian","george","timothy","ronald","edward",
  "jason","jeffrey","ryan","jacob","gary","nicholas","eric","jonathan","stephen",
  "larry","justin","scott","brandon","benjamin","samuel","raymond","frank","alexander",
  "patrick","jack","dennis","jerry","tyler","aaron","jose","adam","henry","nathan",
  "douglas","zachary","peter","kyle","walter","ethan","jeremy","harold","keith",
  "christian","roger","noah","gerald","carl","terry","sean","austin","arthur","logan",
  "liam","oliver","elijah","lucas","mason","logan","caleb","dylan","gabriel",
  "pierre","jean","louis","marc","nicolas","remi","hugo","antoine","thomas","robin",
  "hans","stefan","martin","peter","paul","karl","otto","ernst","max","felix",
  "wei","ming","jian","hao","tao","lei","bin","jun","bo","fei","gang","kun","peng",
  "kenji","takashi","hiroshi","yoshio","daisuke","shingo","ryu","akira","tatsuya",
  "raj","rahul","amit","arjun","vikram","suresh","ravi","anil","deepak","sanjay",
]);

// Patterns that strongly suggest female (suffix-based heuristics)
const FEMALE_SUFFIXES = ["ette", "ine", "elle", "ina", "ia", "ita", "ix", "ien"];
// Patterns more common in male names
const MALE_SUFFIXES  = ["ton", "son", "ard", "bert", "ert", "mund", "wald"];

// ─────────────────────────────────────────────────────────────────────────────
// Pronoun / self-description scan (used on review text when available)
// ─────────────────────────────────────────────────────────────────────────────

const FEMALE_PRONOUNS = /\b(she|her|herself|i'm a woman|i am a woman|as a woman|solo female)\b/i;
const MALE_PRONOUNS   = /\b(he|him|himself|i'm a man|i am a man|as a man|solo male)\b/i;

// ─────────────────────────────────────────────────────────────────────────────
// Core detector
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect whether a reviewer is likely female.
 *
 * @param {string} reviewerName   - display name from the review platform
 * @param {string} [reviewText]   - optional review body (improves accuracy)
 * @returns {{ isFemale: boolean|null, confidence: number }}
 */
export function detectFemaleReviewer(reviewerName, reviewText = "") {
  if (!reviewerName || reviewerName.trim().length === 0) {
    return { isFemale: null, confidence: 0.5 };
  }

  // Extract the first token as the likely first name
  const firstName = reviewerName
    .trim()
    .split(/[\s,._-]+/)[0]
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  let score = 0.5; // neutral prior

  // 1. Exact name match
  if (FEMALE_NAMES.has(firstName)) {
    score = Math.min(score + 0.40, 1.0);
  } else if (MALE_NAMES.has(firstName)) {
    score = Math.max(score - 0.40, 0.0);
  }

  // 2. Suffix heuristics (only if no exact match)
  if (score === 0.5 && firstName.length >= 4) {
    for (const sfx of FEMALE_SUFFIXES) {
      if (firstName.endsWith(sfx)) {
        score = Math.min(score + 0.15, 1.0);
        break;
      }
    }
    for (const sfx of MALE_SUFFIXES) {
      if (firstName.endsWith(sfx)) {
        score = Math.max(score - 0.15, 0.0);
        break;
      }
    }
  }

  // 3. Pronoun scan in review text (strong signal)
  if (reviewText) {
    if (FEMALE_PRONOUNS.test(reviewText)) {
      score = Math.min(score + 0.35, 1.0);
    } else if (MALE_PRONOUNS.test(reviewText)) {
      score = Math.max(score - 0.35, 0.0);
    }
  }

  // Round to 4 decimal places for storage
  const confidence = Math.round(score * 10000) / 10000;

  return {
    isFemale: confidence >= 0.65 ? true : confidence <= 0.35 ? false : null,
    confidence,
  };
}
