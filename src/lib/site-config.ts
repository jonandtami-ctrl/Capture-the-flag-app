/**
 * Central place to edit ministry name, contact details, navigation,
 * and other site-wide content. Update this file when the final
 * ministry name, contact email, or social links are ready.
 */

export const siteConfig = {
  ministryName: "Jon and Tami Masson",
  tagline: "Prophetic Ministry • Inner Healing • Equipping",
  description:
    "Jon and Tami Masson help people hear God's voice, receive prophetic encouragement, experience healing and freedom, and grow in their identity in Christ.",
  url: "https://www.jonandtamimasson.org",
  contactEmail: "hello@jonandtamimasson.org",
  contactPhone: "",
  location: "",

  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Prophetic Sessions", href: "/prophetic-sessions" },
    { label: "Restoring the Foundations", href: "/restoring-the-foundations" },
    { label: "Invite Us", href: "/invite-us" },
    { label: "Contact", href: "/contact" },
  ],

  footerLegalNav: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Ministry Disclaimer", href: "/ministry-disclaimer" },
  ],

  ctaLabel: "Request a Session",
  ctaHref: "/prophetic-sessions",

  teachingTopics: [
    "Hearing God's Voice",
    "Growing in the Prophetic",
    "Biblical Prophetic Ministry",
    "Prophetic Activation",
    "Identity in Christ",
    "Healthy Spiritual Discernment",
    "Inner Healing and Freedom",
    "Spirit-Led Leadership",
    "Building Healthy Ministry Culture",
    "Becoming a Leader Others Want to Follow",
    "Prayer and Intercession",
    "Walking in Intimacy with Jesus",
  ],

  // PLACEHOLDER CONTENT: replace with real, approved testimonies before launch.
  testimonials: [
    {
      quote:
        "Jon and Tami created a safe and encouraging environment. I left feeling strengthened, seen by God, and more confident in recognizing His voice.",
      name: "Session Participant",
    },
    {
      quote:
        "Their ministry is gentle, biblical, and full of genuine love. I experienced real freedom and a deeper understanding of who I am in Christ.",
      name: "Session Participant",
    },
    {
      quote:
        "The teaching was practical and easy to apply, and the prayer ministry brought healing I had been longing for. I would recommend them to anyone.",
      name: "Session Participant",
    },
  ],

  whatToExpect: [
    {
      step: "1",
      title: "Submit a Request",
      description:
        "Complete the appropriate form and tell us a little about what you are looking for.",
    },
    {
      step: "2",
      title: "We Review Your Request",
      description:
        "Our team will prayerfully review your information and contact you about availability and next steps.",
    },
    {
      step: "3",
      title: "Attend Your Session",
      description:
        "Sessions may be available online or in person, depending on location and availability.",
    },
    {
      step: "4",
      title: "Continue Your Journey",
      description:
        "You will be encouraged to prayerfully process what was shared, remain connected to Scripture, and seek support from trusted spiritual leaders.",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
