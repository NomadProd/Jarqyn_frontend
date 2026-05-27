export type NisSchoolGroup = { regionLabel: string; schools: string[] };

/** Optional NIS school list per business rules */
export const NIS_SCHOOL_GROUPS: NisSchoolGroup[] = [
  { regionLabel: "Astana", schools: ["NIS PhM", "NIS", "NIS IB"] },
  { regionLabel: "Almaty", schools: ["NIS PhM", "NIS ChB"] },
  {
    regionLabel: "Regions",
    schools: [
      "Atyrau",
      "Aktau",
      "Aktobe",
      "Karaganda",
      "Pavlodar",
      "Petropavlovsk (ChB)",
      "Semey",
      "Taldykorgan",
      "Taraz",
      "Uralsk",
      "Ust-Kamenogorsk",
      "Shymkent",
      "Kokshetau",
      "Kostanay",
      "Kyzylorda",
      "Turkistan"
    ]
  }
];

export const CUSTOMER_SOURCE_OPTIONS = ["Instagram", "TikTok"] as const;
export type CustomerSourceOption = (typeof CUSTOMER_SOURCE_OPTIONS)[number];
