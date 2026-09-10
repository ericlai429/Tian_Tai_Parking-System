// 預設 Google 雲端執勤班表網址 (由 Admin 編輯)
export const DEFAULT_SCHEDULE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1oL4MWWiqKycGVKcvuZQCFBnGpK7QZn65NHm3BY_Ospw/edit?gid=1944564462#gid=1944564462";

export const INITIAL_SCHEDULE_DATA = {
  projectTitle: "天泰三總 現場執勤表",
  companyName: "飛龍保全",
  corpName: "中華飛龍物業",
  yearRoc: 115,
  yearAd: 2026,
  month: 9,
    phone: "02-2259-2999",
  fax: "02-2256-2609",
  headquarters: "220新北市板橋區文化路二段498號3樓",
  shiftTypes: {
    A: {
      name: "日班",
      timeRange: "07:00~19:00",
      hours: 12,
      color: "#4f46e5"
    }
  },
  daysInMonth: 30,
  // 1=二, 2=三, ..., 5=六, 6=日
  dayNames: ["日", "一", "二", "三", "四", "五", "六"],
  // 每日應勤總時數 (9/8 ~ 9/30 每日 12 小時，全月共 276 小時)
  dailyTargetHours: {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
    8: 12, 9: 12, 10: 12, 11: 12, 12: 12, 13: 12, 14: 12,
    15: 12, 16: 12, 17: 12, 18: 12, 19: 12, 20: 12, 21: 12,
    22: 12, 23: 12, 24: 12, 25: 12, 26: 12, 27: 12, 28: 12,
    29: 12, 30: 12
  },
  totalTargetHours: 276,
  guards: [
    {
      id: "g1",
      name: "賴鯤仲",
      role: "日班",
      type: "regular",
      phone: "0911-222-333",
      targetHours: 144,
      actualHours: 144,
      shifts: {
        8: "A",
        12: "A",
        13: "A",
        18: "A",
        19: "A",
        20: "A",
        24: "A",
        25: "A",
        26: "A",
        27: "A",
        28: "A",
        30: "A"
      },
      specialNotes: {}
    },
    {
      id: "g2",
      name: "葉榮東",
      role: "日機",
      type: "backup",
      phone: "0922-333-444",
      targetHours: 96,
      actualHours: 96,
      shifts: {
        14: "A",
        15: "A",
        16: "A",
        17: "A",
        21: "A",
        22: "A",
        23: "A",
        29: "A"
      },
      specialNotes: {
        14: "日機代班",
        15: "日機代班",
        16: "日機代班",
        17: "日機代班",
        21: "日機代班",
        22: "日機代班",
        23: "日機代班",
        29: "日機代班"
      }
    },
    {
      id: "g3",
      name: "賴宗興",
      role: "日機",
      type: "backup",
      phone: "0933-444-555",
      targetHours: 36,
      actualHours: 36,
      shifts: {
        9: "A",
        10: "A",
        11: "A"
      },
      specialNotes: {
        9: "日機代班",
        10: "日機代班",
        11: {
          type: "substitute",
          label: "機動代班 (賴鯤仲)",
          color: "#d946ef",
          bgColor: "#fae8ff",
          borderColor: "#e879f9"
        }
      }
    }
  ],
  regulations: [
    "值勤時須整肅儀容並穿著公司規定之服裝、配備；嚴禁睡覺、擅離崗位、閱讀報章雜誌及使用3C產品，並應依規定勤務工作內容值勤。",
    "不得遲到早退，接班人員未到交接人員不得先行離去，交接時，應辦事項須交待清楚。",
    "若有指定休假者，請於當月15日前告知勤區主管次月欲指定休假之日期(以二日為限)，每日指休限額6名，當日額滿以公開抽籤方式通知確認，未抽中者以勤區排班方式輪值，若遇休假問題時需配合主管調度。",
    "本表不得變更，若有調、代班等，應於事前向勤區主管報備經核准後始可改變實施。",
    "事、公、婚、喪假須於五日前以書面、電話向勤區主管申請(病假可於事後補申請，但需檢附醫院證明)，經核准並覓妥代理人後始得請假，若未准假造成空班者，記大過乙次，再犯開除解僱。"
  ]
};
