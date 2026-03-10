"use client";

export function InfoTab() {
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full text-sm">
      <div>
        <h3 className="text-[--wc-ink] font-medium mb-1.5">Quantum Garden</h3>
        <p className="text-[--wc-ink-soft] text-xs leading-relaxed">
          A slow-evolving generative environment where plants exist in quantum superposition until
          observed.
        </p>
      </div>

      <div className="w-8 h-px bg-[--wc-stone]/30" />

      <div className="space-y-3">
        <Section title="How it works">
          Each plant is defined by a quantum circuit encoding multiple possible forms, colors, and
          growth behaviors. These circuits were executed on real quantum hardware, producing
          probabilistic outcomes that exist independently of any observer.
        </Section>

        <Section title="Observation">
          When you encounter a plant, you don&apos;t trigger quantum computation&mdash;you witness
          and stabilize a result that was already resolved. Click a plant to observe it. Its quantum
          traits will be revealed, collapsing its superposition into a single state.
        </Section>

        <Section title="Entanglement">
          Some plants are entangled. Observing one can reveal correlated traits in others elsewhere
          in the garden, even if they haven&apos;t been encountered yet.
        </Section>

        <Section title="Evolution">
          The garden evolves continuously through server-side evolution. Plants begin as dormant
          seeds and germinate over time. Germination is influenced by proximity to observed plants,
          clustering behavior, and age. The garden continues to evolve, whether anyone is watching
          or not.
        </Section>
      </div>

      <div className="pt-2 border-t border-[--wc-stone]/20">
        <p className="text-[--wc-ink-muted] text-xs leading-relaxed mb-2">
          Design and preview plant variants. Experiment with forms, colors, and growth
          patterns&mdash;then contribute them back to the garden.
        </p>
        <a
          href="/sandbox"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[--wc-sage] hover:text-[--wc-ink] transition-colors"
        >
          Explore the Sandbox
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>

      <div className="pt-2 border-t border-[--wc-stone]/20">
        <p className="text-[--wc-ink-muted] text-[11px] leading-relaxed">
          Supported by{" "}
          <a
            href="https://qollab.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[--wc-ink-soft] transition-colors"
          >
            Qollab
          </a>{" "}
          with compute credits from IonQ.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[--wc-ink] text-xs font-medium mb-1">{title}</h4>
      <p className="text-[--wc-ink-muted] text-xs leading-relaxed">{children}</p>
    </div>
  );
}
