/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function validateEmail(email: unknown) {
  if (typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // try to create; unique constraint will prevent duplicates
    try {
      const entry = await prisma.waitlist.create({
        data: { email },
      });

      return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
    } catch (err: any) {
      // Prisma unique constraint error
      if (err?.code === "P2002") {
        return NextResponse.json(
          { ok: true, message: "Already on waitlist" },
          { status: 200 },
        );
      }
      console.error("Waitlist create error", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (err) {
    console.error("Waitlist route error", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
