import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { WordLength } from "@/constants/wordlist-metadata";
import { isSupportedWordLength } from "@/lib/words";
import { getDailySolution, getRandomSolution } from "@/lib/wordlists.server";

type SolutionMode = "daily" | "infinite";

const isSolutionMode = (value: string | null): value is SolutionMode => {
  return value === "daily" || value === "infinite";
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ length: string }> }) {
  const { length } = await params;
  const lengthValue = Number.parseInt(length, 10);

  if (!isSupportedWordLength(lengthValue)) {
    return NextResponse.json({ error: "Longitud no soportada" }, { status: 400 });
  }

  const wordLength = lengthValue as WordLength;
  const modeParam = request.nextUrl.searchParams.get("mode");
  const mode: SolutionMode = isSolutionMode(modeParam) ? modeParam : "daily";

  try {
    const solution =
      mode === "daily" ? await getDailySolution(wordLength) : await getRandomSolution(wordLength);

    return NextResponse.json(
      { solution, mode },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to resolve game solution:", error);
    return NextResponse.json({ error: "No se pudo generar la solución" }, { status: 500 });
  }
}
