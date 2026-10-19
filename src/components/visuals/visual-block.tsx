import { TriangleAlert } from "lucide-react";
import { parseVisual, type VisualData } from "@/lib/visuals/schemas";
import { BeforeAfterBlock, CardsBlock, CompareBlock, DoDontBlock, JournalBlock, LayersBlock, ScenarioBlock, StepsBlock, TakeawaysBlock, TimelineBlock, TrendBlock } from "./static-blocks";
import { StoryPlayer } from "./story-player";
import { SimulateBlock } from "./simulate-block";
import { CodewalkBlock, GstBlock, MatchBlock, OrderBlock, RoleplayBlock, SequenceBlock } from "./exercise-blocks";
import { ScreenBlock, CheckBlock, DecisionBlock, FigureBlock, FlowBlock, HeroBlock, HubBlock, MockupBlock } from "./interactive-blocks";

/** Renders a ```visual-<type> fence. Invalid blocks show an authoring error instead of breaking the lesson. */
export function VisualBlock({ type, source }: { type: string; source: string }) {
  const parsed = parseVisual(type, source);
  if (!parsed.ok) {
    return (
      <div role="alert" className="not-prose my-6 rounded-xl border border-danger/40 bg-danger-soft p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold text-danger">
          <TriangleAlert className="h-4 w-4" aria-hidden /> Visual block error (visual-{parsed.type})
        </div>
        <p className="mt-1 text-fg">{parsed.error}</p>
        <p className="mt-1 text-xs text-muted">Fix the JSON in the lesson editor — see docs/visual-learning/visual-blocks.md.</p>
      </div>
    );
  }
  const d = parsed.data as never;
  switch (parsed.type) {
    case "hero":
      return <HeroBlock data={d as VisualData<"hero">} />;
    case "hub":
      return <HubBlock data={d} />;
    case "flow":
      return <FlowBlock data={d} />;
    case "steps":
      return <StepsBlock data={d} />;
    case "mockup":
      return <MockupBlock data={d} />;
    case "compare":
      return <CompareBlock data={d} />;
    case "beforeafter":
      return <BeforeAfterBlock data={d} />;
    case "decision":
      return <DecisionBlock data={d} />;
    case "timeline":
      return <TimelineBlock data={d} />;
    case "cards":
      return <CardsBlock data={d} />;
    case "dodont":
      return <DoDontBlock data={d} />;
    case "scenario":
      return <ScenarioBlock data={d} />;
    case "journal":
      return <JournalBlock data={d} />;
    case "check":
      return <CheckBlock data={d} />;
    case "figure":
      return <FigureBlock data={d} />;
    case "takeaways":
      return <TakeawaysBlock data={d} />;
    case "layers":
      return <LayersBlock data={d} />;
    case "trend":
      return <TrendBlock data={d} />;
    case "screen":
      return <ScreenBlock data={d} />;
    case "order":
      return <OrderBlock data={d} />;
    case "match":
      return <MatchBlock data={d} />;
    case "gst":
      return <GstBlock data={d} />;
    case "sequence":
      return <SequenceBlock data={d} />;
    case "codewalk":
      return <CodewalkBlock data={d} />;
    case "roleplay":
      return <RoleplayBlock data={d} />;
    case "simulate":
      return <SimulateBlock data={d} />;
    case "story":
      return <StoryPlayer data={d} />;
  }
}
