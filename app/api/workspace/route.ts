import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/require-auth";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      workspace: {
        id: user.workspace.id,
        name: user.workspace.name,
        slug: user.workspace.slug,
        createdAt: user.workspace.createdAt,
        updatedAt: user.workspace.updatedAt,
      },
    });
  } catch (error) {
    console.error("Workspace error:", error);

    return NextResponse.json(
      { error: "Failed to load workspace." },
      { status: 500 }
    );
  }
}