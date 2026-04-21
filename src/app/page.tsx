"use client";

import Link from "next/link";
import { BookOpen, PenTool, MessageSquare, Radio, ArrowRight, TrendingUp, Star } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ─── Variants d'animation ───────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

/* ─── Données ────────────────────────────────────────────────────────────── */

const featuredBooks = [
  { title: "Le Problème à trois corps", author: "Liu Cixin",      cover: "https://covers.openlibrary.org/b/isbn/9782330035594-L.jpg", rating: 4.6, reviews: 312, badge: "Édité" },
  { title: "Normal People",             author: "Sally Rooney",   cover: "https://covers.openlibrary.org/b/isbn/9782072952869-L.jpg", rating: 4.2, reviews: 198, badge: "Édité" },
  { title: "Klara et le Soleil",        author: "Kazuo Ishiguro", cover: "https://covers.openlibrary.org/b/isbn/9782072967047-L.jpg", rating: 4.4, reviews: 241, badge: "Édité" },
];

const featuredFictions = [
  { title: "Les Ombres de Valcrest",  author: "Élise M.", genre: "Fantasy", chapters: 14, status: "En cours", badge: "Communauté" },
  { title: "Mémoire d'une autre vie", author: "Théo R.",  genre: "Romance", chapters: 28, status: "Terminé",  badge: "Communauté" },
  { title: "Station Aurore",          author: "Jade F.",  genre: "SF",      chapters: 7,  status: "En cours", badge: "Communauté" },
];

const sections = [
  { href: "/da",       icon: BookOpen,      title: "DA",       subtitle: "Discussion & Analyse",    description: "Fiches livres, critiques notées, débats structurés et analyses collectives.",        colorClass: "text-blue-500",   bgClass: "bg-blue-500/10" },
  { href: "/ateliers", icon: PenTool,       title: "Ateliers", subtitle: "Fictions communautaires", description: "Publiez vos histoires par chapitres, recevez des retours, soutenez les auteurs.", colorClass: "text-violet-500", bgClass: "bg-violet-500/10" },
  { href: "/agora",    icon: MessageSquare, title: "Agora",    subtitle: "Forum littéraire",         description: "Canaux thématiques, débats ouverts — le forum qui parle de littérature.",          colorClass: "text-green-600",  bgClass: "bg-green-600/10" },
  { href: "/lives",    icon: Radio,         title: "Lives",    subtitle: "En direct",                description: "Clubs de lecture, Q&A auteurs, débats filmés et replays archivés.",               colorClass: "text-rose-500",   bgClass: "bg-rose-500/10" },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs tracking-wide uppercase">
              Bêta — Bientôt disponible
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-3xl font-normal leading-tight sm:text-5xl lg:text-6xl"
          >
            La plateforme littéraire<br />
            <em className="text-[var(--accent)]">francophone</em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 mx-auto max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            Lisez, écrivez, débattez. Retrouvez les livres que vous aimez, publiez vos fictions,
            et rejoignez une communauté qui prend la littérature au sérieux.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className={cn(buttonVariants({ size: "lg" }), "w-full border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 sm:w-auto")}
            >
              Rejoindre Marginalia <ArrowRight size={16} />
            </Link>
            <Link href="/da" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
              Explorer les livres
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Separator />

      {/* 4 sections */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="font-serif text-2xl sm:text-3xl mb-8 text-center"
        >
          Tout ce que Marginalia propose
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {sections.map(({ href, icon: Icon, title, subtitle, description, colorClass, bgClass }) => (
            <motion.div key={href} variants={fadeUp}>
              <Link
                href={href}
                className="group flex flex-col rounded-xl border border-border p-5 hover:border-[var(--accent)]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full"
              >
                <div className={cn("inline-flex rounded-lg p-2 mb-4 w-fit", bgClass)}>
                  <Icon size={20} className={colorClass} />
                </div>
                <p className={cn("font-serif text-lg font-medium", colorClass)}>{title}</p>
                <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
                <div className={cn("mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200", colorClass)}>
                  Explorer <ArrowRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Separator />

      {/* Livres tendance */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 className="font-serif text-2xl flex items-center gap-2">
            <TrendingUp size={20} className="text-[var(--accent)]" />
            Livres tendance
          </h2>
          <Link href="/da" className="text-sm text-muted-foreground hover:text-[var(--accent)] transition-colors flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
        >
          {featuredBooks.map((book) => (
            <motion.div
              key={book.title}
              variants={fadeUp}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="cursor-pointer rounded-xl border border-border p-4 transition-shadow hover:border-[var(--accent)]/30 hover:shadow-md sm:flex sm:gap-4"
            >
              <div className="mb-3 h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:mb-0 sm:h-20 sm:w-14">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex flex-col justify-between min-w-0">
                <div>
                  <Badge variant="secondary" className="text-xs mb-1 font-normal">{book.badge}</Badge>
                  <p className="font-serif text-sm font-medium leading-snug line-clamp-2">{book.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium">{book.rating}</span>
                  <span className="text-xs text-muted-foreground">({book.reviews})</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Separator />

      {/* Fictions en vedette */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 className="font-serif text-2xl flex items-center gap-2">
            <PenTool size={20} className="text-[var(--accent)]" />
            Fictions du moment
          </h2>
          <Link href="/ateliers" className="text-sm text-muted-foreground hover:text-[var(--accent)] transition-colors flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {featuredFictions.map((fiction) => (
            <motion.div
              key={fiction.title}
              variants={fadeUp}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-xl border border-border p-5 hover:border-[var(--accent)]/30 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs font-normal">{fiction.badge}</Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs", fiction.status === "Terminé" ? "border-green-600 text-green-600" : "border-blue-500 text-blue-500")}
                >
                  {fiction.status}
                </Badge>
              </div>
              <p className="font-serif text-base font-medium leading-snug">{fiction.title}</p>
              <p className="text-xs text-muted-foreground mt-1">par {fiction.author}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><BookOpen size={11} /> {fiction.chapters} chapitres</span>
                <span>{fiction.genre}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA final */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="bg-[var(--accent)]/5 border-t border-[var(--accent)]/10"
      >
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl mb-4">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Inscription gratuite. Pas d&apos;abonnement. Juste de la littérature.
          </p>
          <Link
            href="/auth/register"
            className={cn(buttonVariants({ size: "lg" }), "bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-transparent")}
          >
            Créer mon compte <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>

    </div>
  );
}
