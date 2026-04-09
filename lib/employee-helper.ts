// Pure utility helpers — no DB calls (those models no longer exist in the schema)

export function formatEmployeeName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function getBranchDisplayName(branch: string): string {
  const branchNames: Record<string, string> = {
    HQ: "Headquarters",
    BR: "Branch 1",
    BR2: "Branch 2",
    BR3: "Branch 3",
  };
  return branchNames[branch] || branch;
}