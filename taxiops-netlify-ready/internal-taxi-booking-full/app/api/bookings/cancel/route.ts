import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const u = await getSession();

    if (!u) {
      throw new Error("Unauthorized");
    }

    const { id } = await req.json();

    if (!id) {
      throw new Error("Booking ID wajib diisi");
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new Error("Booking tidak ditemukan");
    }

    // Driver tidak diperbolehkan membatalkan booking
    if (u.role === "DRIVER") {
      throw new Error("Forbidden");
    }

    // Booking yang sudah selesai atau dibatalkan
    // tidak dapat dibatalkan kembali.
    if (
      booking.status === "COMPLETED" ||
      booking.status === "CANCELLED"
    ) {
      throw new Error(
        `Booking dengan status ${booking.status} tidak dapat dibatalkan`
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    await prisma.auditLog.create({
      data: {
        bookingId: id,
        userId: u.id,
        action: "CANCEL",
        oldValue: booking.status,
        newValue: "CANCELLED",
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e?.message || "Gagal membatalkan booking",
      },
      {
        status: 400,
      }
    );
  }
}
