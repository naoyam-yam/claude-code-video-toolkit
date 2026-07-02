import type { Question } from "../../lib/questions/schema";

/**
 * Original, AI-drafted sample questions for 一級建築士法規 (first-class
 * architect qualification, building-law subject). None of this text is
 * copied from any past exam — each item restates a legal concept in a
 * fresh scenario per HOKIRU's rights policy (see docs/product/hokiru-web-spec.md).
 *
 * supervisionStatus is "unsupervised" until a licensed 一級建築士 actually
 * reviews it — canPublishQuestion() will correctly withhold these from
 * public UI until reviewedBy/lastReviewedAt are set.
 */
export const originalSampleQuestions: Question[] = [
  {
    questionId: "sample-001",
    qualification: "ikkyu-kenchikushi",
    subject: "建築基準法",
    topic: "用途地域と容積率",
    difficulty: "medium",
    questionText:
      "第一種住居地域内にある敷地(前面道路幅員6m)に建築物を計画する場合の容積率の考え方として、最も適切なものはどれか。",
    choices: [
      "指定容積率と前面道路幅員による容積率制限のうち、いずれか小さい方が適用される",
      "指定容積率のみが適用され、前面道路幅員は考慮しない",
      "前面道路幅員による容積率制限のみが適用される",
      "指定容積率と前面道路幅員による容積率制限のうち、いずれか大きい方が適用される",
    ],
    correctChoice: 0,
    explanation:
      "容積率は、都市計画で定められた指定容積率と、前面道路幅員に基づく容積率制限とを比較し、小さい方の数値が適用される。",
    legalBasis: "建築基準法第52条",
    legalReference: "建築基準法第52条第2項",
    sourceType: "ai_generated",
    rightsStatus: "original_ai_generated",
    supervisionStatus: "unsupervised",
    createdBy: "claude-nightly-run",
    reviewedBy: null,
    lastReviewedAt: null,
  },
  {
    questionId: "sample-002",
    qualification: "ikkyu-kenchikushi",
    subject: "建築基準法",
    topic: "避難規定",
    difficulty: "medium",
    questionText:
      "劇場の客席から屋外への避難に関する二方向避難の考え方として、最も適切なものはどれか。",
    choices: [
      "居室の各部分から異なる方向にある2以上の避難経路を確保しなければならない",
      "1つの避難経路の幅員を2倍確保すれば二方向避難の要件を満たす",
      "避難経路は1つで足り、その幅員のみが規制対象となる",
      "二方向避難は劇場には適用されない",
    ],
    correctChoice: 0,
    explanation:
      "二方向避難は、一の避難経路が塞がれても別方向への避難が可能となるよう、異なる方向の複数経路を確保する考え方である。",
    legalBasis: "建築基準法施行令第120条・第121条",
    legalReference: "建築基準法施行令第120条",
    sourceType: "ai_generated",
    rightsStatus: "original_ai_generated",
    supervisionStatus: "unsupervised",
    createdBy: "claude-nightly-run",
    reviewedBy: null,
    lastReviewedAt: null,
  },
  {
    questionId: "sample-003",
    qualification: "ikkyu-kenchikushi",
    subject: "建築基準法",
    topic: "防火・耐火",
    difficulty: "hard",
    questionText:
      "防火地域内にある3階建て、延べ面積600㎡の事務所建築物に求められる構造として、最も適切なものはどれか。",
    choices: [
      "耐火建築物又はこれと同等以上の延焼防止性能を有する建築物としなければならない",
      "準耐火建築物であれば足りる",
      "防火地域内であっても階数と面積次第では無指定でよい",
      "外壁を防火構造とすれば足りる",
    ],
    correctChoice: 0,
    explanation:
      "防火地域内では、階数や延べ面積に応じて耐火建築物又は延焼防止性能同等以上の建築物とすることが求められる。",
    legalBasis: "建築基準法第61条",
    legalReference: "建築基準法第61条",
    sourceType: "ai_generated",
    rightsStatus: "original_ai_generated",
    supervisionStatus: "unsupervised",
    createdBy: "claude-nightly-run",
    reviewedBy: null,
    lastReviewedAt: null,
  },
  {
    questionId: "sample-004",
    qualification: "ikkyu-kenchikushi",
    subject: "建築基準法",
    topic: "建築確認",
    difficulty: "easy",
    questionText:
      "建築確認申請が必要となる行為として、最も適切なものはどれか。",
    choices: [
      "都市計画区域内で、建築物を新築する場合",
      "建築物の内部の壁紙のみを張り替える場合",
      "既存の家具を交換する場合",
      "敷地内の植栽を入れ替える場合",
    ],
    correctChoice: 0,
    explanation:
      "都市計画区域内等における建築物の新築・増築・改築・移転等は、原則として建築確認の対象となる。",
    legalBasis: "建築基準法第6条",
    legalReference: "建築基準法第6条第1項",
    sourceType: "ai_generated",
    rightsStatus: "original_ai_generated",
    supervisionStatus: "unsupervised",
    createdBy: "claude-nightly-run",
    reviewedBy: null,
    lastReviewedAt: null,
  },
  {
    questionId: "sample-005",
    qualification: "ikkyu-kenchikushi",
    subject: "建築基準法",
    topic: "道路と接道義務",
    difficulty: "medium",
    questionText:
      "建築物の敷地が満たすべき接道義務の原則として、最も適切なものはどれか。",
    choices: [
      "敷地は原則として幅員4m以上の道路に2m以上接していなければならない",
      "敷地は道路に接していなくても建築確認を受ければ問題ない",
      "接道義務は防火地域内の建築物にのみ適用される",
      "接道義務は階数が3以上の建築物にのみ適用される",
    ],
    correctChoice: 0,
    explanation:
      "都市計画区域内等の建築物の敷地は、原則として幅員4m以上の道路に2m以上接する必要がある(接道義務)。",
    legalBasis: "建築基準法第43条",
    legalReference: "建築基準法第43条第1項",
    sourceType: "ai_generated",
    rightsStatus: "original_ai_generated",
    supervisionStatus: "unsupervised",
    createdBy: "claude-nightly-run",
    reviewedBy: null,
    lastReviewedAt: null,
  },
  {
    questionId: "internal-ref-001",
    qualification: "ikkyu-kenchikushi",
    subject: "建築基準法",
    topic: "内部検討用メモ(非公開)",
    difficulty: "medium",
    questionText:
      "[内部参照専用] 過去の出題傾向を分析するための社内メモ。公開UIには絶対に出さない。",
    choices: ["N/A", "N/A", "N/A", "N/A"],
    correctChoice: 0,
    explanation: "internal_reference_only はデータ生成時の分析専用であり、rights gate により公開経路から除外される。",
    legalBasis: "N/A",
    legalReference: "N/A",
    sourceType: "human_authored",
    rightsStatus: "internal_reference_only",
    supervisionStatus: "unsupervised",
    createdBy: "internal",
    reviewedBy: null,
    lastReviewedAt: null,
  },
];
