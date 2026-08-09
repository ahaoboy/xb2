import { Stack } from "@mui/material";
import type { ComboTreeNode } from "../../utils/combo";
import StartTreeCard from "./StartTreeCard";

interface ComboTreeProps {
  roots: ComboTreeNode[];
  names: Map<string, string>;
}

/** One mermaid-style route tree card per starting element. */
export default function ComboTree({ roots, names }: ComboTreeProps) {
  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {roots.map((root) => (
        <StartTreeCard key={root.element} root={root} names={names} />
      ))}
    </Stack>
  );
}
