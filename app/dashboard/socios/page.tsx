"use client";

import { useEffect, useMemo, useState } from "react";
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

type MembershipRequest = {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Socio = {
  id: string;
  nombre: string;
  email: string;
  estado: "Activo";
  ingreso: string;
  reservas: number;
};

const API_URL =
  "https://growcrm-api-production.up.railway.app";

export default function SociosPage() {
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "active" | "pending" | "rejected"
  >("active");
  const [processingId, setProcessingId] = useState<string | null>(null);

  /*
   * Por ahora usamos el club guardado por el dashboard.
   * Si tu dashboard ya utiliza otra clave, cambiá solamente esta línea.
   */
const [clubId, setClubId] = useState<string | null>(null);

useEffect(() => {
  const storedClubId = localStorage.getItem("growcrm_active_club_id");
  setClubId(storedClubId);
}, []);

  async function loadRequests() {
    if (!clubId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/club/${clubId}/membership-requests`
      );

      if (!response.ok) {
        throw new Error("No se pudieron cargar las solicitudes");
      }

      const data = await response.json();

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("GET MEMBERSHIP REQUESTS ERROR:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [clubId]);

  async function updateRequest(
    id: string,
    action: "approve" | "reject"
  ) {
    try {
      setProcessingId(id);

      const response = await fetch(
        `${API_URL}/membership-request/${id}/${action}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar la solicitud");
      }

      await loadRequests();
    } catch (error) {
      console.error("MEMBERSHIP REQUEST UPDATE ERROR:", error);
      alert("No se pudo actualizar la solicitud.");
    } finally {
      setProcessingId(null);
    }
  }

  const pending = requests.filter(
    (request) => request.status === "pending"
  );

  const rejected = requests.filter(
    (request) => request.status === "rejected"
  );

  const approved = requests.filter(
    (request) => request.status === "approved"
  );

  /*
   * Las solicitudes aprobadas representan socios nuevos.
   * Los datos de reservas todavía no existen en el backend de socios,
   * por eso no inventamos actividad real.
   */
  const socios: Socio[] = approved.map((request) => ({
    id: request.user.id,
    nombre: request.user.name || "Sin nombre",
    email: request.user.email,
    estado: "Activo",
    ingreso: formatDate(request.createdAt),
    reservas: 0,
  }));

  const filteredSocios = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return socios;

    return socios.filter(
      (socio) =>
        socio.nombre.toLowerCase().includes(value) ||
        socio.email.toLowerCase().includes(value)
    );
  }, [socios, search]);

  const filteredPending = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return pending;

    return pending.filter(
      (request) =>
        request.user.name?.toLowerCase().includes(value) ||
        request.user.email.toLowerCase().includes(value)
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

        {/* MÉTRICAS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MetricCard
            icon={<Users size={20} />}
            iconClass="bg-[#e8f7f2] text-[#007f63]"
            label="Total"
            value={approved.length}
            description="Socios registrados"
          />

          <MetricCard
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Estado"
            value={approved.length}
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
                        : "Solicitudes rechazadas"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === "active"
                      ? "Socios que forman parte actualmente del club."
                      : activeTab === "pending"
                        ? "Personas que solicitaron ingresar al club."
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
                  count={approved.length}
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
              <div className="text-sm text-gray-400">
                Cargando socios...
              </div>
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
          ) : activeTab === "active" ? (
            <ActiveMembers
              socios={filteredSocios}
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
    </main>
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
}: {
  socios: Socio[];
}) {
  if (socios.length === 0) {
    return (
      <EmptyState
        icon={<Users size={24} />}
        title="Todavía no hay socios activos"
        description="Cuando apruebes solicitudes de ingreso, los socios aparecerán acá."
      />
    );
  }

  return (
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
          {socios.map((socio) => (
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
                    No disponible
                  </div>

                </div>
              </td>

              <td className="px-6 py-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Activo
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

              <td className="px-6 py-5">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:bg-white hover:text-gray-700"
                >
                  <MoreHorizontal size={18} />
                </button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
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
              {getInitials(request.user.name || request.user.email)}
            </div>

            <div>
              <p className="font-semibold text-[#092f35]">
                {request.user.name || "Sin nombre"}
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Mail size={14} />
                {request.user.email}
              </div>

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
              {getInitials(request.user.name || request.user.email)}
            </div>

            <div>
              <p className="font-semibold text-[#092f35]">
                {request.user.name || "Sin nombre"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {request.user.email}
              </p>

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