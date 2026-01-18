import { NextRequest, NextResponse } from "next/server";
import { doctorsOnDutyHelpers } from "@/lib/db-helpers";
import db from "@/lib/db";

// Endpoint pentru cron job - rotație automată la 12 ore
// Acest endpoint poate fi apelat de un serviciu extern (cron job, Vercel Cron, etc.)
export async function GET(request: NextRequest) {
  try {
    // Verifică header-ul pentru securitate (opțional)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculează perioada curentă de 12 ore
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setHours(Math.floor(now.getHours() / 12) * 12, 0, 0, 0);
    
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setHours(currentPeriodEnd.getHours() + 12);

    // Verifică dacă există deja o rotație pentru perioada curentă
    const existingRotation = db.prepare(`
      SELECT COUNT(*) as count 
      FROM doctors_on_duty 
      WHERE weekStartDate <= ? AND weekEndDate >= ?
    `).get(
      currentPeriodStart.toISOString(),
      currentPeriodEnd.toISOString()
    ) as { count: number };

    // Dacă există deja rotație pentru perioada curentă, nu face altă rotație
    if (existingRotation.count > 0) {
      return NextResponse.json({
        message: "Rotația pentru perioada curentă există deja",
        skipped: true,
        period: {
          start: currentPeriodStart.toISOString(),
          end: currentPeriodEnd.toISOString(),
        },
      });
    }

    // Generează rotație automată pentru perioada curentă de 12 ore
    const rotation = doctorsOnDutyHelpers.generateAutomaticRotationForPeriod({
      startDate: currentPeriodStart,
      endDate: currentPeriodEnd,
      doctorsCount: 3, // 3 medici de gardă per perioadă de 12 ore
    });

    return NextResponse.json({
      success: true,
      message: "Rotație automată generată cu succes",
      rotation,
      period: {
        start: currentPeriodStart.toISOString(),
        end: currentPeriodEnd.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in auto rotation cron:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la generarea rotației automate" },
      { status: 500 }
    );
  }
}
