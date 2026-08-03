"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Replace this placeholder background with a full-width photo of Jon and Tami */}
      <div
        className="absolute inset-0 -z-20 bg-gradient-to-br from-beige via-cream to-beige-dark/70"
        role="img"
        aria-label="Photo of Jon and Tami Masson (placeholder)"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-dark/80 via-forest-dark/50 to-forest-dark/20" />

      <Container className="relative py-32 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-light"
        >
          Prophetic Ministry • Inner Healing • Equipping
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mx-auto mt-6 max-w-4xl font-serif text-4xl font-semibold leading-tight text-cream sm:text-5xl lg:text-6xl"
        >
          Hear His Voice.
          <br />
          Encounter His Love.
          <br />
          Walk in Freedom.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-cream/90 sm:text-xl"
        >
          We help people encounter Jesus, recognize His voice, experience
          healing, and grow in the freedom and identity He has for them.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button href="/prophetic-sessions" variant="primary-inverse">
            Request a Ministry Session
          </Button>
          <Button href="/invite-us" variant="secondary-inverse">
            Invite Us to Teach
          </Button>
        </motion.div>
      </Container>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-8 w-8 text-cream/70"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v14m0 0-6-6m6 6 6-6" />
        </svg>
      </motion.div>
    </section>
  );
}
