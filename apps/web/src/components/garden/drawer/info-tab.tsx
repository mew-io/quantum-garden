"use client";

export function InfoTab() {
  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="pb-6">
        <h3 className="text-[--wc-ink] text-base font-semibold mb-3">Quantum Garden</h3>
        <p className="text-[--wc-ink-soft] text-sm leading-relaxed">
          A slow-evolving generative environment where plants exist in quantum superposition until
          observed.
        </p>
      </div>

      <div className="border-t border-[--wc-stone]/20 py-6">
        <h4 className="text-[--wc-ink] text-[13px] font-semibold mb-2">How it works</h4>
        <p className="text-[--wc-ink-soft] text-[13px] leading-relaxed">
          Each plant is defined by a quantum circuit encoding multiple possible forms, colors, and
          growth behaviors. These circuits were executed on real quantum hardware, producing
          probabilistic outcomes that exist independently of any observer.
        </p>
      </div>

      <div className="border-t border-[--wc-stone]/20 py-6">
        <h4 className="text-[--wc-ink] text-[13px] font-semibold mb-2">Observation</h4>
        <p className="text-[--wc-ink-soft] text-[13px] leading-relaxed">
          <span className="text-[--wc-ink] font-bold underline underline-offset-2">
            Click any plant to observe it.
          </span>{" "}
          You don&apos;t trigger quantum computation&mdash;you witness and stabilize a result that
          was already resolved. Its quantum traits will be revealed, collapsing its superposition
          into a single state.
        </p>
      </div>

      <div className="border-t border-[--wc-stone]/20 py-6">
        <h4 className="text-[--wc-ink] text-[13px] font-semibold mb-2">Entanglement</h4>
        <p className="text-[--wc-ink-soft] text-[13px] leading-relaxed">
          Some plants are entangled. Observing one can reveal correlated traits in others elsewhere
          in the garden, even if they haven&apos;t been encountered yet.
        </p>
      </div>

      <div className="border-t border-[--wc-stone]/20 py-6">
        <h4 className="text-[--wc-ink] text-[13px] font-semibold mb-2">Evolution</h4>
        <p className="text-[--wc-ink-soft] text-[13px] leading-relaxed">
          The garden evolves continuously through server-side evolution. Plants begin as dormant
          seeds and germinate over time. Germination is influenced by proximity to observed plants,
          clustering behavior, and age. The garden continues to evolve, whether anyone is watching
          or not.
        </p>
      </div>

      <div className="border-t border-[--wc-stone]/20 py-6">
        <p className="text-[--wc-ink-soft] text-[13px] leading-relaxed mb-3">
          Design and preview plant variants. Experiment with forms, colors, and growth
          patterns&mdash;then contribute them back to the garden.
        </p>
        <a
          href="/seed-box"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[--wc-sage] hover:text-[--wc-ink] transition-colors"
        >
          Explore the Seed Box
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>

      <div className="border-t border-[--wc-stone]/20 pt-6">
        <p className="text-[--wc-ink-muted] text-xs leading-relaxed">
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
