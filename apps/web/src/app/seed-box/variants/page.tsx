import { redirect } from "next/navigation";

/**
 * Redirect to consolidated sandbox.
 * The variant sandbox is now the main sandbox at /sandbox.
 */
export default function VariantSandboxPage() {
  redirect("/seed-box");
}
