import type { Metadata } from "next";
import Link from "next/link";
import { Sandbox } from "@/components/sandbox";

export const metadata: Metadata = {
  title: "Sprite Sandbox | Quantum Garden",
  description: "Visual development environment for plant glyphs",
};

export default function SandboxPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation to variant sandbox */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <span className="text-sm">
          <strong>Tip:</strong> Use the Variant Sandbox to design lifecycle animations
        </span>
        <Link
          href="/sandbox/variants"
          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm font-medium"
        >
          Open Variant Sandbox →
        </Link>
      </div>
      <Sandbox />
    </div>
  );
}
