"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Gift, MessageCircle, X } from "lucide-react";
import { claimWelcomeOffer, joinRewards, lookupPoints, type RewardsState } from "@/lib/actions/rewards";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { JOIN_BONUS_POINTS, REWARD_TIERS, WAYS_TO_EARN, WELCOME_CODE, WELCOME_MIN_SPEND, WELCOME_PERCENT } from "@/lib/rewards";
import { cn } from "@/lib/utils";

const idle: RewardsState = { success: false, message: "" };
const SEEN_KEY = "kflore-welcome-seen";

const lightFieldClass =
  "focus-ring h-11 w-full border border-taupe/40 bg-white px-3 text-sm text-soft-black placeholder:text-taupe";

function CloseButton({ onClick, light }: { onClick: () => void; light?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={cn("focus-ring absolute right-3 top-3 p-1", light ? "text-ivory/90 hover:text-ivory" : "text-taupe hover:text-soft-black")}
    >
      <X className="h-5 w-5" />
    </button>
  );
}

function useEscape(open: boolean, close: () => void) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);
}

/* ------------------------------------------------------------------ */
/* WhatsApp: floating button + direct-chat card                        */
/* ------------------------------------------------------------------ */
function WhatsAppChat({ whatsappNumber, open, setOpen }: { whatsappNumber: string; open: boolean; setOpen: (v: boolean) => void }) {
  const [text, setText] = React.useState("");
  useEscape(open, () => setOpen(false));
  const topics = ["Same-day delivery", "Wedding flowers", "Custom bouquet", "Corporate / events"];

  const start = (message: string) => {
    const body = message.trim() || "Hi KFLORÉ, I would like to enquire about your flowers.";
    window.open(buildWhatsAppUrl(whatsappNumber, body), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Chat with KFLORÉ on WhatsApp"
          className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-[22rem] overflow-hidden bg-white shadow-2xl sm:right-6"
        >
          <div className="relative bg-[#128c7e] px-5 py-4 text-white">
            <p className="font-serif-display text-lg">Chat with KFLORÉ</p>
            <p className="text-xs text-white/85">Message us directly on WhatsApp</p>
            <CloseButton onClick={() => setOpen(false)} light />
          </div>
          <div className="flex flex-col gap-3 bg-[#efeae2] p-4">
            <p className="max-w-[85%] self-start bg-white px-3 py-2 text-sm text-soft-black shadow-sm">
              Hello! How can we help with your flowers today?
            </p>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => start(`Hi KFLORÉ, I would like to ask about: ${t}.`)}
                  className="focus-ring border border-[#128c7e]/50 bg-white px-3 py-1.5 text-xs text-[#0b5f55] hover:bg-[#128c7e] hover:text-white"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(text);
            }}
            className="flex gap-2 border-t border-taupe/15 bg-white p-3"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message…"
              aria-label="Your message"
              className="focus-ring h-10 min-w-0 flex-1 border border-taupe/30 px-3 text-sm"
            />
            <button type="submit" className="focus-ring bg-[#25d366] px-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1ebe5b]">
              Chat
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close WhatsApp chat" : "Chat with us on WhatsApp"}
        aria-expanded={open}
        className="focus-ring fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl transition-transform hover:scale-105 sm:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Welcome offer popup (sign up & get 10% off)                         */
/* ------------------------------------------------------------------ */
function WelcomePopup({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [state, action, pending] = React.useActionState(claimWelcomeOffer, idle);
  const [copied, setCopied] = React.useState(false);
  useEscape(show, onClose);
  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label={`Welcome gift: ${WELCOME_PERCENT}% off your first order`}
      className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-[23rem] bg-ivory p-2 text-center text-soft-black shadow-2xl sm:right-6"
    >
      <div className="border border-gold/70 px-6 pb-7 pt-8">
        <CloseButton onClick={onClose} />
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">KFLORÉ welcome gift</p>
        <h2 className="mt-3 font-serif-display text-3xl leading-tight text-burgundy [font-variant-numeric:lining-nums]">
          A little bloom
          <br />
          on us
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-soft-black/80">
          Join our list and enjoy{" "}
          <strong className="font-semibold text-burgundy [font-variant-numeric:lining-nums]">{WELCOME_PERCENT}% off</strong> your first bouquet.
        </p>

        <div className="mx-auto mt-5 flex items-center justify-between gap-3 border border-dashed border-gold px-4 py-2.5">
          <span className="text-left">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-taupe">Your code</span>
            <span className="font-medium tracking-[0.18em] text-burgundy">{WELCOME_CODE}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(WELCOME_CODE).then(() => setCopied(true)).catch(() => {});
            }}
            className="focus-ring text-[10px] font-medium uppercase tracking-[0.2em] text-burgundy underline-offset-4 hover:underline"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-taupe">Min. spend RM{WELCOME_MIN_SPEND} · once per email</p>

        {state.success ? (
          <p role="status" className="mt-5 text-sm text-burgundy">
            {state.message}
          </p>
        ) : (
          <form action={action} className="mt-5 flex flex-col gap-2.5" noValidate>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Your email address"
              aria-label="Email address"
              className="focus-ring h-11 w-full border border-taupe/40 bg-white px-3 text-sm text-soft-black placeholder:text-taupe"
            />
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            {state.message && !state.success && <p className="text-left text-xs text-red-700">{state.message}</p>}
            <button
              type="submit"
              disabled={pending}
              className="focus-ring h-11 bg-burgundy text-xs font-medium uppercase tracking-[0.25em] text-ivory hover:bg-burgundy-light disabled:opacity-60"
            >
              {pending ? "Sending…" : "Claim my gift"}
            </button>
          </form>
        )}

        <p className="mt-4 text-[10px] uppercase tracking-[0.1em] text-taupe">Same-day delivery · KL &amp; Klang Valley</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gift button + KFLORÉ Flower Points panel                            */
/* ------------------------------------------------------------------ */
function RewardsPanel({ whatsappNumber, open, setOpen }: { whatsappNumber: string; open: boolean; setOpen: (v: boolean) => void }) {
  const [joinState, joinAction, joining] = React.useActionState(joinRewards, idle);
  const [lookState, lookAction, looking] = React.useActionState(lookupPoints, idle);
  const [email, setEmail] = React.useState("");
  useEscape(open, () => setOpen(false));

  const redeemUrl = (title: string) =>
    buildWhatsAppUrl(
      whatsappNumber,
      `Hi KFLORÉ, I would like to redeem my Flower Points: ${title}.${email ? ` My membership email: ${email}` : ""}`
    );

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="KFLORÉ Flower Points"
          className="fixed bottom-24 left-4 z-50 flex max-h-[min(36rem,calc(100svh-8rem))] w-[calc(100vw-2rem)] max-w-[22rem] flex-col overflow-hidden bg-ivory shadow-2xl sm:left-6"
        >
          <div className="relative shrink-0 bg-burgundy px-6 pb-6 pt-5 text-ivory">
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/80">Welcome to</p>
            <p className="font-serif-display text-2xl">KFLORÉ Flower Points</p>
            <CloseButton onClick={() => setOpen(false)} light />
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <section className="bg-white p-5 text-center shadow-sm">
              <h3 className="font-serif-display text-lg text-soft-black">Become a member</h3>
              <p className="mt-1 text-xs leading-relaxed text-taupe">
                Join free and get {JOIN_BONUS_POINTS} welcome points. Use the same email at checkout and every order earns more.
              </p>
              {joinState.success ? (
                <p role="status" className="mt-4 text-sm text-burgundy">
                  {joinState.message}
                </p>
              ) : (
                <form action={joinAction} className="mt-4 flex flex-col gap-2 text-left" noValidate>
                  <input name="name" required autoComplete="name" placeholder="Full name" aria-label="Full name" className={lightFieldClass} />
                  <input name="email" type="email" required autoComplete="email" placeholder="Email" aria-label="Email" className={lightFieldClass} />
                  <input name="phone" type="tel" autoComplete="tel" placeholder="Phone (optional)" aria-label="Phone" className={lightFieldClass} />
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                  {joinState.message && <p className="text-xs text-red-700">{joinState.message}</p>}
                  <button type="submit" disabled={joining} className="focus-ring mt-1 h-11 bg-burgundy text-xs font-medium uppercase tracking-[0.2em] text-ivory hover:bg-burgundy-light disabled:opacity-60">
                    {joining ? "Joining…" : "Join now"}
                  </button>
                </form>
              )}
            </section>

            <section className="bg-white p-5 shadow-sm">
              <h3 className="font-serif-display text-lg text-soft-black">My points</h3>
              <form action={lookAction} className="mt-3 flex gap-2" noValidate>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Membership email"
                  aria-label="Membership email"
                  className={cn(lightFieldClass, "h-10 flex-1")}
                />
                <button type="submit" disabled={looking} className="focus-ring border border-burgundy px-3 text-xs uppercase tracking-wider text-burgundy hover:bg-burgundy hover:text-ivory disabled:opacity-60">
                  Check
                </button>
              </form>
              {lookState.message && !lookState.success && <p className="mt-2 text-xs text-red-700">{lookState.message}</p>}
              {lookState.success && (
                <div className="mt-3 text-sm" role="status">
                  <p className="text-soft-black">
                    Hi {lookState.firstName}, you have <strong className="text-burgundy">{lookState.points} points</strong>.
                  </p>
                  {lookState.history && lookState.history.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1 text-xs text-taupe">
                      {lookState.history.map((h, i) => (
                        <li key={i} className="flex justify-between">
                          <span>
                            {h.reason} · {h.date}
                          </span>
                          <span className="text-soft-black">{h.points > 0 ? `+${h.points}` : h.points}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>

            <section className="bg-white p-5 shadow-sm">
              <h3 className="font-serif-display text-lg text-soft-black">Ways to earn</h3>
              <ul className="mt-3 flex flex-col divide-y divide-taupe/15 text-sm">
                {WAYS_TO_EARN.map((w) => (
                  <li key={w.label} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-soft-black">{w.label}</span>
                    <span className="shrink-0 text-xs text-burgundy">{w.points}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white p-5 shadow-sm">
              <h3 className="font-serif-display text-lg text-soft-black">Rewards</h3>
              <ul className="mt-3 flex flex-col gap-3">
                {REWARD_TIERS.map((r) => (
                  <li key={r.points} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="block text-soft-black">{r.title}</span>
                      <span className="text-xs text-taupe">{r.detail}</span>
                    </span>
                    <a
                      href={redeemUrl(r.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring shrink-0 border border-burgundy px-3 py-1.5 text-[10px] uppercase tracking-wider text-burgundy hover:bg-burgundy hover:text-ivory"
                    >
                      Redeem
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-taupe">Redemptions are confirmed by our team on WhatsApp.</p>
            </section>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close rewards" : "Open KFLORÉ Flower Points rewards"}
        aria-expanded={open}
        className="focus-ring fixed bottom-5 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-burgundy text-ivory shadow-xl transition-transform hover:scale-105 sm:left-6"
      >
        {open ? <X className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
      </button>
    </>
  );
}

export function EngagementWidgets({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [rewardsOpen, setRewardsOpen] = React.useState(false);
  const [promoOpen, setPromoOpen] = React.useState(false);

  // Show the welcome offer once, a few seconds after the first visit (never on checkout).
  React.useEffect(() => {
    if (pathname?.startsWith("/checkout")) return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage unavailable: show it, it just won't be remembered */
    }
    if (seen) return;
    const t = window.setTimeout(() => setPromoOpen(true), 6000);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const closePromo = React.useCallback(() => {
    setPromoOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      <WelcomePopup show={promoOpen && !chatOpen} onClose={closePromo} />
      <WhatsAppChat
        whatsappNumber={whatsappNumber}
        open={chatOpen}
        setOpen={(v) => {
          setChatOpen(v);
          if (v) setPromoOpen(false);
        }}
      />
      <RewardsPanel whatsappNumber={whatsappNumber} open={rewardsOpen} setOpen={setRewardsOpen} />
    </>
  );
}
