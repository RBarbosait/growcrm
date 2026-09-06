"use client";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Check,
  Copy,
  Mail,
} from "lucide-react";

export default function InvitacionesPage() {
  const [title, setTitle] = useState(
    "Te invitamos a ser parte del club"
  );

  const [description, setDescription] = useState(
    "Completá tu registro para formar parte de nuestra comunidad y acceder a todos los beneficios del club."
  );

  const [buttonText, setButtonText] = useState(
    "Unirme al club"
  );

  const [copied, setCopied] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [recipients, setRecipients] = useState("");

const [clubId, setClubId] = useState<string | null>(null);

useEffect(() => {
  const storedClubId = localStorage.getItem(
    "growcrm_active_club_id"
  );

  if (storedClubId) {
    setClubId(storedClubId);
  }
}, []);

const invitationUrl = clubId
  ? `${window.location.origin}/invitacion/demo?clubId=${encodeURIComponent(clubId)}`
  : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // No hacemos nada si el navegador bloquea el portapapeles.
    }
  };

  const handleEmail = () => {
    setShowEmailForm(true);
  };

  const handleOpenGmail = () => {
    const emailList = recipients
      .split(/[,;\n]+/)
      .map((email) => email.trim())
      .filter(Boolean);

    if (emailList.length === 0) {
      alert("Ingresá al menos un destinatario.");
      return;
    }

    const subject =
      title || "Te invitamos a ser parte del club";

    const body = `${description}

${buttonText || "Unirme al club"}:
${invitationUrl}

Te esperamos para formar parte del club.`;

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(emailList.join(","))}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank");

    setShowEmailForm(false);
    setRecipients("");
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
              Prepará la invitación que recibirán las personas que quieras sumar al club.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">

          {/* EDITOR */}
          <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            <div className="mb-7">
              <h2 className="text-lg font-bold text-[#092f35]">
                Diseñá tu invitación
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Personalizá el contenido que se utilizará para invitar a nuevos socios.
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
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
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
              <h2 className="text-lg font-bold text-[#092f35]">
                Vista previa
              </h2>

              <p className="text-sm text-gray-500">
                Así verá la invitación la persona invitada.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

              {/* CONTENT */}
              <div className="p-7">

                <div className="mb-4 inline-flex rounded-full bg-[#e6f5f0] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#007f63]">
                  Invitación
                </div>

                <h3 className="text-2xl font-bold leading-tight text-[#092f35]">
                  {title || "Título de la invitación"}
                </h3>

                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {description || "Texto de la invitación..."}
                </p>

                <button
                  type="button"
                  className="mt-7 w-full rounded-xl bg-[#006b55] px-5 py-3.5 text-sm font-bold text-white shadow-sm"
                >
                  {buttonText || "Unirme al club"}
                </button>

              </div>

            </div>

            {/* EMAIL */}
            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">

              <h3 className="text-sm font-bold text-[#092f35]">
                Compartir invitación
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Prepará el correo desde Gmail o copiá el enlace para compartirlo por WhatsApp u otro medio.
              </p>

              {!showEmailForm ? (
                <div className="mt-4 grid gap-3">

                  <button
                    type="button"
                    onClick={handleEmail}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006b55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#005c49]"
                  >
                    <Mail size={18} />
                    Abrir Gmail
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
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
              ) : (
                <div className="mt-5">

                  <div className="mb-4">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Destinatarios
                    </label>

                    <textarea
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      rows={4}
                      autoFocus
                      placeholder={`Ej.
juan@gmail.com
pedro@gmail.com`}
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:ring-2 focus:ring-[#007f63]/10"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Podés ingresar varios correos separados por coma, punto y coma o salto de línea.
                    </p>

                  </div>

                  <div className="flex gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailForm(false);
                        setRecipients("");
                      }}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenGmail}
                      disabled={!recipients.trim()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#006b55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#005c49] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Mail size={18} />
                      Abrir Gmail
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* INFO */}
            <div className="mt-4 rounded-2xl bg-[#eef8f5] p-4">

              <div className="flex gap-3">

                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-[#007f63]"
                />

                <p className="text-xs leading-5 text-[#27665a]">
                  Gmail se abrirá con los destinatarios, asunto, mensaje y enlace ya preparados. Solo tenés que revisar el correo y enviarlo.
                </p>

              </div>

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}