import { cookies } from "next/headers";
import { verifySessionToken } from "./auth";
import { prisma } from "./prisma";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      workspace: true,
    },
  });

  return user;
}