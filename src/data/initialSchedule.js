// 預設 Google 雲端執勤班表網址 (由 Admin 編輯)
export const DEFAULT_SCHEDULE_SHEET_URL = "https://docs.google.com/spreadsheets/d/13UYtQujV1jVVYei2HkLSMAcAS1nZizeZ81RK1toUbmI/edit?usp=sharing#sheet=14.天泰三總";

export const INITIAL_SCHEDULE_DATA = {
  "dayNames": [
    "日",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六"
  ],
  "phone": "02-2259-2999",
  "fax": "02-2256-2609",
  "headquarters": "220新北市板橋區文化路二段498號3樓",
  "siteAddress": "新北市三重區龍濱路206號",
  "shiftTypes": {
    "A": {
      "name": "日班",
      "timeRange": "07:00~19:00",
      "hours": 12,
      "color": "#4f46e5"
    }
  },
  "projectTitle": "天泰三總 現場執勤表",
  "companyName": "飛龍保全",
  "corpName": "中華飛龍物業",
  "yearRoc": 115,
  "yearAd": 2026,
  "month": 10,
  "daysInMonth": 31,
  "dailyTargetHours": {
    "1": 12,
    "2": 12,
    "3": 12,
    "4": 12,
    "5": 12,
    "6": 12,
    "7": 12,
    "8": 12,
    "9": 12,
    "10": 12,
    "11": 12,
    "12": 12,
    "13": 12,
    "14": 12,
    "15": 12,
    "16": 12,
    "17": 12,
    "18": 12,
    "19": 12,
    "20": 12,
    "21": 12,
    "22": 12,
    "23": 12,
    "24": 12,
    "25": 12,
    "26": 12,
    "27": 12,
    "28": 12,
    "29": 12,
    "30": 12,
    "31": 12
  },
  "totalTargetHours": 372,
  "guards": [
    {
      "id": "g_1",
      "name": "賴鯤仲",
      "role": "日班",
      "type": "regular",
      "phone": "0965-591-375",
      "targetHours": 240,
      "actualHours": 240,
      "shifts": {
        "1": "A",
        "2": "A",
        "3": "A",
        "5": "A",
        "6": "A",
        "7": "A",
        "8": "A",
        "9": "A",
        "10": "A",
        "11": "A",
        "13": "A",
        "14": "A",
        "15": "A",
        "16": "A",
        "17": "A",
        "18": "A",
        "19": "A",
        "21": "A",
        "22": "A",
        "23": "A",
        "25": "A",
        "26": "A",
        "27": "A",
        "29": "A",
        "30": "A",
        "31": "A"
      },
      "specialNotes": {
        "4": "指定休假",
        "12": "指定休假",
        "20": "指定休假",
        "24": "指定休假",
        "28": "指定休假"
      }
    },
    {
      "id": "g_2",
      "name": "賴鯤仲 (機動)",
      "role": "日機",
      "type": "backup",
      "phone": "0965-591-375",
      "targetHours": 36,
      "actualHours": 36,
      "shifts": {
        "4": "A",
        "24": "A",
        "28": "A"
      },
      "specialNotes": {
        "4": "日機代班",
        "24": "日機代班",
        "28": "日機代班"
      }
    },
    {
      "id": "g_3",
      "name": "馮俊愷",
      "role": "日機",
      "type": "backup",
      "phone": "0906-733-531",
      "targetHours": 84,
      "actualHours": 84,
      "shifts": {
        "12": "A",
        "20": "A"
      },
      "specialNotes": {
        "12": "日機代班",
        "20": "日機代班"
      }
    },
    {
      "id": "g_4",
      "name": "邱顯升",
      "role": "日機",
      "type": "backup",
      "phone": "0928-882-119",
      "targetHours": 12,
      "actualHours": 12,
      "shifts": {},
      "specialNotes": {}
    }
  ]
};
