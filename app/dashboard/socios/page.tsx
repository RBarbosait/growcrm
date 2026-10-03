"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Search,
  UserPlus,
  MoreHorizontal,
  Mail,
  Phone,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
  Check,
  X,
} from "lucide-react";
import { WaitOverlay } from "@/components/ui/wait-overlay";

const memberLoadingMessages = [
  "Estamos cargando la información del club...",
  "Consultando socios y solicitudes...",
  "Actualizando la lista de miembros...",
];

const approvalLoadingMessages = [
  "Enviando la aprobación al servidor...",
  "Asociando el usuario al club...",
  "Preparando el correo de bienvenida...",
];

const memberActionLoadingMessages = [
  "Guardando los cambios del socio...",
  "Actualizando la información del club...",
];

type MembershipRequest = {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string | null;
  name: string;
  email: string;
  phone: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

type Member = {
  id: string;
  userId: string;
  clubId: string;
  role: string;
  active: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
};

type Socio = {
  id: string;
  nombre: string;
  email: string;
  phone: string | null;
  estado: "Activo" | "Desactivado";
  ingreso: string;
  reservas: number;
};

const API_URL =
  "https://growcrm-api-production.up.railway.app";

export default function SociosPage() {
const [requests, setRequests] = useState<MembershipRequest[]>([]);
const [members, setMembers] = useState<Member[]>([]);
const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
const [activeTab, setActiveTab] = useState<
  "active" | "pending" | "inactive" | "rejected"
>("active");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [memberActionId, setMemberActionId] = useState<string | null>(null);

const [editingMember, setEditingMember] = useState<Member | null>(null);

const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editPhone, setEditPhone] = useState("");
const [savingMember, setSavingMember] = useState(false);
const [gmailDraftUrl, setGmailDraftUrl] = useState<string | null>(null);

  /*
   * Por ahora usamos el club guardado por el dashboard.
   * Si tu dashboard ya utiliza otra clave, cambiá solamente esta línea.
   */
const [clubId, setClubId] = useState<string | null>(null);

useEffect(() => {
  const storedClubId = localStorage.getItem("growcrm_active_club_id");
  setClubId(storedClubId);
}, []);

async function loadData() {
  if (!clubId) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    const [requestsResponse, membersResponse] = await Promise.all([
      fetch(
        `${API_URL}/club/${clubId}/membership-requests`
      ),
      fetch(
        `${API_URL}/club/${clubId}/members`
      ),
    ]);

    if (!requestsResponse.ok) {
      throw new Error("No se pudieron cargar las solicitudes");
    }

    if (!membersResponse.ok) {
      throw new Error("No se pudieron cargar los socios");
    }

    const requestsData = await requestsResponse.json();
    const membersData = await membersResponse.json();

    setRequests(
      Array.isArray(requestsData) ? requestsData : []
    );

    setMembers(
      Array.isArray(membersData) ? membersData : []
    );
  } catch (error) {
    console.error("GET SOCIOS DATA ERROR:", error);
    setRequests([]);
    setMembers([]);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  loadData();
}, [clubId]);

  async function updateRequest(
    id: string,
    action: "approve" | "reject"
  ) {
    let gmailTab: Window | null = null;

    try {
      setProcessingId(id);
      setGmailDraftUrl(null);

      if (action === "approve") {
        // Reservamos la pestaña desde el clic para que Chrome permita abrir Gmail
        // tras la respuesta de la API. La pestaña muestra estado, nunca queda vacía.
        gmailTab = window.open("about:blank", "_blank");
        if (gmailTab) {
          gmailTab.document.open();
          gmailTab.document.write(`<!doctype html>
            <html lang="es">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Aprobando socio | GrowCRM</title>
                <style>
                  * { box-sizing: border-box; }
                  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f5faf8; color: #092f35; font-family: Arial, sans-serif; }
                  main { width: min(100%, 390px); padding: 32px; border: 1px solid #dcebe6; border-radius: 24px; background: white; text-align: center; box-shadow: 0 18px 50px #092f3518; }
                  .spinner { width: 42px; height: 42px; margin: 0 auto 20px; border: 4px solid #e6f5f0; border-top-color: #007f63; border-radius: 50%; animation: spin .8s linear infinite; }
                  .track { height: 7px; margin-top: 24px; overflow: hidden; border-radius: 99px; background: #e6f5f0; }
                  .bar { width: 40%; height: 100%; border-radius: inherit; background: #007f63; animation: slide 1.2s ease-in-out infinite alternate; }
                  p { margin: 0; color: #647570; font-size: 14px; line-height: 1.6; }
                  h1 { margin: 0 0 8px; font-size: 20px; }
                  @keyframes spin { to { transform: rotate(360deg); } }
                  @keyframes slide { from { transform: translateX(-15%); } to { transform: translateX(160%); } }
                </style>
              </head>
              <body>
                <main>
                  <div class="spinner" aria-hidden="true"></div>
                  <h1>Confirmando aprobación</h1>
                  <p>Estamos esperando la respuesta del servidor. Gmail se abrirá cuando la aprobación esté confirmada.</p>
                  <div class="track" role="progressbar" aria-label="Aprobación en curso"><div class="bar"></div></div>
                </main>
              </body>
            </html>`);
          gmailTab.document.close();
        }
      }

      const response = await fetch(
        `${API_URL}/membership-request/${id}/${action}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar la solicitud");
      }

      const result = await response.json();

      if (action === "approve") {
        const approvedRequest = result.request;
        const clubName = approvedRequest.club?.name || "el club";
        const loginUrl = "https://growcrm-club.pages.dev/auth/login";

        const subject = `¡Tu ingreso a ${clubName} fue aprobado!`;
        const body = `Hola ${approvedRequest.name},

Tu ingreso a ${clubName} fue aprobado. Tu usuario ya está asociado al club y podés acceder para comenzar a disfrutar tu membresía:

${loginUrl}

Ingresá con tu email y la contraseña que elegiste al registrarte.

¡Te damos la bienvenida!`;

        const gmailUrl =
          `https://mail.google.com/mail/?view=cm&fs=1` +
          `&to=${encodeURIComponent(approvedRequest.email)}` +
          `&su=${encodeURIComponent(subject)}` +
          `&body=${encodeURIComponent(body)}`;

        if (gmailTab && !gmailTab.closed) {
          gmailTab.location.href = gmailUrl;
        } else {
          // Respaldo si el navegador bloqueó la pestaña emergente.
          setGmailDraftUrl(gmailUrl);
        }
      }

      setRequests((current) =>
        current.filter((request) => request.id !== id)
      );
      void loadData();
    } catch (error) {
      if (gmailTab && !gmailTab.closed) gmailTab.close();
      console.error("MEMBERSHIP REQUEST UPDATE ERROR:", error);
      alert("No se pudo actualizar la solicitud.");
    } finally {
      setProcessingId(null);
    }
  }
async function toggleMember(member: Member) {
  try {
    setMemberActionId(member.id);

    const response = await fetch(
      `${API_URL}/club-member/${member.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !member.active,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo cambiar el estado del socio");
    }

    await loadData();
  } catch (error) {
    console.error("MEMBER STATUS ERROR:", error);
    alert("No se pudo cambiar el estado del socio.");
  } finally {
    setMemberActionId(null);
  }
}

async function deleteMember(member: Member) {
  const confirmed = window.confirm(
    `¿Seguro que querés eliminar a ${member.user.name || member.user.email} del club?`
  );

  if (!confirmed) return;

  try {
    setMemberActionId(member.id);

    const response = await fetch(
      `${API_URL}/club-member/${member.id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo eliminar el socio");
    }

    await loadData();
  } catch (error) {
    console.error("DELETE MEMBER ERROR:", error);
    alert("No se pudo eliminar el socio.");
  } finally {
    setMemberActionId(null);
  }
}

function openEditMember(member: Member) {
  setEditingMember(member);
  setEditName(member.user.name || "");
  setEditEmail(member.user.email);
  setEditPhone(member.user.phone || "");
}

function closeEditMember() {
  if (savingMember) return;

  setEditingMember(null);
  setEditName("");
  setEditEmail("");
  setEditPhone("");
}

async function saveMember() {
  if (!editingMember) return;

  if (!editName.trim() || !editEmail.trim()) {
    alert("Nombre y email son obligatorios.");
    return;
  }

  try {
    setSavingMember(true);

    const response = await fetch(
      `${API_URL}/club-member/${editingMember.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.error || "No se pudo actualizar el socio"
      );
    }

    await loadData();
    closeEditMember();
  } catch (error) {
    console.error("UPDATE MEMBER ERROR:", error);

    alert(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el socio."
    );
  } finally {
    setSavingMember(false);
  }
}

  const pending = requests.filter(
    (request) => request.status === "pending"
  );

  const rejected = requests.filter(
    (request) => request.status === "rejected"
  );

const activeMembers = members.filter(
  (member) => member.active
);

const inactiveMembers = members.filter(
  (member) => !member.active
);

const socios: Socio[] = members.map((member) => ({
  id: member.id,
  nombre: member.user.name || "Sin nombre",
  email: member.user.email,
  phone: member.user.phone,
  estado: member.active ? "Activo" : "Desactivado",
  ingreso: "—",
  reservas: 0,
}));

const filteredSocios = useMemo(() => {
  const value = search.trim().toLowerCase();

  const source =
    activeTab === "inactive"
      ? inactiveMembers
      : activeMembers;

  const sociosForTab: Socio[] = source.map((member) => ({
    id: member.id,
    nombre: member.user.name || "Sin nombre",
    email: member.user.email,
    phone: member.user.phone,
    estado: member.active ? "Activo" : "Desactivado",
    ingreso: "—",
    reservas: 0,
  }));

  if (!value) return sociosForTab;

  return sociosForTab.filter(
    (socio) =>
      socio.nombre.toLowerCase().includes(value) ||
      socio.email.toLowerCase().includes(value)
  );
}, [activeMembers, inactiveMembers, activeTab, search]);
const filteredPending = useMemo(() => {
  const value = search.trim().toLowerCase();

  if (!value) return pending;

  return pending.filter(
    (request) =>
      request.name.toLowerCase().includes(value) ||
      request.email.toLowerCase().includes(value) ||
      request.phone?.toLowerCase().includes(value)
  );
}, [pending, search]);
  const filteredRejected = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return rejected;

    return rejected.filter(
      (request) =>
        request.user.name?.toLowerCase().includes(value) ||
        request.user.email.toLowerCase().includes(value)
    );
  }, [rejected, search]);

  return (
    <>
    <WaitOverlay
      open={loading || Boolean(processingId) || Boolean(memberActionId) || savingMember}
      messages={
        loading
          ? memberLoadingMessages
          : processingId
            ? approvalLoadingMessages
            : memberActionLoadingMessages
      }
      label={processingId ? "Aprobando solicitud de socio" : "Actualizando socios"}
    />
    <main className="min-h-screen bg-[#f8faf9]">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <p className="text-sm font-semibold text-[#007f63]">
                Gestión de socios
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#092f35]">
                Socios
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Administrá los socios, sus datos y actividad dentro del club.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/dashboard/invitaciones";
            }}
            className="flex items-center gap-2 rounded-xl bg-[#006b58] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#005a4b]"
          >
            <UserPlus size={18} />
            Invitar socio
          </button>
        </div>

        {gmailDraftUrl && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[#092f35]">
                Aprobación confirmada por el servidor
              </p>
              <p className="mt-1 text-sm text-gray-600">
                El socio ya está asociado al club. Podés abrir el borrador de bienvenida en Gmail.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.open(gmailDraftUrl, "_blank", "noopener,noreferrer");
                  setGmailDraftUrl(null);
                }}
                className="rounded-xl bg-[#006b58] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005a4b]"
              >
                Abrir borrador en Gmail
              </button>
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={() => setGmailDraftUrl(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/70"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* MÉTRICAS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MetricCard
            icon={<Users size={20} />}
            iconClass="bg-[#e8f7f2] text-[#007f63]"
            label="Total"
            value={members.length}
            description="Socios registrados"
          />

          <MetricCard
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Estado"
            value={activeMembers.length}
            description="Socios activos"
          />

          <MetricCard
            icon={<Clock3 size={20} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Pendientes"
            value={pending.length}
            description="Solicitudes de ingreso"
            onClick={() => setActiveTab("pending")}
          />

          <MetricCard
            icon={<CalendarDays size={20} />}
            iconClass="bg-sky-50 text-sky-700"
            label="Actividad"
            value="—"
            description="Reservas realizadas"
          />

        </div>

        {/* LISTADO */}
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          {/* CABECERA */}
          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex flex-col gap-5">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#092f35]">
                    {activeTab === "active"
  ? "Socios activos"
  : activeTab === "pending"
    ? "Solicitudes pendientes"
    : activeTab === "inactive"
      ? "Socios desactivados"
      : "Solicitudes rechazadas"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === "active"
  ? "Socios que forman parte actualmente del club."
  : activeTab === "pending"
    ? "Personas que solicitaron ingresar al club."
    : activeTab === "inactive"
      ? "Socios que fueron desactivados temporalmente."
      : "Solicitudes que fueron rechazadas."}
                  </p>
                </div>

                {/* BUSCADOR */}
                <div className="relative w-full lg:w-[360px]">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:bg-white"
                  />
                </div>
              </div>

              {/* TABS */}
<div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 w-fit">

  <Tab
    active={activeTab === "active"}
    onClick={() => setActiveTab("active")}
    icon={<Users size={15} />}
    label="Activos"
    count={activeMembers.length}
  />

  <Tab
    active={activeTab === "pending"}
    onClick={() => setActiveTab("pending")}
    icon={<Clock3 size={15} />}
    label="Pendientes"
    count={pending.length}
    notification={pending.length > 0}
  />

  <Tab
    active={activeTab === "inactive"}
    onClick={() => setActiveTab("inactive")}
    icon={<XCircle size={15} />}
    label="Desactivados"
    count={inactiveMembers.length}
  />

  <Tab
    active={activeTab === "rejected"}
    onClick={() => setActiveTab("rejected")}
    icon={<XCircle size={15} />}
    label="Rechazados"
    count={rejected.length}
  />

</div>

            </div>
          </div>

          {/* CONTENIDO */}

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="text-sm text-gray-400">Cargando socios...</div>
            </div>
          ) : !clubId ? (
            <div className="flex min-h-[280px] items-center justify-center px-6 text-center">
              <div>
                <p className="font-semibold text-[#092f35]">
                  No se encontró el club
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  No hay un club seleccionado en el dashboard.
                </p>
              </div>
            </div>
          ) : activeTab === "active" || activeTab === "inactive" ? (
  <ActiveMembers
    socios={filteredSocios}
    members={
      activeTab === "inactive"
        ? inactiveMembers
        : activeMembers
    }
    onEdit={openEditMember}
    onToggle={toggleMember}
    onDelete={deleteMember}
    processingId={memberActionId}
  />
) : activeTab === "pending" ? (
            <PendingRequests
              requests={filteredPending}
              processingId={processingId}
              onApprove={(id) =>
                updateRequest(id, "approve")
              }
              onReject={(id) =>
                updateRequest(id, "reject")
              }
            />
          ) : (
            <RejectedRequests requests={filteredRejected} />
          )}

        </section>

        {/* FOOTER */}
        <footer className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-center text-xs text-gray-400">
            GrowCRM · Gestión inteligente para clubes
          </p>
        </footer>

      </div>
      <EditMemberModal
  member={editingMember}
  name={editName}
  email={editEmail}
  phone={editPhone}
  setName={setEditName}
  setEmail={setEditEmail}
  setPhone={setEditPhone}
  saving={savingMember}
  onClose={closeEditMember}
  onSave={saveMember}
/>
    </main>
    </>
  );
}
function EditMemberModal({
  member,
  name,
  email,
  phone,
  setName,
  setEmail,
  setPhone,
  saving,
  onClose,
  onSave,
}: {
  member: Member | null;
  name: string;
  email: string;
  phone: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl">

        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-bold text-[#092f35]">
            Editar socio
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Modificá los datos del socio.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Nombre
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#007f63]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#007f63]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Teléfono
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#007f63]"
            />
          </div>

          <p className="text-xs text-gray-400">
            La contraseña del socio no puede ser visualizada ni modificada desde administración.
          </p>

        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="rounded-xl bg-[#006b58] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#005a4b] disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

        </div>

      </div>
    </div>
  );
}
/* ========================= */
/* COMPONENTES */
/* ========================= */

function MetricCard({
  icon,
  iconClass,
  label,
  value,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: number | string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm ${
        onClick
          ? "cursor-pointer transition hover:border-amber-200 hover:shadow-md"
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-gray-400">
          {label}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-[#092f35]">
        {value}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </button>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
  count,
  notification,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  notification?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-white text-[#006b58] shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}

      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active
            ? "bg-[#e8f7f2] text-[#007f63]"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {count}
      </span>

      {notification && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
      )}
    </button>
  );
}

function ActiveMembers({
  socios,
  members,
  onEdit,
  onToggle,
  onDelete,
  processingId,
}: {
  socios: Socio[];
  members: Member[];
  onEdit: (member: Member) => void;
  onToggle: (member: Member) => void;
  onDelete: (member: Member) => void;
  processingId: string | null;
}) {
  const [openMenu, setOpenMenu] = useState<{
    memberId: string;
    top: number;
    left: number;
  } | null>(null);

  if (socios.length === 0) {
    return (
      <EmptyState
        icon={<Users size={24} />}
        title="No hay socios en esta sección"
        description="Los socios aparecerán acá según su estado."
      />
  );
}

  const memberById = new Map(
    members.map((member) => [member.id, member])
  );
  const menuMember = openMenu
    ? memberById.get(openMenu.memberId)
    : undefined;

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px]">

        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left">

            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Socio
            </th>

            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Contacto
            </th>

            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Estado
            </th>

            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Ingreso
            </th>

            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Reservas
            </th>

            <th className="w-16 px-6 py-4" />

          </tr>
        </thead>

        <tbody>
          {socios.map((socio) => {
            const member = memberById.get(socio.id);

            if (!member) return null;

            return (
              <tr
                key={socio.id}
                className="group border-b border-gray-100 last:border-0 transition hover:bg-gray-50/60"
              >

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dff4ed] text-sm font-bold text-[#007f63]">
                      {getInitials(socio.nombre)}
                    </div>

                    <div>
                      <p className="font-semibold text-[#092f35]">
                        {socio.nombre}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Socio
                      </p>
                    </div>

                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="space-y-1">

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      {socio.email}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Phone size={13} />
                      {socio.phone || "No disponible"}
                    </div>

                  </div>
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      socio.estado === "Activo"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        socio.estado === "Activo"
                          ? "bg-emerald-500"
                          : "bg-gray-400"
                      }`}
                    />
                    {socio.estado}
                  </span>
                </td>

                <td className="px-6 py-5 text-sm text-gray-600">
                  {socio.ingreso}
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#092f35]">
                      {socio.reservas}
                    </span>

                    <span className="text-xs text-gray-400">
                      reservas
                    </span>
                  </div>
                </td>

                <td className="relative px-6 py-5">
                  <div className="relative flex justify-end">
                    <button
                      type="button"
                      aria-label={`Opciones de ${socio.nombre}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenu?.memberId === member.id}
                      onClick={(event) => {
                        if (openMenu?.memberId === member.id) {
                          setOpenMenu(null);
                          return;
                        }

                        const rect = event.currentTarget.getBoundingClientRect();
                        const menuHeight = 144;
                        const menuWidth = 192;
                        const top = rect.bottom + menuHeight > window.innerHeight - 8
                          ? Math.max(8, rect.top - menuHeight - 8)
                          : rect.bottom + 8;
                        const left = Math.max(
                          8,
                          Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth)
                        );

                        setOpenMenu({ memberId: member.id, top, left });
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007f63]/30"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>

      </table>
    </div>
    {openMenu && menuMember && createPortal(
      <>
        <button
          type="button"
          aria-label="Cerrar opciones del socio"
          onClick={() => setOpenMenu(null)}
          className="fixed inset-0 z-[80] cursor-default bg-transparent"
        />
        <div
          role="menu"
          aria-label="Opciones del socio"
          style={{ top: openMenu.top, left: openMenu.left }}
          className="fixed z-[81] w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl shadow-[#092f35]/15"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpenMenu(null);
              onEdit(menuMember);
            }}
            className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Editar
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={processingId === menuMember.id}
            onClick={() => {
              setOpenMenu(null);
              onToggle(menuMember);
            }}
            className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {processingId === menuMember.id
              ? "Procesando..."
              : menuMember.active
                ? "Desactivar"
                : "Activar"}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={processingId === menuMember.id}
            onClick={() => {
              setOpenMenu(null);
              onDelete(menuMember);
            }}
            className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </>,
      document.body
    )}
    </>
  );
}

function PendingRequests({
  requests,
  processingId,
  onApprove,
  onReject,
}: {
  requests: MembershipRequest[];
  processingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 size={24} />}
        title="No hay solicitudes pendientes"
        description="Cuando alguien solicite ingresar al club, aparecerá acá."
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100">

      {requests.map((request) => (
        <div
          key={request.id}
          className="flex flex-col gap-5 px-6 py-5 transition hover:bg-gray-50/60 lg:flex-row lg:items-center lg:justify-between"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-700">
              {getInitials(request.name || request.email)}
            </div>

            <div>
              <p className="font-semibold text-[#092f35]">
                {request.name || "Sin nombre"}
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Mail size={14} />
                {request.email}
                </div>

                {request.phone && (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} />
                    {request.phone}
                </div>
                )}

              <p className="mt-1 text-xs text-gray-400">
                Solicitud recibida el {formatDate(request.createdAt)}
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={processingId === request.id}
              onClick={() => onReject(request.id)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={16} />
              Rechazar
            </button>

            <button
              type="button"
              disabled={processingId === request.id}
              onClick={() => onApprove(request.id)}
              className="flex items-center gap-2 rounded-xl bg-[#006b58] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005a4b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} />
              {processingId === request.id
                ? "Procesando..."
                : "Aceptar"}
            </button>

          </div>

        </div>
      ))}

    </div>
  );
}

function RejectedRequests({
  requests,
}: {
  requests: MembershipRequest[];
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<XCircle size={24} />}
        title="No hay solicitudes rechazadas"
        description="Las solicitudes rechazadas aparecerán acá."
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100">

      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between px-6 py-5 transition hover:bg-gray-50/60"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
              {getInitials(request.name || request.email)}
            </div>

            <div>
              <p className="font-semibold text-[#092f35]">
                {request.name || "Sin nombre"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {request.email}
              </p>

              {request.phone && (
                <p className="mt-1 text-xs text-gray-400">
                  {request.phone}
                </p>
              )}
            </div>

          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Rechazado
          </span>

        </div>
      ))}

    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[280px] items-center justify-center px-6 text-center">

      <div className="max-w-md">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f7f2] text-[#007f63]">
          {icon}
        </div>

        <h3 className="mt-4 font-semibold text-[#092f35]">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ========================= */
/* HELPERS */
/* ========================= */

function getInitials(value: string) {
  const words = value.trim().split(/\s+/);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
