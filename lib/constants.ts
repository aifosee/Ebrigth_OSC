export const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "CEO", label: "CEO" },
  { value: "FT HOD", label: "FT HOD" },
  { value: "FT EXEC", label: "FT EXEC" },
  { value: "FT - Coach", label: "FT - Coach" },
  { value: "PT - Coach", label: "PT - Coach" },
  { value: "BM", label: "BM" },
  { value: "INT", label: "INT" },
];

export const CONTRACT_OPTIONS = [
  { value: "", label: "None" },
  { value: "12 MONTH", label: "12 Month" },
  { value: "15 MONTH", label: "15 Month" },
  { value: "18 MONTH", label: "18 Month" },
];

export const BRANCH_OPTIONS = [
  { value: "HQ", label: "HQ" },
  { value: "OD", label: "OD" },
  { value: "MKT", label: "MKT" },
  { value: "ACD", label: "ACD" },
  { value: "IOP", label: "IOP" },
  { value: "FNC", label: "FNC" },
  { value: "HR", label: "HR" },
  { value: "ONL", label: "ONL" },
  { value: "ST", label: "ST" },
  { value: "SP", label: "SP" },
  { value: "SA", label: "SA" },
  { value: "KD", label: "KD" },
  { value: "PJY", label: "PJY" },
  { value: "AMP", label: "AMP" },
  { value: "CJY", label: "CJY" },
  { value: "KLG", label: "KLG" },
  { value: "DA", label: "DA" },
  { value: "BBB", label: "BBB" },
  { value: "DK", label: "DK" },
  { value: "SHA", label: "SHA" },
  { value: "BTHO", label: "BTHO" },
  { value: "EGR", label: "EGR" },
  { value: "BSP", label: "BSP" },
  { value: "RBY", label: "RBY" },
  { value: "TSG", label: "TSG" },
  { value: "KW", label: "KW" },
  { value: "KTG", label: "KTG" },
  { value: "DPU", label: "DPU" },
];

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

export function getRoleLabel(role: string): string {
  const option = ROLE_OPTIONS.find((opt) => opt.value === role);
  return option?.label || role;
}

export function getBranchLabel(branch: string): string {
  const option = BRANCH_OPTIONS.find((opt) => opt.value === branch);
  return option?.label || branch;
}

export function getContractLabel(contract: string): string {
  const option = CONTRACT_OPTIONS.find((opt) => opt.value === contract);
  return option?.label || contract;
}

export function getGenderLabel(gender: string): string {
  const option = GENDER_OPTIONS.find((opt) => opt.value === gender);
  return option?.label || gender;
}
