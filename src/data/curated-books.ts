export type BookBadge = "Édité" | "Indépendant" | "Communauté";
export type BookOrigin = "france" | "international" | "community";

export interface CuratedBook {
  isbn: string;
  title: string;
  author: string;
  year: number;
  publisher: string;
  pages: number;
  genres: string[];
  badge: BookBadge;
  origin: BookOrigin;
  description: string;
  award?: string; // Prix littéraire éventuel
  coverUrl?: string;
}

export const CURATED_BOOKS: CuratedBook[] = [
  // ── France ─────────────────────────────────────────────────────────────────
  {
    isbn: "9782072872761",
    title: "L'Anomalie",
    author: "Hervé Le Tellier",
    year: 2020,
    publisher: "Gallimard",
    pages: 334,
    genres: ["Roman", "Thriller", "Science-fiction"],
    badge: "Édité",
    origin: "france",
    award: "Prix Goncourt 2020",
    description:
      "En mars 2021, un avion Air France atterrit à New York — pour la deuxième fois. Le même vol, les mêmes passagers, trois mois après leur premier atterrissage. Un roman à tiroirs brillant sur l'identité, le destin et la réalité.",
  },
  {
    isbn: "9782877068864",
    title: "La Vérité sur l'affaire Harry Quebert",
    author: "Joël Dicker",
    year: 2012,
    publisher: "Éditions de Fallois",
    pages: 670,
    genres: ["Thriller", "Roman policier", "Roman"],
    badge: "Édité",
    origin: "france",
    award: "Grand Prix du roman de l'Académie française 2012",
    description:
      "L'écrivain Marcus Goldman retourne dans le New Hampshire pour aider son mentor, Harry Quebert, accusé du meurtre d'une adolescente disparue 33 ans plus tôt. Un page-turner implacable qui a conquis des millions de lecteurs.",
  },
  {
    isbn: "9782072736919",
    title: "Chanson douce",
    author: "Leïla Slimani",
    year: 2016,
    publisher: "Gallimard",
    pages: 240,
    genres: ["Roman", "Thriller psychologique"],
    badge: "Édité",
    origin: "france",
    award: "Prix Goncourt 2016",
    description:
      "La nounou est parfaite. Puis les enfants meurent. Un roman noir sur la maternité, la classe sociale et les apparences, construit à partir d'un fait divers réel. Glacial et impossible à lâcher.",
  },
  {
    isbn: "9782070360239",
    title: "L'Élégance du hérisson",
    author: "Muriel Barbery",
    year: 2006,
    publisher: "Gallimard",
    pages: 363,
    genres: ["Roman", "Philosophie"],
    badge: "Édité",
    origin: "france",
    description:
      "Renée est concierge. Paloma a 12 ans et veut mourir le jour de ses 13 ans. Ensemble, dans un immeuble bourgeois parisien, elles cherchent la beauté cachée du monde. Un phénomène de librairie traduit en 45 langues.",
  },
  {
    isbn: "9782253157151",
    title: "Rien ne s'oppose à la nuit",
    author: "Delphine de Vigan",
    year: 2011,
    publisher: "JC Lattès",
    pages: 410,
    genres: ["Autobiographie", "Roman"],
    badge: "Édité",
    origin: "france",
    award: "Prix Renaudot des lycéens 2011",
    description:
      "Delphine de Vigan raconte la vie de sa mère, Lucile — belle, brillante, et rattrapée par la folie. Un livre sur la mémoire familiale, les silences et la reconstruction, lu par plus d'un million de personnes.",
  },
  {
    isbn: "9782070778768",
    title: "Les Bienveillantes",
    author: "Jonathan Littell",
    year: 2006,
    publisher: "Gallimard",
    pages: 903,
    genres: ["Roman historique", "Guerre"],
    badge: "Édité",
    origin: "france",
    award: "Prix Goncourt 2006",
    description:
      "Un officier SS raconte sa guerre, de l'Ukraine à Berlin. Monumentale fresque sur l'extermination nazie vue de l'intérieur, saluée et controversée à parts égales. L'un des romans les plus marquants du XXIe siècle.",
  },

  // ── International ──────────────────────────────────────────────────────────
  {
    isbn: "9782226257017",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    year: 2015,
    publisher: "Albin Michel",
    pages: 511,
    genres: ["Essai", "Histoire", "Anthropologie"],
    badge: "Édité",
    origin: "international",
    description:
      "Une brève histoire de l'humanité : comment Homo sapiens a conquis la planète, inventé les religions, les empires et le capitalisme. Traduit en 65 langues, 25 millions d'exemplaires vendus.",
  },
  {
    isbn: "9782290004449",
    title: "L'Alchimiste",
    author: "Paulo Coelho",
    year: 1988,
    publisher: "Anne Carrière",
    pages: 192,
    genres: ["Roman", "Fable", "Initiation"],
    badge: "Édité",
    origin: "international",
    description:
      "Santiago, jeune berger andalou, part à la recherche d'un trésor en Égypte. Un roman-fable sur la réalisation de soi et l'écoute de son destin. 80 millions d'exemplaires vendus, l'un des livres les plus lus au monde.",
  },
  {
    isbn: "9782070368228",
    title: "1984",
    author: "George Orwell",
    year: 1949,
    publisher: "Gallimard",
    pages: 439,
    genres: ["Roman", "Dystopie", "Science-fiction"],
    badge: "Édité",
    origin: "international",
    description:
      "Dans l'Océania totalitaire, Winston Smith travaille au Ministère de la Vérité et rééécrit l'histoire. L'une des dystopies fondatrices de la littérature mondiale, plus actuelle que jamais.",
  },
  {
    isbn: "9782070541270",
    title: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    year: 1997,
    publisher: "Gallimard Jeunesse",
    pages: 308,
    genres: ["Fantasy", "Jeunesse", "Aventure"],
    badge: "Édité",
    origin: "international",
    description:
      "Harry Potter découvre qu'il est sorcier et rejoint Poudlard, école de magie et de sorcellerie. Le premier tome d'une saga qui a réuni 500 millions de lecteurs à travers le monde.",
  },
  {
    isbn: "9782330035594",
    title: "Le Problème à trois corps",
    author: "Liu Cixin",
    year: 2008,
    publisher: "Actes Sud",
    pages: 399,
    genres: ["Science-fiction", "Roman"],
    badge: "Édité",
    origin: "international",
    award: "Prix Hugo du meilleur roman 2015",
    description:
      "Pendant la Révolution culturelle chinoise, un signal est envoyé vers l'espace. Des décennies plus tard, une physicienne découvre que la réponse approche. La trilogie SF la plus ambitieuse du XXIe siècle.",
  },
  {
    isbn: "9782501154437",
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    publisher: "Marabout",
    pages: 320,
    genres: ["Développement personnel", "Psychologie"],
    badge: "Édité",
    origin: "international",
    description:
      "Comment de minuscules changements produisent des résultats remarquables. Une méthode concrète pour construire de bonnes habitudes et éliminer les mauvaises. 15 millions d'exemplaires vendus dans le monde.",
  },
];

export const GENRES = Array.from(
  new Set(CURATED_BOOKS.flatMap((b) => b.genres))
).sort();
