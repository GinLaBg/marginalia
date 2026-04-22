"use client";

import Link from "next/link";
import { BookOpen, PenTool, MessageSquare, ArrowRight, TrendingUp, Star, BookMarked, Sparkles } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ─── Variants ───────────────────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4 } },
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
  {
    href: "/lire",
    icon: BookOpen,
    title: "Lire",
    subtitle: "Découverte & lecture",
    description: "Des milliers d'histoires à découvrir. Fanfictions, romans, nouvelles — lisez gratuitement.",
    colorClass: "text-violet-400",
    bgClass: "bg-violet-500/10",
  },
  {
    href: "/ateliers",
    icon: PenTool,
    title: "Ateliers",
    subtitle: "Écriture & publication",
    description: "Publiez vos histoires par chapitres, organisez vos personnages, avancez à votre rythme.",
    colorClass: "text-indigo-400",
    bgClass: "bg-indigo-500/10",
  },
  {
    href: "/agora",
    icon: MessageSquare,
    title: "Agora",
    subtitle: "Forum & communauté",
    description: "Débattez, échangez des recommandations, théorisez — la communauté qui parle de livres.",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  {
    href: "/da",
    icon: BookMarked,
    title: "DA",
    subtitle: "Discussion & Analyse",
    description: "Fiches livres, critiques notées, analyses collectives et débats structurés.",
    colorClass: "text-sky-400",
    bgClass: "bg-sky-500/10",
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-28 overflow-hidden">
        {/* Halo décoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% -10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent)",
          }}
        />

        <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs tracking-widest uppercase">
              Bêta — Bientôt disponible
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-4xl font-normal leading-tight sm:text-5xl lg:text-[4rem]"
          >
            La plateforme littéraire<br />
            <em className="text-[var(--accent)]">francophone</em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 mx-auto max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            Lisez, écrivez, débattez. Une communauté qui prend la littérature au sérieux.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/lire"
              className={cn(buttonVariants({ size: "lg" }), "w-full border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 sm:w-auto gap-2")}
            >
              <BookOpen size={16} /> Découvrir des histoires
            </Link>
            <Link
              href="/auth/register"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Rejoindre Marginalia <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Separator />

      {/* ── 4 sections ────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
          <motion.div variants={fadeUp} className="mb-10 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Tout ce que Marginalia propose</p>
            <h2 className="font-serif text-2xl sm:text-3xl">Lire · Écrire · Échanger · Analyser</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {sections.map(({ href, icon: Icon, title, subtitle, description, colorClass, bgClass }) => (
              <motion.div key={href} variants={fadeUp}>
                <Link
                  href={href}
                  className="group flex flex-col rounded-xl border border-border/60 p-5 hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full bg-card/30 backdrop-blur-sm"
                >
                  <div className={cn("inline-flex rounded-lg p-2 mb-4 w-fit", bgClass)}>
                    <Icon size={18} className={colorClass} />
                  </div>
                  <p className={cn("font-serif text-base font-medium mb-0.5", colorClass)}>{title}</p>
                  <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wide">{subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
                  <div className={cn("mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200", colorClass)}>
                    Explorer <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <Separator />

      {/* ── Fictions du moment ────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <motion.div variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Communauté</p>
            <h2 className="font-serif text-2xl flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--accent)]" />
              Fictions du moment
            </h2>
          </div>
          <Link href="/lire" className="text-sm text-muted-foreground hover:text-[var(--accent)] transition-colors flex items-center gap-1 shrink-0">
            Tout lire <ArrowRight size={14} />
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
              className="rounded-xl border border-border/60 p-5 hover:border-[var(--accent)]/30 hover:shadow-md transition-all cursor-pointer bg-card/30"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs font-normal">{fiction.badge}</Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs", fiction.status === "Terminé" ? "border-emerald-600 text-emerald-600" : "border-sky-500 text-sky-500")}
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

      <Separator />

      {/* ── Livres tendance ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <motion.div variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Discussion & Analyse</p>
            <h2 className="font-serif text-2xl flex items-center gap-2">
              <TrendingUp size={18} className="text-sky-400" />
              Livres du moment
            </h2>
          </div>
          <Link href="/da" className="text-sm text-muted-foreground hover:text-[var(--accent)] transition-colors flex items-center gap-1 shrink-0">
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
              className="cursor-pointer rounded-xl border border-border/60 p-4 transition-all hover:border-[var(--accent)]/30 hover:shadow-md sm:flex sm:gap-4 bg-card/30"
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

      {/* ── CTA final ─────────────────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="relative overflow-hidden border-t border-[var(--accent)]/10"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 6%, transparent) 0%, transparent 60%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse 50% 80% at 80% 50%, color-mix(in srgb, var(--accent) 8%, transparent), transparent)" }}
        />
        <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl mb-4">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Inscription gratuite. Pas d&apos;abonnement. Juste de la littérature.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className={cn(buttonVariants({ size: "lg" }), "bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-transparent")}
            >
              Créer mon compte <ArrowRight size={16} />
            </Link>
            <Link
              href="/lire"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Découvrir les histoires
            </Link>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
