"use client";

function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[--wc-ink-soft] text-xs">{description}</span>
      <kbd className="px-2 py-1 bg-[--wc-paper] rounded text-[--wc-ink-soft] text-xs font-mono border border-[--wc-stone]/40">
        {shortcut}
      </kbd>
    </div>
  );
}

export function ShortcutsTab() {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">General</h4>
        <ShortcutRow shortcut="`" description="Toggle debug panel" />
        <ShortcutRow shortcut="Esc" description="Close drawer" />
      </div>

      <div className="pt-3 border-t border-[--wc-stone]/30">
        <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
          Event Navigation
        </h4>
        <div className="space-y-2">
          <ShortcutRow shortcut="&larr;" description="Previous event" />
          <ShortcutRow shortcut="&rarr;" description="Next event" />
        </div>
      </div>

      <div className="pt-3 border-t border-[--wc-stone]/30">
        <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">Observation</h4>
        <p className="text-[--wc-ink-muted] text-xs leading-relaxed">
          Hover over a plant and hold to observe it. Its quantum traits will be revealed.
        </p>
      </div>
    </div>
  );
}
