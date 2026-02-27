import { useState, useRef, useCallback } from "react";

// ============================================================
// RECORD TRACER — RECOMMENDED FIXES
// Organized by priority from the Board Assessment
// ============================================================

// ============================================================
// COLOR SYSTEM (matches existing Record Tracer light/professional theme)
// ============================================================
const THEME = {
  bg: "#ffffff",
  bgWarm: "#faf8f5",
  bgCard: "#ffffff",
  bgDark: "#1a2332",
  bgDarkMid: "#243447",
  accent: "#c8952e",
  accentLight: "#d4a843",
  accentDim: "rgba(200, 149, 46, 0.1)",
  accentBorder: "rgba(200, 149, 46, 0.3)",
  navy: "#1a2332",
  navyMid: "#2c3e50",
  text: "#333333",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  warning: "#d97706",
  warningBg: "#fffbeb",
  warningBorder: "#fde68a",
  success: "#059669",
  successBg: "#ecfdf5",
  successBorder: "#a7f3d0",
  info: "#2563eb",
  infoBg: "#eff6ff",
  infoBorder: "#bfdbfe",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
};

// ============================================================
// FIX #1: RESTRUCTURED AI SUBJECT BRIEFING
// Priority: CRITICAL — dense paragraph → structured sections
// ============================================================

const FLAG_TYPES = {
  red: {
    color: THEME.danger,
    bg: THEME.dangerBg,
    border: THEME.dangerBorder,
    icon: "🔴",
    label: "Investigate",
  },
  yellow: {
    color: THEME.warning,
    bg: THEME.warningBg,
    border: THEME.warningBorder,
    icon: "🟡",
    label: "Notable",
  },
  green: {
    color: THEME.success,
    bg: THEME.successBg,
    border: THEME.successBorder,
    icon: "🟢",
    label: "Routine",
  },
  blue: {
    color: THEME.info,
    bg: THEME.infoBg,
    border: THEME.infoBorder,
    icon: "🔵",
    label: "Context",
  },
};

const AISubjectBriefing = ({ data }) => {
  const [expandedSections, setExpandedSections] = useState({
    findings: true,
    steps: true,
    angles: false,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Sample data structure — replace with your actual API response
  const briefing = data || {
    subjectName: "Bernie Jacques",
    state: "Florida",
    totalRecords: 34,
    totalDatabases: 3,
    riskLevel: "elevated", // low | moderate | elevated | high
    summary:
      "Bernie Jacques appears in 34 public records across 3 databases. The most notable findings are 13 offshore entity records that may warrant investigation, alongside 11 political donations and 9 federal court cases. The offshore entities require verification to confirm they belong to this individual.",
    findings: [
      {
        flag: "red",
        title: "13 Offshore Leaks Records",
        detail:
          "Entities include Bernie Productions Inc. and Bernie Construction Machine Co., Ltd. These international holdings require verification — they may belong to a different individual with the same name.",
        database: "ICIJ Offshore Leaks",
        actionable: true,
      },
      {
        flag: "yellow",
        title: "9 Federal Court Cases",
        detail:
          "Includes appellate matters such as Koester v. American Republic Investments. Involvement spans the Eighth Circuit and Mississippi Supreme Court litigation.",
        database: "Federal Court Records",
        actionable: true,
      },
      {
        flag: "green",
        title: "11 FEC Campaign Donations",
        detail:
          "Series of political contributions totaling approximately $250 to ActBlue in mid-2024. Amounts are below reporting thresholds requiring detailed disclosure.",
        database: "FEC Campaign Finance",
        actionable: false,
      },
    ],
    nextSteps: [
      "Cross-reference offshore entity incorporation dates with the subject's financial disclosures to determine ownership",
      "Investigate the specific nature of involvement in Eighth Circuit and Mississippi Supreme Court litigation",
      "Verify whether offshore entities (Bernie Productions Inc., Bernie Construction Machine Co., Ltd.) belong to this Florida-based individual or a namesake",
      "Review FEC donation patterns for connections to any candidates or PACs involved in the court cases",
    ],
    storyAngles: [
      {
        angle: "Offshore Holdings Investigation",
        description:
          "Does a Florida-based individual with federal court involvement also maintain undisclosed offshore business entities? Are these entities reported on required financial disclosures?",
        difficulty: "Advanced",
      },
      {
        angle: "Court Case Pattern Analysis",
        description:
          "Nine federal court cases suggest either significant litigation activity or involvement as a party in complex disputes. Is there a common thread — business disputes, regulatory matters, civil claims?",
        difficulty: "Intermediate",
      },
      {
        angle: "Political Donation Network",
        description:
          "While individual donation amounts are small, cross-referencing donor networks could reveal connections to larger political funding patterns in Florida.",
        difficulty: "Beginner",
      },
    ],
  };

  const riskColors = {
    low: { color: THEME.success, bg: THEME.successBg, label: "Low" },
    moderate: { color: THEME.info, bg: THEME.infoBg, label: "Moderate" },
    elevated: { color: THEME.warning, bg: THEME.warningBg, label: "Elevated" },
    high: { color: THEME.danger, bg: THEME.dangerBg, label: "High" },
  };
  const risk = riskColors[briefing.riskLevel] || riskColors.moderate;

  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    cursor: "pointer",
    borderBottom: `1px solid ${THEME.borderLight}`,
    userSelect: "none",
    transition: "background 0.15s ease",
  };

  return (
    <div
      style={{
        border: `1px solid ${THEME.accentBorder}`,
        borderRadius: "12px",
        overflow: "hidden",
        background: THEME.bg,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        fontFamily:
          "'Georgia', 'Times New Roman', serif",
        maxWidth: "900px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.bgWarm}, #fff8ee)`,
          padding: "20px 24px",
          borderBottom: `1px solid ${THEME.accentBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>✨</span>
          <div>
            <h3
              style={{
                color: THEME.accent,
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                margin: 0,
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              AI Subject Briefing
            </h3>
            <p
              style={{
                color: THEME.textMuted,
                fontSize: "12px",
                margin: "2px 0 0 0",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              Deep Research Analyst — {briefing.totalRecords} records across{" "}
              {briefing.totalDatabases} databases
            </p>
          </div>
        </div>

        {/* Risk indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "20px",
            background: risk.bg,
            border: `1px solid ${risk.color}33`,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: risk.color,
            }}
          />
          <span
            style={{
              color: risk.color,
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "'Inter', 'Helvetica', sans-serif",
            }}
          >
            {risk.label} Interest
          </span>
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${THEME.border}` }}>
        <p
          style={{
            color: THEME.text,
            fontSize: "15px",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {briefing.summary}
        </p>
      </div>

      {/* Key Findings */}
      <div>
        <div
          style={sectionHeaderStyle}
          onClick={() => toggleSection("findings")}
        >
          <span
            style={{
              color: THEME.text,
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Inter', 'Helvetica', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔍 Key Findings
            <span
              style={{
                background: THEME.accentDim,
                color: THEME.accent,
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              {briefing.findings.length}
            </span>
          </span>
          <span
            style={{
              color: THEME.textLight,
              fontSize: "18px",
              transform: expandedSections.findings ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          >
            ▾
          </span>
        </div>

        {expandedSections.findings && (
          <div style={{ padding: "16px 24px" }}>
            {briefing.findings.map((finding, i) => {
              const flag = FLAG_TYPES[finding.flag];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "14px",
                    padding: "16px",
                    marginBottom: i < briefing.findings.length - 1 ? "12px" : 0,
                    borderRadius: "10px",
                    background: flag.bg,
                    border: `1px solid ${flag.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      paddingTop: "2px",
                      minWidth: "36px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{flag.icon}</span>
                    <span
                      style={{
                        fontSize: "9px",
                        color: flag.color,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontFamily: "'Inter', 'Helvetica', sans-serif",
                      }}
                    >
                      {flag.label}
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <h4
                        style={{
                          color: THEME.text,
                          fontSize: "14px",
                          fontWeight: 700,
                          margin: 0,
                          fontFamily: "'Inter', 'Helvetica', sans-serif",
                        }}
                      >
                        {finding.title}
                      </h4>
                      <span
                        style={{
                          fontSize: "11px",
                          color: THEME.textLight,
                          background: THEME.borderLight,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontFamily: "'Inter', 'Helvetica', sans-serif",
                        }}
                      >
                        {finding.database}
                      </span>
                    </div>
                    <p
                      style={{
                        color: THEME.text,
                        fontSize: "13px",
                        lineHeight: 1.6,
                        margin: 0,
                        opacity: 0.85,
                      }}
                    >
                      {finding.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Next Steps */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection("steps")}>
          <span
            style={{
              color: THEME.text,
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Inter', 'Helvetica', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ✅ Recommended Next Steps
          </span>
          <span
            style={{
              color: THEME.textLight,
              fontSize: "18px",
              transform: expandedSections.steps ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          >
            ▾
          </span>
        </div>

        {expandedSections.steps && (
          <div style={{ padding: "16px 24px" }}>
            {briefing.nextSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "10px 0",
                  borderBottom:
                    i < briefing.nextSteps.length - 1
                      ? `1px solid ${THEME.borderLight}`
                      : "none",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: THEME.accentDim,
                    border: `1px solid ${THEME.accentBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: THEME.accent,
                    flexShrink: 0,
                    marginTop: "2px",
                    fontFamily: "'Inter', 'Helvetica', sans-serif",
                  }}
                >
                  {i + 1}
                </div>
                <p
                  style={{
                    color: THEME.text,
                    fontSize: "13px",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Story Angles */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection("angles")}>
          <span
            style={{
              color: THEME.text,
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Inter', 'Helvetica', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📰 Story Angles
            <span
              style={{
                background: THEME.infoBg,
                color: THEME.info,
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: 600,
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              NEW
            </span>
          </span>
          <span
            style={{
              color: THEME.textLight,
              fontSize: "18px",
              transform: expandedSections.angles ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          >
            ▾
          </span>
        </div>

        {expandedSections.angles && (
          <div style={{ padding: "16px 24px" }}>
            {briefing.storyAngles.map((angle, i) => {
              const difficultyColors = {
                Beginner: { color: THEME.success, bg: THEME.successBg },
                Intermediate: { color: THEME.warning, bg: THEME.warningBg },
                Advanced: { color: THEME.danger, bg: THEME.dangerBg },
              };
              const diff = difficultyColors[angle.difficulty] || difficultyColors.Intermediate;

              return (
                <div
                  key={i}
                  style={{
                    padding: "16px",
                    marginBottom: i < briefing.storyAngles.length - 1 ? "12px" : 0,
                    borderRadius: "10px",
                    border: `1px solid ${THEME.border}`,
                    background: THEME.bgWarm,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <h4
                      style={{
                        color: THEME.text,
                        fontSize: "14px",
                        fontWeight: 700,
                        margin: 0,
                        fontFamily: "'Inter', 'Helvetica', sans-serif",
                      }}
                    >
                      {angle.angle}
                    </h4>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: diff.color,
                        background: diff.bg,
                        padding: "3px 10px",
                        borderRadius: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontFamily: "'Inter', 'Helvetica', sans-serif",
                      }}
                    >
                      {angle.difficulty}
                    </span>
                  </div>
                  <p
                    style={{
                      color: THEME.textMuted,
                      fontSize: "13px",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {angle.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: `1px solid ${THEME.border}`,
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          background: THEME.bgWarm,
        }}
      >
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: `1px solid ${THEME.accent}`,
            background: THEME.accent,
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          📄 Export Briefing as PDF
        </button>
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: `1px solid ${THEME.border}`,
            background: THEME.bg,
            color: THEME.text,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          🔗 Copy Shareable Link
        </button>
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: `1px solid ${THEME.border}`,
            background: THEME.bg,
            color: THEME.text,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          📁 Save to Investigation
        </button>
      </div>
    </div>
  );
};

// ============================================================
// FIX #2: NAME MATCH CONFIDENCE INDICATOR
// Priority: CRITICAL — incorrect matches have legal consequences
// ============================================================

const MATCH_LEVELS = {
  exact: {
    label: "Exact Match",
    color: THEME.success,
    bg: THEME.successBg,
    border: THEME.successBorder,
    icon: "✓",
    description: "Name matches exactly as searched",
  },
  likely: {
    label: "Likely Match",
    color: THEME.info,
    bg: THEME.infoBg,
    border: THEME.infoBorder,
    icon: "≈",
    description: "Name variant detected — likely the same individual",
  },
  possible: {
    label: "Possible Match",
    color: THEME.warning,
    bg: THEME.warningBg,
    border: THEME.warningBorder,
    icon: "?",
    description: "Similar name found — independent verification required",
  },
  weak: {
    label: "Weak Match",
    color: THEME.danger,
    bg: THEME.dangerBg,
    border: THEME.dangerBorder,
    icon: "!",
    description: "Low confidence — may be a different individual entirely",
  },
};

const NameMatchIndicator = ({ searchedName, returnedName, confidence, source }) => {
  const [showDetail, setShowDetail] = useState(false);
  const match = MATCH_LEVELS[confidence] || MATCH_LEVELS.possible;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        onClick={() => setShowDetail(!showDetail)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: "6px",
          background: match.bg,
          border: `1px solid ${match.border}`,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <span
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: match.color,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          {match.icon}
        </span>
        <span
          style={{
            color: match.color,
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          {match.label}
        </span>
        <span
          style={{
            color: THEME.textLight,
            fontSize: "14px",
            transform: showDetail ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        >
          ▾
        </span>
      </div>

      {showDetail && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 10,
            width: "340px",
            background: THEME.bg,
            border: `1px solid ${THEME.border}`,
            borderRadius: "10px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            padding: "16px",
          }}
        >
          <p
            style={{
              color: THEME.textMuted,
              fontSize: "12px",
              margin: "0 0 12px 0",
              fontFamily: "'Inter', 'Helvetica', sans-serif",
            }}
          >
            {match.description}
          </p>

          <div
            style={{
              background: THEME.borderLight,
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div>
                <p
                  style={{
                    color: THEME.textLight,
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    margin: "0 0 2px 0",
                    fontFamily: "'Inter', 'Helvetica', sans-serif",
                  }}
                >
                  You Searched
                </p>
                <p
                  style={{
                    color: THEME.text,
                    fontSize: "14px",
                    fontWeight: 600,
                    margin: 0,
                    fontFamily: "'Inter', 'Helvetica', sans-serif",
                  }}
                >
                  {searchedName}
                </p>
              </div>
              <div style={{ fontSize: "20px", color: THEME.textLight, alignSelf: "center" }}>
                →
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    color: THEME.textLight,
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    margin: "0 0 2px 0",
                    fontFamily: "'Inter', 'Helvetica', sans-serif",
                  }}
                >
                  Record Found
                </p>
                <p
                  style={{
                    color: THEME.text,
                    fontSize: "14px",
                    fontWeight: 600,
                    margin: 0,
                    fontFamily: "'Inter', 'Helvetica', sans-serif",
                  }}
                >
                  {returnedName}
                </p>
              </div>
            </div>
            <p
              style={{
                color: THEME.textLight,
                fontSize: "11px",
                margin: 0,
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              Source: {source}
            </p>
          </div>

          {confidence !== "exact" && (
            <div
              style={{
                background: THEME.warningBg,
                border: `1px solid ${THEME.warningBorder}`,
                borderRadius: "6px",
                padding: "10px 12px",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "14px", marginTop: "1px" }}>⚠️</span>
              <p
                style={{
                  color: THEME.warning,
                  fontSize: "12px",
                  lineHeight: 1.5,
                  margin: 0,
                  fontFamily: "'Inter', 'Helvetica', sans-serif",
                }}
              >
                Verify this match independently before publishing. Name
                variants may refer to different individuals.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// FIX #3: CONTACT INTELLIGENCE — CLEANED UP DATA FORMATTING
// Priority: HIGH — raw database formatting feels like data dump
// ============================================================

const formatName = (rawName) => {
  // Convert "BERNIER, JACQUES" → "Jacques Bernier"
  if (!rawName) return "";
  const parts = rawName.split(",").map((p) => p.trim());
  if (parts.length === 2) {
    return parts
      .reverse()
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ");
  }
  return rawName
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
};

const formatAddress = (rawAddress) => {
  if (!rawAddress) return "";
  // Convert "8709 NOTTINGHAM POINTE WAY, FT MYERS, FL, 33912" to title case
  return rawAddress
    .split(" ")
    .map((word) => {
      // Keep state abbreviations uppercase
      if (word.length === 2 && /^[A-Z]{2}$/.test(word)) return word;
      // Keep zip codes as-is
      if (/^\d{5}(-\d{4})?$/.test(word.replace(",", ""))) return word.replace(",", "");
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/,\s*/g, ", ");
};

const formatEmployment = (rawEmployment) => {
  if (!rawEmployment || rawEmployment === "NOT EMPLOYED" || rawEmployment === "NONE" || rawEmployment === "N/A") {
    return null; // Return null so we can display "Not listed" instead
  }
  return rawEmployment.charAt(0).toUpperCase() + rawEmployment.slice(1).toLowerCase();
};

const ContactIntelligenceCard = ({ contact }) => {
  const data = contact || {
    rawName: "BERNIER, JACQUES",
    searchedName: "Bernie Jacques",
    source: "FEC Contribution Filing",
    rawAddress: "8709 NOTTINGHAM POINTE WAY, FT MYERS, FL, 33912",
    rawEmployer: "NOT EMPLOYED",
    rawOccupation: "NOT EMPLOYED",
    matchConfidence: "likely",
  };

  const formattedName = formatName(data.rawName);
  const formattedAddress = formatAddress(data.rawAddress);
  const formattedEmployer = formatEmployment(data.rawEmployer);

  return (
    <div
      style={{
        border: `1px solid ${THEME.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        background: THEME.bg,
        maxWidth: "900px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${THEME.borderLight}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              color: THEME.textLight,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontFamily: "'Inter', 'Helvetica', sans-serif",
            }}
          >
            📞 Contact Intelligence
          </span>
          <span
            style={{
              color: THEME.textLight,
              fontSize: "12px",
              fontFamily: "'Inter', 'Helvetica', sans-serif",
            }}
          >
            · 1 source
          </span>
        </div>
        <NameMatchIndicator
          searchedName={data.searchedName}
          returnedName={data.rawName}
          confidence={data.matchConfidence}
          source={data.source}
        />
      </div>

      {/* Contact details - cleaned up */}
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: THEME.accentDim,
              border: `1px solid ${THEME.accentBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            👤
          </div>
          <div>
            <h3
              style={{
                color: THEME.text,
                fontSize: "18px",
                fontWeight: 700,
                margin: "0 0 2px 0",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              {formattedName}
            </h3>
            <p
              style={{
                color: THEME.textLight,
                fontSize: "12px",
                margin: 0,
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              via {data.source}
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "12px",
          }}
        >
          {/* Address */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              background: THEME.bgWarm,
              border: `1px solid ${THEME.borderLight}`,
            }}
          >
            <p
              style={{
                color: THEME.textLight,
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                margin: "0 0 4px 0",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              Address (from filing)
            </p>
            <p
              style={{
                color: THEME.text,
                fontSize: "14px",
                margin: 0,
                lineHeight: 1.4,
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              {formattedAddress || "Not available"}
            </p>
          </div>

          {/* Employment */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              background: THEME.bgWarm,
              border: `1px solid ${THEME.borderLight}`,
            }}
          >
            <p
              style={{
                color: THEME.textLight,
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                margin: "0 0 4px 0",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              Employment (self-reported)
            </p>
            <p
              style={{
                color: formattedEmployer ? THEME.text : THEME.textLight,
                fontSize: "14px",
                margin: 0,
                fontStyle: formattedEmployer ? "normal" : "italic",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              {formattedEmployer || "Not listed in filing"}
            </p>
          </div>
        </div>

        {/* Source disclaimer */}
        <p
          style={{
            color: THEME.textLight,
            fontSize: "11px",
            margin: "12px 0 0 0",
            fontStyle: "italic",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          Contact details sourced from public filings. Accuracy depends on
          information provided at time of filing. Verify before use.
        </p>
      </div>
    </div>
  );
};

// ============================================================
// FIX #4: ENHANCED DASHBOARD WITH SEARCH PREVIEWS
// Priority: MEDIUM — flat list → scannable, informative entries
// ============================================================

const DashboardSearchItem = ({ search }) => {
  const [hovered, setHovered] = useState(false);

  const riskDots = {
    low: THEME.success,
    moderate: THEME.info,
    elevated: THEME.warning,
    high: THEME.danger,
  };
  const dotColor = riskDots[search.riskLevel] || riskDots.moderate;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "16px 20px",
        border: `1px solid ${hovered ? THEME.accentBorder : THEME.border}`,
        borderRadius: "10px",
        background: hovered ? THEME.bgWarm : THEME.bg,
        cursor: "pointer",
        transition: "all 0.15s ease",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: dotColor,
              flexShrink: 0,
            }}
          />
          <h3
            style={{
              color: THEME.text,
              fontSize: "16px",
              fontWeight: 700,
              margin: 0,
              fontFamily: "'Inter', 'Helvetica', sans-serif",
            }}
          >
            {search.name}
          </h3>
        </div>
        <span
          style={{
            color: THEME.textLight,
            fontSize: "12px",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          {search.date}
        </span>
      </div>

      {/* Quick stats line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginLeft: "20px",
        }}
      >
        <span
          style={{
            color: THEME.textMuted,
            fontSize: "13px",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          {search.state}
        </span>
        <span style={{ color: THEME.borderLight }}>·</span>
        <span
          style={{
            color: THEME.textMuted,
            fontSize: "13px",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          {search.databases} database{search.databases !== 1 ? "s" : ""}
        </span>
        <span style={{ color: THEME.borderLight }}>·</span>
        <span
          style={{
            color: THEME.textMuted,
            fontSize: "13px",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
          }}
        >
          {search.totalRecords} record{search.totalRecords !== 1 ? "s" : ""}
        </span>
        {search.flags > 0 && (
          <>
            <span style={{ color: THEME.borderLight }}>·</span>
            <span
              style={{
                color: THEME.danger,
                fontSize: "12px",
                fontWeight: 600,
                background: THEME.dangerBg,
                padding: "1px 8px",
                borderRadius: "4px",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              {search.flags} flag{search.flags !== 1 ? "s" : ""}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// FIX #5: FOUNDING MEMBERS — CLARIFIED TIER LEVEL
// Priority: HIGH — ambiguity costs conversions
// ============================================================

const FoundingMembersClarified = () => {
  const [spotsRemaining] = useState(100);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 24px",
        textAlign: "center",
        fontFamily: "'Inter', 'Helvetica', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: 800,
          color: THEME.navy,
          margin: "0 0 12px 0",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        Be First. Pay Less. Forever.
      </h1>

      <p
        style={{
          color: THEME.textMuted,
          fontSize: "16px",
          lineHeight: 1.6,
          margin: "0 0 8px 0",
        }}
      >
        Lock in{" "}
        <strong style={{ color: THEME.text }}>$49/month for life</strong>{" "}
        — before public launch at $99/month. Only {spotsRemaining} spots
        available.
      </p>

      {/* THIS IS THE KEY CLARIFICATION */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: THEME.successBg,
          border: `1px solid ${THEME.successBorder}`,
          borderRadius: "8px",
          padding: "8px 16px",
          margin: "0 0 28px 0",
        }}
      >
        <span style={{ fontSize: "16px" }}>🎁</span>
        <span
          style={{
            color: THEME.success,
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Full Investigator-tier access ($99 value) at Solo pricing — permanently
        </span>
      </div>

      {/* Counter */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 20px",
          borderRadius: "24px",
          border: `1px solid ${THEME.border}`,
          marginBottom: "28px",
        }}
      >
        <span
          style={{
            color: THEME.accent,
            fontSize: "28px",
            fontWeight: 800,
          }}
        >
          {spotsRemaining}
        </span>
        <span style={{ color: THEME.textMuted, fontSize: "14px" }}>
          of 100 founding member spots remaining
        </span>
      </div>

      {/* What you get - explicit comparison */}
      <div
        style={{
          background: THEME.bgWarm,
          borderRadius: "16px",
          padding: "28px",
          border: `1px solid ${THEME.border}`,
          textAlign: "left",
          marginBottom: "28px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: THEME.text,
            margin: "0 0 16px 0",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          What Founding Members Get
        </h3>

        {[
          {
            feature: "200 searches per month",
            solo: false,
            founding: true,
          },
          {
            feature: "Full public records suite (all databases)",
            solo: false,
            founding: true,
          },
          {
            feature: "Deep Research Analyst (AI briefings)",
            solo: false,
            founding: true,
          },
          {
            feature: "Contact intelligence",
            solo: false,
            founding: true,
          },
          {
            feature: "Priority support",
            solo: false,
            founding: true,
          },
          {
            feature: "Direct input into feature roadmap",
            solo: false,
            founding: true,
          },
          {
            feature: "$49/month locked permanently — never increases",
            solo: false,
            founding: true,
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 0",
              borderBottom:
                i < 6 ? `1px solid ${THEME.borderLight}` : "none",
            }}
          >
            <span
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: THEME.successBg,
                border: `1px solid ${THEME.successBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: THEME.success,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <span style={{ color: THEME.text, fontSize: "14px" }}>
              {item.feature}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        style={{
          width: "100%",
          padding: "18px 32px",
          borderRadius: "10px",
          border: "none",
          background: THEME.navy,
          color: "#fff",
          fontSize: "16px",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: "12px",
          transition: "all 0.2s ease",
        }}
      >
        Claim Your Founding Member Spot — $49/mo
      </button>

      <p style={{ color: THEME.textLight, fontSize: "13px", margin: 0 }}>
        Cancel anytime. Your $49/mo rate stays locked as long as you're
        subscribed.
      </p>
    </div>
  );
};

// ============================================================
// DEMO: All Record Tracer fixes rendered together
// ============================================================
export default function RecordTracerFixes() {
  const sampleSearches = [
    {
      name: "Ken Welch",
      state: "Florida",
      date: "2/25/2026",
      databases: 4,
      totalRecords: 47,
      flags: 2,
      riskLevel: "elevated",
    },
    {
      name: "Gus Bilirakis",
      state: "All States / National",
      date: "2/21/2026",
      databases: 5,
      totalRecords: 128,
      flags: 0,
      riskLevel: "low",
    },
    {
      name: "Michael Tharpe",
      state: "All States / National",
      date: "2/21/2026",
      databases: 3,
      totalRecords: 22,
      flags: 1,
      riskLevel: "moderate",
    },
    {
      name: "Richard Corcoran",
      state: "Florida",
      date: "2/21/2026",
      databases: 6,
      totalRecords: 89,
      flags: 3,
      riskLevel: "high",
    },
    {
      name: "wjfl llc",
      state: "Florida",
      date: "2/21/2026",
      databases: 2,
      totalRecords: 5,
      flags: 0,
      riskLevel: "low",
    },
  ];

  const sectionStyle = {
    padding: "40px 24px",
    borderBottom: `1px solid ${THEME.border}`,
    maxWidth: "960px",
    margin: "0 auto",
  };

  const sectionLabelStyle = {
    textAlign: "center",
    color: THEME.accent,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "3px",
    textTransform: "uppercase",
    margin: "0 0 4px 0",
    fontFamily: "'Inter', 'Helvetica', sans-serif",
  };

  const sectionDescStyle = {
    textAlign: "center",
    color: THEME.textMuted,
    fontSize: "13px",
    margin: "0 0 28px 0",
    fontFamily: "'Inter', 'Helvetica', sans-serif",
  };

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: THEME.bgWarm,
          padding: "16px 24px",
          borderBottom: `1px solid ${THEME.border}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "24px" }}>📜</span>
        <span
          style={{
            color: THEME.navy,
            fontSize: "20px",
            fontWeight: 700,
            fontFamily: "'Georgia', 'Times New Roman', serif",
          }}
        >
          Record Tracer
        </span>
        <span
          style={{
            color: THEME.textLight,
            fontSize: "12px",
            fontFamily: "'Inter', 'Helvetica', sans-serif",
            marginLeft: "auto",
          }}
        >
          Recommended Fixes — Board Assessment
        </span>
      </div>

      {/* Fix #1: Restructured AI Subject Briefing */}
      <div style={sectionStyle}>
        <h2 style={sectionLabelStyle}>
          Fix #1 — Restructured AI Subject Briefing
        </h2>
        <p style={sectionDescStyle}>
          Dense paragraph → Executive Summary, Key Findings with flags,
          Numbered Next Steps, Story Angles with difficulty ratings, and Export
          actions
        </p>
        <AISubjectBriefing />
      </div>

      {/* Fix #2: Name Match Confidence (shown standalone) */}
      <div style={sectionStyle}>
        <h2 style={sectionLabelStyle}>Fix #2 — Name Match Confidence</h2>
        <p style={sectionDescStyle}>
          Click each badge to see the detailed match comparison. Protects
          journalists from publishing incorrect name associations.
        </p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <NameMatchIndicator
            searchedName="Bernie Jacques"
            returnedName="Bernie Jacques"
            confidence="exact"
            source="Florida Corporate Filings"
          />
          <NameMatchIndicator
            searchedName="Bernie Jacques"
            returnedName="BERNIER, JACQUES"
            confidence="likely"
            source="FEC Contribution Filing"
          />
          <NameMatchIndicator
            searchedName="Bernie Jacques"
            returnedName="Bernard P. Jacques"
            confidence="possible"
            source="ICIJ Offshore Leaks"
          />
          <NameMatchIndicator
            searchedName="Bernie Jacques"
            returnedName="B. Jacques LLC"
            confidence="weak"
            source="SEC Filings"
          />
        </div>
      </div>

      {/* Fix #3: Contact Intelligence Cleanup */}
      <div style={sectionStyle}>
        <h2 style={sectionLabelStyle}>
          Fix #3 — Contact Intelligence Data Cleanup
        </h2>
        <p style={sectionDescStyle}>
          ALL CAPS names → proper formatting. "NOT EMPLOYED at NOT EMPLOYED" →
          "Not listed in filing." Raw database output → polished intelligence
          display.
        </p>
        <ContactIntelligenceCard />
      </div>

      {/* Fix #4: Enhanced Dashboard */}
      <div style={sectionStyle}>
        <h2 style={sectionLabelStyle}>
          Fix #4 — Enhanced Dashboard with Search Previews
        </h2>
        <p style={sectionDescStyle}>
          Each search now shows databases hit, record count, flag count, and a
          color-coded risk indicator — no need to re-open every search to
          remember what was found.
        </p>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: "0",
              marginBottom: "20px",
              borderBottom: `2px solid ${THEME.border}`,
            }}
          >
            <button
              style={{
                padding: "12px 20px",
                border: "none",
                background: "none",
                color: THEME.accent,
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                borderBottom: `2px solid ${THEME.accent}`,
                marginBottom: "-2px",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              🕐 Recent Searches
            </button>
            <button
              style={{
                padding: "12px 20px",
                border: "none",
                background: "none",
                color: THEME.textLight,
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
              }}
            >
              📁 My Investigations
            </button>
          </div>

          {sampleSearches.map((search, i) => (
            <DashboardSearchItem key={i} search={search} />
          ))}
        </div>
      </div>

      {/* Fix #5: Founding Members Clarification */}
      <div style={{ ...sectionStyle, borderBottom: "none" }}>
        <h2 style={sectionLabelStyle}>
          Fix #5 — Founding Members Tier Clarification
        </h2>
        <p style={sectionDescStyle}>
          Explicitly states founding members get Investigator-tier access ($99
          value) at the $49 Solo price — permanently. Green callout makes this
          unmissable.
        </p>
        <FoundingMembersClarified />
      </div>
    </div>
  );
}
