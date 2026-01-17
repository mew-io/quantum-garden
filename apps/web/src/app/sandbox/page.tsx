import type { Metadata } from "next";
import { Sandbox } from "@/components/sandbox";

export const metadata: Metadata = {
  title: "Sprite Sandbox | Quantum Garden",
  description: "Visual development environment for plant glyphs",
};

export default function SandboxPage() {
  return <Sandbox />;
}
