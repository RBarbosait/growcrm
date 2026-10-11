export function getReservationQrTarget(origin: string, reservationId: string) {
  const target = new URL("/qr-reserva", origin)
  target.searchParams.set("reserva", reservationId)
  return target.toString()
}

export function getReservationQrImageUrl(
  origin: string,
  reservationId: string,
  size = 400
) {
  const qrImage = new URL("https://api.qrserver.com/v1/create-qr-code/")
  qrImage.searchParams.set("size", `${size}x${size}`)
  qrImage.searchParams.set("data", getReservationQrTarget(origin, reservationId))
  return qrImage.toString()
}
