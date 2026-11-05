import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import ArrowFillButton from "@/components/ui/arrow-fill-button";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Formulaire de contact branché sur EmailJS (https://www.emailjs.com), via son API REST.
 * Deux e-mails partent à chaque envoi : le message pour toi (modèle « Contact us ») puis l'accusé
 * de réception pour la personne (modèle « Réponse automatique »). Les modèles sont dans
 * /emailjs/templates.html. Variables à définir dans .env (voir .env.example).
 * Sans configuration, le formulaire ouvre le client mail (mailto:) pré-rempli.
 */
const SERVICE_ID = "service_aetdzq2";
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

type Status = "idle" | "sending" | "sent" | "error" | "mailto";

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
      const body = `${message}

— ${name} (${email})`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Message de ${name} via le portfolio`)}&body=${encodeURIComponent(body)}`;
      setStatus("mailto");
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
    } catch {
      setStatus("error");
    }
  };

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
          {status === "sent" && "Message envoyé, merci ! Je te réponds vite."}
          {status === "error" &&
            "L'envoi a échoué. Réessaie, ou écris-moi directement par email."}
          {status === "mailto" &&
            "Ton application mail s'ouvre avec le message pré-rempli."}
        </p>
      </div>
    </form>
  );
}
