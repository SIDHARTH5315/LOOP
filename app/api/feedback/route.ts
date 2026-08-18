import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/require-auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const feedback = await prisma.feedback.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      feedback,
    });
  } catch (error) {
    console.error("Feedback fetch error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch feedback.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const content = body.content?.trim();
    const channel = body.channel;
    const customerLabel = body.customerLabel?.trim() || null;
    const featureArea = body.featureArea?.trim() || null;
    const sourceRef = body.sourceRef?.trim() || null;

    if (!content) {
      return NextResponse.json(
        { error: "Feedback content is required." },
        { status: 400 }
      );
    }

    const validChannels = ["CSV", "MANUAL", "API"];

    if (!validChannels.includes(channel)) {
      return NextResponse.json(
        { error: "Invalid feedback channel." },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel,
        featureArea,
        sourceRef,
        workspaceId: user.workspaceId,
      },
    });

    return NextResponse.json(
      {
        message: "Feedback created successfully.",
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Feedback creation error:", error);

    return NextResponse.json(
      {
        error: "Failed to create feedback.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}