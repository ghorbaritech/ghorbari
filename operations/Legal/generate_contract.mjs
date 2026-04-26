import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, WidthType,
  BorderStyle, ShadingType, TableLayoutType,
  VerticalAlign, PageOrientation, convertInchesToTwip,
  Header, Footer, PageNumberElement, NumberFormat,
} from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Colour Palette ────────────────────────────────────────────────────────
const BRAND_DARK   = "1A2E4A";   // deep navy
const BRAND_ACCENT = "E8622A";   // Ghorbari orange
const BRAND_LIGHT  = "EFF4F8";   // light blue-grey fill
const WHITE        = "FFFFFF";
const GREY_LINE    = "D0D5DD";
const TEXT_DARK    = "1D2939";
const TEXT_MID     = "344054";

// ─── Helpers ───────────────────────────────────────────────────────────────
const bold  = (text, size = 22, color = TEXT_DARK) =>
  new TextRun({ text, bold: true, size, color, font: "Kalpurush" });

const normal = (text, size = 20, color = TEXT_DARK) =>
  new TextRun({ text, size, color, font: "Kalpurush" });

const italic = (text, size = 18, color = TEXT_MID) =>
  new TextRun({ text, italics: true, size, color, font: "Kalpurush" });

const thin = { style: BorderStyle.SINGLE, size: 4, color: GREY_LINE };
const noB  = { style: BorderStyle.NONE, size: 0, color: WHITE };

function shaded(color = BRAND_LIGHT) {
  return { fill: color, type: ShadingType.SOLID };
}

function cell(paragraphs, options = {}) {
  return new TableCell({
    children: Array.isArray(paragraphs) ? paragraphs : [paragraphs],
    verticalAlign: VerticalAlign.CENTER,
    shading: options.shading,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    borders: options.noBorder
      ? { top: noB, bottom: noB, left: noB, right: noB }
      : { top: thin, bottom: thin, left: thin, right: thin },
    columnSpan: options.span,
  });
}

function p(runs, alignment = AlignmentType.LEFT, spacing = { before: 40, after: 40 }) {
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [runs],
    alignment,
    spacing,
  });
}

function sectionHeading(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: "  " + text + "  ", bold: true, size: 22, color: WHITE, font: "Kalpurush" }),
    ],
    shading: { fill: BRAND_DARK, type: ShadingType.SOLID },
    spacing: { before: 200, after: 80 },
    alignment: AlignmentType.LEFT,
  });
}

function subHeading(text) {
  return new Paragraph({
    children: [bold(text, 21, BRAND_DARK)],
    spacing: { before: 120, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_ACCENT } },
  });
}

function infoTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: rows.map(([label, field]) =>
      new TableRow({
        children: [
          cell(p(bold(label, 19, TEXT_MID)), { shading: shaded() }),
          cell(p(normal(field || "", 20)), {}),
        ],
        tableHeader: false,
      })
    ),
  });
}

function checkRow(text) {
  return new TableRow({
    children: [
      cell(p([normal("☐  ", 20), normal(text, 20)]), { noBorder: true }),
    ],
  });
}

function checkTable(items) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: noB, bottom: noB, left: noB, right: noB, insideH: noB, insideV: noB },
    rows: items.map(checkRow),
  });
}

function commissionRow(range, comm, partner, isHeader = false) {
  const fill = isHeader ? BRAND_ACCENT : WHITE;
  const textColor = isHeader ? WHITE : TEXT_DARK;
  const sz = isHeader ? 20 : 19;
  return new TableRow({
    tableHeader: isHeader,
    children: [range, comm, partner].map(t =>
      cell(p(new TextRun({ text: t, bold: isHeader, size: sz, color: textColor, font: "Kalpurush" })), {
        shading: shaded(fill),
      })
    ),
  });
}

function signatureTable() {
  const sigBlock = (party, name, role, date) => [
    p(bold(party, 20, BRAND_DARK), AlignmentType.CENTER, { before: 40, after: 60 }),
    p(normal("স্বাক্ষর: _____________________________", 20), AlignmentType.LEFT),
    p(normal(`নাম: ${name}`, 20), AlignmentType.LEFT),
    p(normal(`পদবী: ${role}`, 20), AlignmentType.LEFT),
    p(normal(`তারিখ: ${date}`, 20), AlignmentType.LEFT),
    p(normal("সীল / মোহর:", 20), AlignmentType.LEFT, { before: 40, after: 80 }),
    p(normal("সাক্ষী (Witness):", 20, TEXT_MID), AlignmentType.LEFT),
    p(normal("নাম: _____________________________", 19), AlignmentType.LEFT),
    p(normal("স্বাক্ষর: _________________________", 19), AlignmentType.LEFT),
    p(normal("তারিখ: ___________________________", 19), AlignmentType.LEFT),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          cell(sigBlock("প্রথম পক্ষ — ঘরবাড়ি", "______________________", "______________________", "____ / ____ / ২০____")),
          cell(sigBlock("দ্বিতীয় পক্ষ — পার্টনার", "______________________", "______________________", "____ / ____ / ২০____")),
        ],
      }),
    ],
  });
}

// ─── Document Build ────────────────────────────────────────────────────────
async function buildDoc() {
  const contractNo = new Paragraph({
    children: [italic("চুক্তি নং: GHB/PART/____________    তারিখ: ______ / ______ / ২০______", 19)],
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 160 },
  });

  // ── SECTION 1A – Ghorbari Info ──────────────────────────────────────────
  const sec1aRows = [
    ["প্রতিষ্ঠানের নাম", "ঘরবাড়ি টেকনোলজিস লিমিটেড"],
    ["প্ল্যাটফর্ম", "দালানকোঠা (Dalankotha)"],
    ["প্রতিনিধির নাম", ""],
    ["পদবী", ""],
    ["ই-মেইল", "legal@ghorbari.com"],
  ];

  // ── SECTION 1B – Partner Personal Info ──────────────────────────────────
  const sec1bRows = [
    ["পার্টনারের নাম", ""],
    ["এনআইডি / পাসপোর্ট নম্বর", ""],
    ["জন্ম তারিখ", ""],
    ["মোবাইল নম্বর", ""],
    ["ই-মেইল ঠিকানা", ""],
    ["স্থায়ী ঠিকানা", ""],
    ["বর্তমান ঠিকানা", ""],
  ];

  // ── SECTION 1C – Business Info ──────────────────────────────────────────
  const sec1cRows = [
    ["প্রতিষ্ঠানের নাম / ট্রেড নাম", ""],
    ["ব্যবসার ধরন", "☐ একক মালিকানা   ☐ অংশীদারিত্ব   ☐ লিমিটেড কোম্পানি"],
    ["ট্রেড লাইসেন্স নম্বর", ""],
    ["টিআইএন (TIN) নম্বর", ""],
    ["বিআইএন / ভ্যাট নম্বর", ""],
    ["প্রতিষ্ঠার বছর", ""],
    ["সেবা প্রদানের এলাকা", ""],
    ["অভিজ্ঞতার বছর", ""],
  ];

  // ── SECTION 2 – Services ────────────────────────────────────────────────
  const constructionItems = [
    "নতুন ভবন নির্মাণ (New Construction)",
    "সংস্কার ও পুনর্নির্মাণ (Renovation & Remodelling)",
    "ভবন মেরামত (Structural Repair)",
    "ছাদ ও ওয়াটারপ্রুফিং (Roofing & Waterproofing)",
  ];
  const designItems = [
    "স্থাপত্য ডিজাইন (Architectural Design)",
    "ইন্টেরিয়র ডিজাইন (Interior Design)",
    "কাঠামো প্রকৌশল (Structural Engineering)",
    "সাইট সুপারভিশন (Site Supervision)",
  ];
  const mepItems = [
    "বৈদ্যুতিক স্থাপনা (Electrical Installation)",
    "প্লাম্বিং ও স্যানিটেশন (Plumbing & Sanitation)",
    "এয়ার কন্ডিশনিং / HVAC",
    "সোলার ও নবায়নযোগ্য শক্তি (Solar & Renewable Energy)",
  ];
  const supplyItems = [
    "নির্মাণ সামগ্রী সরবরাহ (Material Supply)",
    "যন্ত্রপাতি ভাড়া (Equipment Rental)",
    "শ্রমিক সরবরাহ (Labour Supply)",
  ];

  // ── SECTION 3 – Payment ─────────────────────────────────────────────────
  const paymentRows = [
    ["☐  ব্যাংক ট্রান্সফার", "ব্যাংক: ________________   অ্যাকাউন্ট নং: _______________________"],
    ["☐  বিকাশ / নগদ / রকেট", "নম্বর: ____________________________________________"],
    ["☐  চেক", "ব্যাংক: ____________________________________________"],
  ];

  // ── SECTION 4 – Documents ───────────────────────────────────────────────
  const docPersonal = [
    "জাতীয় পরিচয়পত্রের (NID) সত্যায়িত কপি",
    "সাম্প্রতিক পাসপোর্ট সাইজ ছবি (২ কপি)",
  ];
  const docBusiness = [
    "বৈধ ট্রেড লাইসেন্সের কপি",
    "টিআইএন সার্টিফিকেটের কপি",
    "ব্যবসায়িক ব্যাংক স্টেটমেন্ট (সর্বশেষ ৩ মাস)",
  ];
  const docPro = [
    "পেশাদার / কারিগরি সনদপত্র (প্রযোজ্য হলে)",
    "BNBC / RAJUK অনুমোদনপত্র (প্রযোজ্য হলে)",
    "পূর্বের ৩টি সম্পন্ন প্রকল্পের রেফারেন্স তালিকা",
    "দায়বদ্ধতা বীমার (Liability Insurance) কপি (প্রযোজ্য হলে)",
  ];

  // ── SECTION 5 – Terms ───────────────────────────────────────────────────
  const terms = [
    "মান নিয়ন্ত্রণ: পার্টনার বাংলাদেশ জাতীয় বিল্ডিং কোড (BNBC) এবং প্রচলিত নিরাপত্তা মানদণ্ড মেনে চলতে বাধ্য থাকবেন।",
    "গোপনীয়তা: ঘরবাড়ির তথ্য, ক্লায়েন্টের ডেটা এবং মূল্য কাঠামো সম্পূর্ণ গোপনীয় রাখতে হবে।",
    "সুনাম রক্ষা: পার্টনার ঘরবাড়ির ব্র্যান্ড ও সুনামের ক্ষতি হয় এমন কোনো কার্যক্রমে অংশ নেবেন না।",
    "চুক্তির মেয়াদ: এই চুক্তি স্বাক্ষরের তারিখ থেকে ১ (এক) বছর পর্যন্ত কার্যকর থাকবে এবং পারস্পরিক সম্মতিতে নবায়নযোগ্য।",
    "চুক্তি বাতিল: যেকোনো পক্ষ ৩০ দিনের লিখিত নোটিশের মাধ্যমে এই চুক্তি বাতিল করতে পারবেন।",
    "বিবাদ নিষ্পত্তি: যেকোনো বিবাদ প্রথমে আলোচনার মাধ্যমে এবং প্রয়োজনে ঢাকার সালিশ আদালতের মাধ্যমে নিষ্পত্তি করা হবে।",
  ];

  // ────────────────────────────────────────────────────────────────────────
  // BUILD DOCUMENT CHILDREN
  // ────────────────────────────────────────────────────────────────────────
  const children = [
    // ── Title block ──
    new Paragraph({
      children: [bold("ঘরবাড়ি প্ল্যাটফর্ম", 36, BRAND_DARK)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
    }),
    new Paragraph({
      children: [bold("পার্টনার অনবোর্ডিং চুক্তিপত্র", 28, BRAND_ACCENT)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
    }),
    new Paragraph({
      children: [italic("Partner Onboarding Agreement", 20, TEXT_MID)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
    }),
    contractNo,

    // ── Section 1 ──
    sectionHeading("ধারা ১ — পক্ষগণের তথ্য  (Party Information)"),

    subHeading("১.১  প্রথম পক্ষ — ঘরবাড়ি"),
    infoTable(sec1aRows),

    subHeading("১.২  দ্বিতীয় পক্ষ — পার্টনার (ব্যক্তিগত তথ্য)"),
    infoTable(sec1bRows),

    subHeading("১.৩  ব্যবসায়িক তথ্য"),
    infoTable(sec1cRows),

    // ── Section 2 ──
    sectionHeading("ধারা ২ — প্রদেয় সেবার তালিকা  (Services Checklist)"),
    p(italic("পার্টনার নিচের সেবাগুলো ঘরবাড়ি প্ল্যাটফর্মের মাধ্যমে প্রদান করতে রাজি আছেন — প্রযোজ্য বিষয়ে ☐ চিহ্ন দিন:", 18), AlignmentType.LEFT, { before: 60, after: 40 }),

    p(bold("নির্মাণ ও অবকাঠামো", 20, BRAND_DARK), AlignmentType.LEFT, { before: 80, after: 20 }),
    checkTable(constructionItems),

    p(bold("ডিজাইন ও পরামর্শ", 20, BRAND_DARK), AlignmentType.LEFT, { before: 80, after: 20 }),
    checkTable(designItems),

    p(bold("ইলেকট্রিক্যাল ও মেকানিক্যাল", 20, BRAND_DARK), AlignmentType.LEFT, { before: 80, after: 20 }),
    checkTable(mepItems),

    p(bold("সরবরাহ ও সম্পদ", 20, BRAND_DARK), AlignmentType.LEFT, { before: 80, after: 20 }),
    checkTable(supplyItems),

    p([bold("অন্যান্য: ", 19), normal("__________________________________________________", 19)], AlignmentType.LEFT, { before: 40, after: 60 }),

    // ── Section 3 ──
    sectionHeading("ধারা ৩ — পেমেন্ট পদ্ধতি ও কমিশন কাঠামো  (Payment & Commission)"),

    subHeading("৩.১  পার্টনারের পেমেন্ট পদ্ধতি"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: paymentRows.map(([method, detail]) =>
        new TableRow({
          children: [
            cell(p(bold(method, 19, TEXT_DARK)), { shading: shaded() }),
            cell(p(normal(detail, 19))),
          ],
        })
      ),
    }),

    subHeading("৩.২  কমিশন কাঠামো"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        commissionRow("সেবার মূল্য পরিসর", "ঘরবাড়ি কমিশন", "পার্টনার প্রাপ্তি", true),
        commissionRow("০ — ৫০,০০০ টাকা", "১৫%", "৮৫%"),
        commissionRow("৫০,০০১ — ২,০০,০০০ টাকা", "১২%", "৮৮%"),
        commissionRow("২,০০,০০১ টাকার উপরে", "১০%", "৯০%"),
      ],
    }),
    p([
      bold("পেমেন্ট সাইকেল: ", 19, BRAND_DARK),
      normal("প্রতিটি প্রকল্প সম্পন্ন ও ক্লায়েন্ট অনুমোদনের ", 19),
      bold("৭ কার্যদিবসের ", 19, BRAND_ACCENT),
      normal("মধ্যে পার্টনারের অ্যাকাউন্টে পেমেন্ট প্রেরণ করা হবে।", 19),
    ], AlignmentType.LEFT, { before: 80, after: 40 }),
    p([
      bold("বিলম্ব জরিমানা: ", 19, BRAND_DARK),
      normal("পার্টনারের দোষে প্রকল্প বিলম্ব হলে প্রতিটি দিনের জন্য চুক্তিকৃত মূল্যের ০.৫% হারে জরিমানা প্রযোজ্য হবে।", 19),
    ], AlignmentType.LEFT, { before: 0, after: 80 }),

    // ── Section 4 ──
    sectionHeading("ধারা ৪ — জমাদানযোগ্য নথিপত্র  (Document Submission Checklist)"),
    p(italic("চুক্তি কার্যকর হওয়ার পূর্বে পার্টনারকে নিচের নথিসমূহ জমা দিতে হবে:", 18), AlignmentType.LEFT, { before: 60, after: 40 }),

    p(bold("ব্যক্তিগত নথি", 20, BRAND_DARK), AlignmentType.LEFT, { before: 80, after: 20 }),
    checkTable(docPersonal),

    p(bold("ব্যবসায়িক নথি", 20, BRAND_DARK), AlignmentType.LEFT, { before: 80, after: 20 }),
    checkTable(docBusiness),

    p(bold("পেশাদার সনদপত্র ও অন্যান্য", 20, BRAND_DARK), AlignmentType.LEFT, { before: 80, after: 20 }),
    checkTable(docPro),

    // ── Section 5 ──
    sectionHeading("ধারা ৫ — সাধারণ শর্তাবলী  (Key Terms & Conditions)"),
    ...terms.map((term, i) =>
      new Paragraph({
        children: [
          bold(`${i + 1}.  `, 19, BRAND_ACCENT),
          normal(term, 19),
        ],
        spacing: { before: 60, after: 40 },
      })
    ),

    // ── Section 6 ──
    sectionHeading("ধারা ৬ — স্বাক্ষর ও ঘোষণা  (Signatures & Declaration)"),
    p([italic("আমরা উভয় পক্ষ এই চুক্তির সমস্ত শর্তাবলী পড়েছি, বুঝেছি এবং স্বেচ্ছায় সম্মতি জানাচ্ছি।", 18)],
      AlignmentType.CENTER, { before: 80, after: 100 }),
    signatureTable(),

    // ── Footer note ──
    new Paragraph({
      children: [italic("এই চুক্তিপত্র বাংলাদেশের প্রচলিত আইন অনুযায়ী প্রণীত ও প্রয়োগযোগ্য।  |  This agreement is governed by the laws of the People's Republic of Bangladesh.", 17, TEXT_MID)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 40 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: GREY_LINE } },
    }),
    p([bold("ঘরবাড়ি টেকনোলজিস লিমিটেড  |  legal@ghorbari.com", 17, BRAND_DARK)],
      AlignmentType.CENTER, { before: 20, after: 0 }),
    p([italic("গোপনীয় নথি — অননুমোদিত বিতরণ নিষিদ্ধ", 16, TEXT_MID)],
      AlignmentType.CENTER, { before: 10, after: 0 }),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Kalpurush", size: 20, color: TEXT_DARK },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top:    convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left:   convertInchesToTwip(0.9),
              right:  convertInchesToTwip(0.9),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "ঘরবাড়ি  —  পার্টনার চুক্তিপত্র", bold: true, size: 18, color: TEXT_MID, font: "Kalpurush" }),
                  new TextRun({ text: "     |     গোপনীয়", size: 18, color: TEXT_MID, font: "Kalpurush" }),
                ],
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GREY_LINE } },
                alignment: AlignmentType.RIGHT,
                spacing: { after: 60 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "পৃষ্ঠা  ", size: 16, color: TEXT_MID, font: "Kalpurush" }),
                  new PageNumberElement(),
                ],
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: GREY_LINE } },
                spacing: { before: 60 },
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "Ghorbari_Partner_Onboarding_Contract_BN.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`✅  Contract saved → ${outPath}`);
}

buildDoc().catch(console.error);
