"use client";

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
  ChevronRight,
} from "lucide-react";

const socios = [
  {
    id: 1,
    initials: "MR",
    nombre: "Martín Rodríguez",
    email: "martin.rodriguez@gmail.com",
    telefono: "+598 99 123 456",
    estado: "Activo",
    ingreso: "12 Ago 2026",
    reservas: 8,
  },
];

export default function SociosPage() {
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

          {/* ACCIÓN PRINCIPAL */}
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

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7f2] text-[#007f63]">
                <Users size={20} />
              </div>

              <span className="text-xs font-medium text-gray-400">
                Total
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-[#092f35]">
              1
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Socios registrados
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={20} />
              </div>

              <span className="text-xs font-medium text-gray-400">
                Estado
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-[#092f35]">
              1
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Socios activos
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock3 size={20} />
              </div>

              <span className="text-xs font-medium text-gray-400">
                Pendientes
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-[#092f35]">
              0
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Invitaciones pendientes
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <CalendarDays size={20} />
              </div>

              <span className="text-xs font-medium text-gray-400">
                Actividad
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-[#092f35]">
              8
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Reservas realizadas
            </p>
          </div>

        </div>

        {/* LISTADO */}
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          {/* CABECERA LISTADO */}
          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-lg font-bold text-[#092f35]">
                  Todos los socios
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Consultá y administrá la información de los socios del club.
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
                  placeholder="Buscar por nombre o email..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007f63] focus:bg-white"
                />
              </div>

            </div>

          </div>

          {/* TABLA */}
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

                  <th className="w-16 px-6 py-4"></th>

                </tr>
              </thead>

              <tbody>

                {socios.map((socio) => (
                  <tr
                    key={socio.id}
                    className="group border-b border-gray-100 last:border-0 transition hover:bg-gray-50/60"
                  >

                    {/* SOCIO */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dff4ed] text-sm font-bold text-[#007f63]">
                          {socio.initials}
                        </div>

                        <div>
                          <p className="font-semibold text-[#092f35]">
                            {socio.nombre}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            Socio #{String(socio.id).padStart(4, "0")}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* CONTACTO */}
                    <td className="px-6 py-5">

                      <div className="space-y-1">

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {socio.email}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Phone size={13} />
                          {socio.telefono}
                        </div>

                      </div>

                    </td>

                    {/* ESTADO */}
                    <td className="px-6 py-5">

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {socio.estado}
                      </span>

                    </td>

                    {/* INGRESO */}
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {socio.ingreso}
                    </td>

                    {/* RESERVAS */}
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

                    {/* ACCIONES */}
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

          {/* FOOTER LISTADO */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-6 py-4">

            <p className="text-xs text-gray-400">
              Mostrando 1 socio
            </p>

            <button
              type="button"
              disabled
              className="flex items-center gap-1 text-xs font-semibold text-gray-300"
            >
              Ver más
              <ChevronRight size={14} />
            </button>

          </div>

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