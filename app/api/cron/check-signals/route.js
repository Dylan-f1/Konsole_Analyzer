import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Watch from "@/lib/models/Watch";
import Signal from "@/lib/models/Signal";
import { scrapeUrl } from "@/lib/scraper";
import { detectTechStack, buildGtmSignals } from "@/lib/techDetector";

// Vercel Cron Job — runs every night at 02:00 UTC
// Secured with CRON_SECRET to prevent unauthorized calls
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const watches = await Watch.find({ "watchedBy.0": { $exists: true } });
  if (watches.length === 0) return NextResponse.json({ checked: 0, signals: 0 });

  let newSignalsCount = 0;

  for (const watch of watches) {
    try {
      const scraped    = await scrapeUrl(watch.url);
      const techStack  = detectTechStack(scraped.html);
      const scrapedSignals = [
        scraped.hasPricing && "Page pricing publique",
        scraped.hasCta     && "CTA demo ou trial détecté",
        scraped.linkedIn   && "Profil LinkedIn trouvé",
        ...scraped.fundingSignals.map((s) => s?.label ?? s),
        ...scraped.behavioralSignals.map((s) => s.label),
      ].filter(Boolean);
      const gtmSignals = buildGtmSignals(scraped.html, scrapedSignals);
      const gtmLabels  = gtmSignals.map((s) => s?.label ?? s);

      const prev = watch.lastSnapshot ?? {};
      const prevTech    = prev.techStack ?? [];
      const prevSignals = prev.gtmSignalLabels ?? [];

      const newSignalDocs = [];

      // New techs added
      for (const tech of techStack) {
        if (!prevTech.includes(tech)) {
          newSignalDocs.push({
            url:         watch.url,
            companyName: watch.companyName,
            favicon:     watch.favicon,
            type:        "new_tech",
            message:     `Nouvelle techno détectée : ${tech}`,
          });
        }
      }

      // Techs removed
      for (const tech of prevTech) {
        if (!techStack.includes(tech)) {
          newSignalDocs.push({
            url:         watch.url,
            companyName: watch.companyName,
            favicon:     watch.favicon,
            type:        "removed_tech",
            message:     `Techno retirée : ${tech}`,
          });
        }
      }

      // New behavioral / GTM signals
      for (const label of gtmLabels) {
        if (!prevSignals.includes(label)) {
          const isFunding = /(levée|funding|series|accelerateur)/i.test(label);
          newSignalDocs.push({
            url:         watch.url,
            companyName: watch.companyName,
            favicon:     watch.favicon,
            type:        isFunding ? "funding" : "new_signal",
            message:     label,
          });
        }
      }

      // LinkedIn appeared
      if (scraped.linkedIn && !prev.hasLinkedIn) {
        newSignalDocs.push({
          url:         watch.url,
          companyName: watch.companyName,
          favicon:     watch.favicon,
          type:        "linkedin",
          message:     `Profil LinkedIn trouvé : ${scraped.linkedIn}`,
        });
      }

      if (newSignalDocs.length > 0) {
        await Signal.insertMany(newSignalDocs);
        newSignalsCount += newSignalDocs.length;
      }

      // Update snapshot
      await Watch.findByIdAndUpdate(watch._id, {
        lastCheckedAt: new Date(),
        lastSnapshot: {
          techStack,
          gtmSignalLabels: gtmLabels,
          hasLinkedIn:  !!scraped.linkedIn,
          hasFunding:   scraped.fundingSignals.length > 0,
        },
      });
    } catch (err) {
      // Log and continue — one failing URL shouldn't block others
      console.error(`[cron] Error checking ${watch.url}:`, err.message);
    }
  }

  return NextResponse.json({ checked: watches.length, signals: newSignalsCount });
}
