import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Boxes, Briefcase, GraduationCap } from "lucide-react";
import { copyrightLine } from "@/lib/brand";
import { Wordmark } from "@/components/wordmark";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: GraduationCap, title: "Learn from real-world practice", text: "Courses built by practitioners around the work you'll actually do." },
  { icon: Boxes, title: "Practise hands-on", text: "Interactive labs, simulators and guided exercises in every course." },
  { icon: Briefcase, title: "Prove your skills", text: "Real projects, assessments and certificates you can share." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b1b3f] text-white lg:flex lg:flex-col">
        <Image src="/marketing/signin-learner.png" alt="" fill priority sizes="50vw" className="object-cover object-top" />
        {/* Navy wash so the text stays readable over the photo. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1b3f] via-[#0b1b3f]/85 to-[#0b1b3f]/35" aria-hidden />
        {/* Spacing and type tighten on shorter screens (laptops) so the copyright stays in view. */}
        <div className="relative flex flex-1 flex-col justify-between p-12 xl:p-16 [@media(max-height:860px)]:py-8">
          <Link href="/" aria-label="Nexsademy home" className="w-fit">
            <Wordmark inverse />
          </Link>

          <div className="max-w-xl py-14 [@media(max-height:860px)]:py-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5 text-[#f2c35b]" aria-hidden /> Practical, job-ready learning
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.08] xl:text-6xl [@media(max-height:860px)]:mt-4 [@media(max-height:860px)]:text-4xl">
              Learn skills you can use at work, from day one.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75 [@media(max-height:860px)]:mt-3 [@media(max-height:860px)]:text-base">
              Guided courses, hands-on practice and real projects, so you finish ready to do the job, not just pass a quiz.
            </p>

            <ul className="mt-10 space-y-5 [@media(max-height:860px)]:mt-6 [@media(max-height:860px)]:space-y-3">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <f.icon className="h-5 w-5 text-[#c7c8ff]" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold">{f.title}</span>
                    <span className="block text-sm text-white/65">{f.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="border-t border-white/10 pt-6 text-xs text-white/50">{copyrightLine()}</p>
        </div>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden" aria-label="Nexsademy home">
            <Wordmark />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem]">{children}</div>
        </div>
        <p className="text-center text-xs text-muted lg:hidden">{copyrightLine()}</p>
      </main>
    </div>
  );
}
