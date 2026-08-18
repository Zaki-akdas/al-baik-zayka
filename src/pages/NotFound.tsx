import { motion } from "framer-motion";
import { ArrowLeft, Home, MessageCircle, Phone } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { LogoBadge } from "@/components/restaurant/LogoBadge";
import { restaurant } from "@/data/restaurant";
import { generalOrderMessage, telLink, waLink } from "@/lib/whatsapp";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-background text-foreground"
    >
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Al-Baik Zayka — home">
            <LogoBadge className="size-10" />
            <span className="leading-none">
              <span className="block font-display text-lg uppercase tracking-wide text-foreground">
                Al-Baik
              </span>
              <span className="block font-script text-lg font-bold leading-tight text-maroon">
                Zayka
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="size-4" />
                Back to site
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-lg text-center"
        >
          <motion.div variants={item}>
            <span className="font-display text-[10rem] leading-none tracking-tight text-maroon/15 sm:text-[14rem]">
              404
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-[-2rem] font-display text-4xl uppercase tracking-wide sm:text-5xl"
          >
            Page not{" "}
            <span className="font-script font-bold normal-case text-maroon">
              found
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Looks like this page doesn't exist — maybe it was moved, or the link
            is outdated. Let's get you back on track.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button size="lg" asChild className="h-12 px-7 text-base">
              <Link to="/">
                <Home className="size-5" />
                Go to homepage
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-7 text-base"
            >
              <a
                href={waLink(generalOrderMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-5" />
                WhatsApp
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-7 text-base"
            >
              <a href={telLink}>
                <Phone className="size-5" />
                Call {restaurant.phone}
              </a>
            </Button>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-10 text-xs text-muted-foreground"
          >
            Need help?{" "}
            <a
              href={waLink(generalOrderMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-maroon hover:underline"
            >
              Message us on WhatsApp
            </a>{" "}
            or{" "}
            <a href={telLink} className="font-semibold text-maroon hover:underline">
              call {restaurant.phone}
            </a>
          </motion.p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 {restaurant.name}. All Rights Reserved.
        </p>
      </footer>
    </motion.div>
  );
}
