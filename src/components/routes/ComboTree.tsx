import { useMemo } from "react";
import { Stack } from "@mui/material";
import type { ComboTreeNode } from "../../utils/combo";
import StartTreeCard from "./StartTreeCard";

interface ComboTreeProps {
  roots: ComboTreeNode[];
  names: Map<string, string>;
}

/** One mermaid-style route tree card per starting element, ranked by avg icon score. */
export default function ComboTree({ roots, names }: ComboTreeProps) {
  const sortedRoots = useMemo(
    () =>
      [...roots].sort(
        (a, b) =>
          (b.avgScore ?? 0) - (a.avgScore ?? 0) || (b.optimalCount ?? 0) - (a.optimalCount ?? 0),
      ),
    [roots],
  );

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {sortedRoots.map((root) => (
        <StartTreeCard key={root.element} root={root} names={names} />
      ))}
    </Stack>
  );
}
