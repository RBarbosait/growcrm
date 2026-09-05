"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Image as ImageIcon,
  Mail,
  Upload,
} from "lucide-react";

export default function InvitacionesPage() {
  const [title, setTitle] = useState("Te invitamos a ser parte del club");
  const [description, setDescription] = useState(
    "Completá tu registro para formar parte de nuestra comunidad y acceder a todos los beneficios del club."
  );
  const [buttonText, setButtonText] = useState("Unirme al club");

  const [image, setImage] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
const [recipients, setRecipients] = useState("");

  const invitationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invitacion/demo`
      : "/invitacion/demo";

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleLogoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setLogo(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Sin backend ni cambios adicionales.
    }
  };

const handleEmail = () => {
  setShowEmailForm(true);
};

const handleSendEmail = async () => {
  const emailList = recipients
    .split(/[,;\n]+/)
    .map((email) => email.trim())
    .filter(Boolean);

  if (emailList.length === 0) {
    alert("Ingresá al menos un destinatario.");
    return;
  }

  const API_URL =
    "https://growcrm-api-production.up.railway.app";

  try {
    const response = await fetch(`${API_URL}/invitations/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipients: emailList,
        subject: title,
        message: description,
        invitationUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "No se pudo enviar la invitación"
      );
    }

    setShowEmailForm(false);
    setRecipients("");

    alert("Invitación enviada ✅");
  } catch (error) {
    console.error("SEND INVITATION ERROR:", error);

    alert("No se pudo enviar la invitación.");
  }
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
              Diseñá el mensaje que recibirán las personas invitadas al club.
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
                Esta información también será utilizada en la landing de
                invitación.
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
                  rows={5}
                  placeholder="Escribí el mensaje que verá la persona invitada..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:ring-2 focus:ring-[#007f63]/10"
                />
              </div>

              {/* IMAGEN PRINCIPAL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Imagen
                </label>

                <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                  {image ? (
                    <div className="relative">
                      <img
                        src={image}
                        alt="Imagen de invitación"
                        className="h-56 w-full object-cover"
                      />

                      <label className="absolute bottom-4 right-4 cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md transition hover:bg-gray-50">
                        Cambiar imagen

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center px-6 py-12 text-center transition hover:bg-gray-100">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#007f63] shadow-sm">
                        <ImageIcon size={22} />
                      </div>

                      <span className="text-sm font-semibold text-gray-700">
                        Subir imagen
                      </span>

                      <span className="mt-1 text-xs text-gray-400">
                        PNG, JPG o WEBP
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* LOGO DEL CLUB */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Logo del club
                </label>

                <p className="mb-3 text-xs leading-5 text-gray-500">
                  El logo aparecerá centrado sobre la imagen de la invitación.
                </p>

                <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                  {logo ? (
                    <div className="relative flex items-center justify-center px-6 py-8">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                        <img
                          src={logo}
                          alt="Logo del club"
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <label className="absolute bottom-4 right-4 cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md transition hover:bg-gray-50">
                        Cambiar logo

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center px-6 py-10 text-center transition hover:bg-gray-100">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#007f63] shadow-sm">
                        <Upload size={22} />
                      </div>

                      <span className="text-sm font-semibold text-gray-700">
                        Subir logo del club
                      </span>

                      <span className="mt-1 text-xs text-gray-400">
                        PNG, JPG o WEBP
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
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
            </div>
          </section>

          {/* PREVIEW */}
          <section>
            <div className="mb-3">
              <h2 className="text-lg font-bold text-[#092f35]">
                Vista previa
              </h2>

              <p className="text-sm text-gray-500">
                Así verá la invitación el socio.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              {/* IMAGE + LOGO */}
              <div className="relative h-52 bg-[#e8f7f3]">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-[#007f63]">
                    <ImageIcon size={32} strokeWidth={1.5} />

                    <span className="mt-2 text-sm font-medium">
                      Imagen de invitación
                    </span>
                  </div>
                )}

                {/* LOGO CENTRADO SOBRE LA IMAGEN */}
                {logo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                      <img
                        src={logo}
                        alt="Logo del club"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-7">
                <div className="mb-4 inline-flex rounded-full bg-[#e6f5f0] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#007f63]">
                  Invitación
                </div>

                <h3 className="text-2xl font-bold leading-tight text-[#092f35]">
                  {title || "Título de la invitación"}
                </h3>

                <p className="mt-4 text-sm leading-6 text-gray-600">
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

            {/* ACTIONS */}
{/* ACTIONS */}
<div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
  <h3 className="text-sm font-bold text-[#092f35]">
    Enviar invitación
  </h3>

  <p className="mt-1 text-xs leading-5 text-gray-500">
    Podés enviarla por correo o copiar el enlace para compartirlo
    por WhatsApp o cualquier otro medio.
  </p>

  {!showEmailForm ? (
    <div className="mt-4 grid gap-3">
      <button
        type="button"
        onClick={handleEmail}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        <Mail size={18} />
        Enviar por correo
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006b55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#005c49]"
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
          placeholder={`Ej.
juan@gmail.com
pedro@gmail.com`}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:ring-2 focus:ring-[#007f63]/10"
        />

        <p className="mt-2 text-xs text-gray-400">
          Podés ingresar varios correos separados por coma, punto y coma o
          salto de línea.
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
          onClick={handleSendEmail}
          disabled={!recipients.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#006b55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#005c49] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Mail size={18} />
          Enviar invitación
        </button>
      </div>
    </div>
  )}
</div>

            {/* INFO */}
            <div className="mt-4 rounded-2xl bg-[#eef8f5] p-4">
              <div className="flex gap-3">
                <Upload
                  size={18}
                  className="mt-0.5 shrink-0 text-[#007f63]"
                />

                <p className="text-xs leading-5 text-[#27665a]">
                  El enlace es actualmente de demostración. La generación y
                  validación real de invitaciones se conectará posteriormente
                  sin modificar esta interfaz.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}