import { NextRequest, NextResponse } from "next/server";
import { doctorsOnDutyHelpers } from "@/lib/db-helpers";
import db from "@/lib/db";

// Rotație automată bazată pe programări (la 12 ore)
export async function POST(request: NextRequest) {
  try {
    // Verifică ultima rotație automată
    const lastRotation = db.prepare(`
      SELECT MAX(createdAt) as lastRotation 
      FROM doctors_on_duty 
      WHERE createdAt >= datetime('now', '-12 hours')
    `).get() as { lastRotation: string | null };

    // Dacă a fost o rotație în ultimele 12 ore, nu face altă rotație
    if (lastRotation?.lastRotation) {
      return NextResponse.json({
        message: "Rotația a fost deja generată în ultimele 12 ore",
        skipped: true,
      });
    }

    // Calculează perioada următoare (următoarele 12 ore)
    const now = new Date();
    const nextRotationStart = new Date(now);
    nextRotationStart.setHours(Math.floor(now.getHours() / 12) * 12, 0, 0, 0);
    if (nextRotationStart <= now) {
      nextRotationStart.setHours(nextRotationStart.getHours() + 12);
    }
    
    const nextRotationEnd = new Date(nextRotationStart);
    nextRotationEnd.setHours(nextRotationEnd.getHours() + 12);

    // Generează rotație automată pentru următoarele 12 ore
    const rotation = doctorsOnDutyHelpers.generateAutomaticRotationForPeriod({
      startDate: nextRotationStart,
      endDate: nextRotationEnd,
      doctorsCount: 3, // 3 medici de gardă per perioadă de 12 ore
    });

    return NextResponse.json({
      message: "Rotație automată generată cu succes",
      rotation,
      period: {
        start: nextRotationStart.toISOString(),
        end: nextRotationEnd.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in auto rotation:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la generarea rotației automate" },
      { status: 500 }
    );
  }
}

// GET pentru a verifica statusul rotației
export async function GET(request: NextRequest) {
  try {
    const lastRotation = db.prepare(`
      SELECT MAX(createdAt) as lastRotation 
      FROM doctors_on_duty 
      WHERE createdAt >= datetime('now', '-12 hours')
    `).get() as { lastRotation: string | null };

    const nextRotation = db.prepare(`
      SELECT MIN(weekStartDate) as nextRotation 
      FROM doctors_on_duty 
      WHERE weekStartDate > datetime('now')
    `).get() as { nextRotation: string | null };

    return NextResponse.json({
      lastRotation: lastRotation?.lastRotation || null,
      nextRotation: nextRotation?.nextRotation || null,
      needsRotation: !lastRotation?.lastRotation,
    });
  } catch (error: any) {
    console.error("Error checking rotation status:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la verificarea statusului rotației" },
      { status: 500 }
    );
  }
}
