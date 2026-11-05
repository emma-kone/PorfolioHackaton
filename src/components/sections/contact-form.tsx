import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import ArrowFillButton from "@/components/ui/arrow-fill-button";
import { cn } from "@/lib/utils";

/**
 * Formulaire de contact branché sur EmailJS (https://www.emailjs.com), via son API REST.
 * Deux e-mails partent à chaque envoi : le message pour toi (modèle « Contact us ») puis l'accusé
 * de réception pour la personne (modèle « Réponse automatique »). Les modèles sont dans
 * /emailjs/templates.html. Variables à définir dans .env (voir .env.example).
 * L'envoi est automatique : aucune application mail ne s'ouvre, la personne voit une confirmation.
 */
const SERVICE_ID =
  (import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined) || "service_aetdzq2";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as
  string | undefined;
const CONTACT_TEMPLATE = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE as
  string | undefined;
const REPLY_TEMPLATE = import.meta.env.VITE_EMAILJS_REPLY_TEMPLATE as
  string | undefined;

async function sendTemplate(
  templateId: string,
  params: Record<string, string>,
) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: templateId,
      user_id: PUBLIC_KEY,
      template_params: params,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full border-0 rounded-2xl border-0 bg-background/10 px-4 py-3 text-base text-background placeholder:text-background/45 focus:bg-background/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const submit = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (status !== "sending") formRef.current?.requestSubmit();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("botcheck")) return; // champ piège : les robots le remplissent

    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    if (!PUBLIC_KEY || !CONTACT_TEMPLATE) {
      console.error("EmailJS non configuré : définir VITE_EMAILJS_PUBLIC_KEY et VITE_EMAILJS_CONTACT_TEMPLATE.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    const params = {
      from_name: name,
      from_email: email,
      reply_to: email,
      message,
      time: new Date().toLocaleString("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      }),
    };
    try {
      await sendTemplate(CONTACT_TEMPLATE, params);
      // L'accusé de réception ne doit jamais faire échouer l'envoi du message principal.
      if (REPLY_TEMPLATE)
        await sendTemplate(REPLY_TEMPLATE, params).catch(() => undefined);
      form.reset();
      setStatus("sent");
    } catch (err) {
      console.error("Échec de l'envoi EmailJS :", err);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col items-start gap-4 rounded-3xl bg-background/10 p-8 text-background"
      >
        <CheckCircle2 className="size-12 text-accent" aria-hidden />
        <p className="display text-3xl">Message envoyé !</p>
        <p className="text-background/80">
          Merci, j'ai bien reçu ton message. Je te réponds très vite, et un e-mail de confirmation vient de t'être envoyé.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="link-draw tap text-sm text-background/80"
        >
          Envoyer un autre message
        </button>
      </motion.div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="space-y-6"
      noValidate={false}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="label !text-background/60">Nom</span>
          <input
            name="name"
            required
            autoComplete="name"
            className={field}
            placeholder="Ton nom"
          />
        </label>
        <label className="block">
          <span className="label !text-background/60">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
            placeholder="toi@exemple.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="label !text-background/60">Message</span>
        <textarea
          name="message"
          required
          rows={4}
          className={cn(field, "resize-y")}
          placeholder="Parle-moi de ton projet"
        />
      </label>
      <input
        type="text"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-4">
        <ArrowFillButton
          btnText={status === "sending" ? "Envoi…" : "Envoyer"}
          href="#contact"
          role="button"
          aria-disabled={status === "sending"}
          onClick={submit}
          bgColor="var(--background)"
          textColor="var(--foreground)"
          fillBgColor="var(--accent)"
          fillTextColor="var(--accent-foreground)"
          hoverFillBgColor="var(--accent)"
          hoverFillTextColor="var(--accent-foreground)"
        />
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-background/80"
        >
          {status === "sending" && "Envoi en cours…"}
          {status === "error" && (
            <span className="inline-flex items-center gap-2 text-rose-200">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              L'envoi a échoué. Réessaie dans un instant.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
