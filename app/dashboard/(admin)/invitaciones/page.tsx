"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app";

const PUBLIC_APP_URL = "https://growcrm-club.pages.dev";

import {
  ArrowLeft,
  Check,
  Copy,
  Mail,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

export default function InvitacionesPage() {
  const [title, setTitle] = useState(
    "¡Nos encantaría que te sumes al club!"
  );

  const [description, setDescription] = useState(
    "Queremos invitarte a formar parte de nuestra comunidad. Completá tu solicitud de ingreso y la administración del club la revisará. Te avisaremos cuando esté aprobada."
  );

  const [buttonText, setButtonText] = useState(
    "Unirme al club"
  );

  const [copied, setCopied] = useState(false);
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  
  const [recipients, setRecipients] = useState("");
  const [shareError, setShareError] = useState("");

  const parsedRecipients = recipients
    .split(/[,;\n]+/)
    .map((email) => email.trim())
    .filter(Boolean);
  const recipientEmails = Array.from(new Set(parsedRecipients.map((email) => email.toLowerCase())));
  const invalidRecipients = recipientEmails.filter(
    (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
  const validRecipients = recipientEmails.filter(
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

const [clubId, setClubId] = useState<string | null>(null);

useEffect(() => {
  const storedClubId = localStorage.getItem(
    "growcrm_active_club_id"
  );

  if (!storedClubId) return;

  setClubId(storedClubId);

  async function loadClubDetails() {
    const response = await fetch(`${API_URL}/club/${storedClubId}/invitation-info`);
    if (!response.ok) return;

    const club = await response.json() as { id: string; name: string; description?: string | null; template?: { name?: string; slug?: string } };
    setClubName(club.name);
    setClubDescription(club.description?.trim() || "");
    setTitle(`¡${club.name} te invita a sumarte!`);
    setDescription(`Desde ${club.name} queremos invitarte a formar parte de nuestra comunidad. Nos encantará recibir tu solicitud.`);
  }

  void loadClubDetails().catch((error) => console.warn("No se pudieron cargar los datos del club para la invitación:", error));
}, []);

const invitationUrl = clubId
  ? `${PUBLIC_APP_URL}/invitacion/demo?clubId=${encodeURIComponent(clubId)}`
  : "";

  const handleCopy = async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setShareError("");
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // No hacemos nada si el navegador bloquea el portapapeles.
    }
  };



  const handleOpenGmail = () => {
    if (validRecipients.length === 0) {
      setShareError("Ingresá al menos un correo válido para continuar.");
      return;
    }
    if (invalidRecipients.length > 0) {
      setShareError(`Revisá estos correos: ${invalidRecipients.join(", ")}`);
      return;
    }
    if (!invitationUrl) {
      setShareError("No encontramos un club activo para generar la invitación.");
      return;
    }

    const name = clubName || "el club";
    const subject = title || `¡${name} te invita a sumarte!`;
    const recipientField = validRecipients.length === 1
      ? `&to=${encodeURIComponent(validRecipients[0])}`
      : `&bcc=${encodeURIComponent(validRecipients.join(","))}`;

    const body = `Hola,

${description}
${clubDescription ? `\nUn poco sobre ${name}:\n${clubDescription}\n` : ""}
Tu invitación a ${name}:

Para empezar, completá tu solicitud desde este enlace:
${invitationUrl}

El equipo de ${name} revisará tu solicitud y te avisará cuando tu ingreso quede aprobado.

Si tenés alguna pregunta, respondé a este correo.

¡Nos encantará recibirte!
${name}`;

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      recipientField +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    const gmailWindow = window.open(gmailUrl, "_blank");
    if (!gmailWindow) {
      setShareError("El navegador bloqueó la ventana de Gmail. Permití ventanas emergentes para continuar.");
      return;
    }

    setShareError("");
    setRecipients("");
  };

  const handleOpenWhatsApp = () => {
    if (!invitationUrl) return;
    const message = `¡Hola! 👋 Desde ${clubName || "nuestro club"} queremos invitarte a sumarte a nuestra comunidad. Completá tu solicitud acá: ${invitationUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <p className="text-sm font-semibold text-[#007f63]">
              Comunicación
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#092f35]">
              Invitar socios
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Prepará el mensaje, revisá cómo se verá y elegí cómo compartirlo.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:flex">
            <Sparkles size={15} /> Invitación del club
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">

          {/* EDITOR */}
          <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            <div className="mb-7">
              <h2 className="text-lg font-bold text-[#092f35]">
                1. Personalizá el mensaje
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Estos textos se usan en el correo que prepares desde Gmail.
              </p>
            </div>

            <div className="space-y-6">

              {/* TITULO */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Título
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Te invitamos a ser parte del club"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:ring-2 focus:ring-[#007f63]/10"
                />
              </div>

              {/* TEXTO */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Texto
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Escribí el mensaje que recibirá la persona invitada..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:ring-2 focus:ring-[#007f63]/10"
                />
              </div>

              {/* TEXTO BOTON */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Texto del botón
                </label>

                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Ej. Unirme al club"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:ring-2 focus:ring-[#007f63]/10"
                />
              </div>

              {/* ENLACE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Enlace de invitación
                </label>

                <div className="flex gap-2">
                  <div className="flex-1 truncate rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    {invitationUrl}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!invitationUrl}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copied ? (
                      <>
                        <Check size={17} />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={17} />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* PREVIEW */}
          <section>

            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#007f63]">Paso 2</p>
              <h2 className="mt-1 text-lg font-bold text-[#092f35]">Vista previa</h2>
              <p className="text-sm text-gray-500">Así quedará el correo antes de abrirlo en Gmail.</p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">

              {/* CONTENT */}
              <div className="bg-gradient-to-br from-[#f1faf6] via-white to-[#fffdf8] p-7">

                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#006b55] text-white"><Sparkles size={17} /></span>
                  <span className="inline-flex rounded-full bg-[#e6f5f0] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#007f63]">
                    {clubName ? `Una invitación de ${clubName}` : "Invitación del club"}
                  </span>
                </div>

                <h3 className="text-2xl font-bold leading-tight text-[#092f35]">
                  {title || "Título de la invitación"}
                </h3>

                <p className="mt-5 text-sm font-semibold text-[#092f35]">Hola,</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {description || "Texto de la invitación..."}
                </p>

                {clubDescription && (
                  <div className="mt-5 rounded-2xl border border-emerald-100 bg-white/80 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#007f63]">Un poco sobre el club</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{clubDescription}</p>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-emerald-100 bg-white/80 p-4">
                  <p className="text-xs leading-5 text-gray-500">La administración del club revisará tu solicitud y te avisará cuando quede aprobada.</p>
                  <p className="mt-3 text-sm font-bold text-[#006b55]">{buttonText || "Unirme al club"} →</p>
                </div>
                <p className="mt-5 text-sm leading-6 text-gray-600">¡Ojalá te sumes!<br />Con cariño,<br /><strong>{clubName || "El equipo del club"}</strong></p>

              </div>

            </div>

{/* COMPARTIR */}
<div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#007f63]">Paso 3</p>
      <h3 className="mt-1 text-base font-bold text-[#092f35]">Compartí la invitación</h3>
    </div>
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f8f5] text-[#007f63]"><Users size={17} /></span>
  </div>
  <p className="mt-2 text-xs leading-5 text-gray-500">Prepará el correo desde Gmail o compartí el enlace por WhatsApp.</p>

  <div className="mt-5">

    <div className="mb-4">

      <label className="mb-2 block text-sm font-semibold text-gray-700">
        Destinatarios <span className="font-normal text-gray-400">{validRecipients.length === 1 ? "(un destinatario)" : "(en copia oculta si son varios)"}</span>
      </label>

      <textarea
        value={recipients}
        onChange={(e) => { setRecipients(e.target.value); setShareError(""); }}
        rows={4}
        placeholder={`Ej.
juan@gmail.com
pedro@gmail.com`}
        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:ring-2 focus:ring-[#007f63]/10"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="text-gray-400">Separá varios correos con coma, punto y coma o salto de línea.</p>
        <p className={`font-semibold ${invalidRecipients.length ? "text-red-600" : "text-gray-500"}`}>
          {parsedRecipients.length === 0 ? "Sin destinatarios" : `${validRecipients.length} ${validRecipients.length === 1 ? "destinatario válido" : "destinatarios válidos"}`}
          {invalidRecipients.length > 0 ? ` · ${invalidRecipients.length} inválido${invalidRecipients.length > 1 ? "s" : ""}` : ""}
        </p>
      </div>
      {invalidRecipients.length > 0 && <p className="mt-2 text-xs leading-5 text-red-600">Revisá: {invalidRecipients.join(", ")}</p>}
      {shareError && <p role="alert" className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{shareError}</p>}

    </div>

    <div className="flex gap-3">

      <button
        type="button"
        onClick={() => { setRecipients(""); setShareError(""); }}
        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
      >
        Cancelar
      </button>

      <button
        type="button"
        onClick={handleOpenGmail}
        disabled={!validRecipients.length || invalidRecipients.length > 0 || !invitationUrl}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#006b55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#005c49] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Mail size={18} />
        Abrir Gmail
      </button>

    </div>

    <button
      type="button"
      onClick={handleOpenWhatsApp}
      disabled={!invitationUrl}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <MessageCircle size={17} />
      Compartir por WhatsApp
    </button>

    <button
      type="button"
      onClick={handleCopy}
      disabled={!invitationUrl}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copied ? (
        <>
          <Check size={18} />
          Enlace copiado
        </>
      ) : (
        <>
          <Copy size={18} />
          Copiar enlace
        </>
      )}
    </button>

  </div>

</div>

            {/* INFO */}
            <div className="mt-4 rounded-2xl bg-[#eef8f5] p-4">

              <div className="flex gap-3">

                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-[#007f63]"
                />

                <p className="text-xs leading-5 text-[#27665a]">
                  El correo se abre desde tu Gmail con el enlace público de GrowCRM. Si invitás a varias personas, sus direcciones quedan en copia oculta. Revisá el borrador y pulsá Enviar.
                </p>

              </div>

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}