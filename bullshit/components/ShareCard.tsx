import { forwardRef } from "react";
import type { ConfidenceLevel, SessionResult } from "@/lib/types";
import { CONFIDENCE_TIERS } from "@/lib/types";

function formatShareDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const TEAL = "#0D7A55";
const AMBER = "#A05C00";
const GOLD = "#A07820";
const BG = "#F7F5F0";
const TEXT_PRIMARY = "#0D0D0D";
const TEXT_SECONDARY = "#555555";
const TEXT_MUTED = "#999999";

export const ShareCard = forwardRef<HTMLDivElement, { result: SessionResult }>(
  function ShareCard({ result }, ref) {
    const correctCount = result.results.filter((r) => r.correct).length;

    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 630,
          background: BG,
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        {/* Subtle dot texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.6) 0.5px, transparent 0.5px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: TEXT_PRIMARY,
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "24px 64px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              color: TEXT_PRIMARY,
              fontSize: 44,
              fontWeight: "bold",
              fontFamily: "'Georgia', serif",
              letterSpacing: "-0.01em",
            }}
          >
            Bullshit
          </div>
          <div
            style={{
              color: TEXT_MUTED,
              fontSize: 24,
              fontStyle: "italic",
              fontFamily: "'Georgia', serif",
            }}
          >
            {formatShareDate(result.date)}
          </div>
        </div>

        {/* Thin rule under header */}
        <div
          style={{
            margin: "20px 64px 0",
            height: 1,
            background: "rgba(0,0,0,0.08)",
          }}
        />

        {/* Main content */}
        <div style={{ display: "flex", padding: "28px 64px 0", gap: 64 }}>
          {/* Left: Score column */}
          <div style={{ flex: "0 0 300px" }}>
            <div
              style={{
                color: TEXT_PRIMARY,
                fontSize: 108,
                fontWeight: "bold",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                fontFamily: "'Georgia', serif",
              }}
            >
              {result.totalScore.toLocaleString()}
            </div>
            <div
              style={{
                color: TEXT_MUTED,
                fontSize: 24,
                fontStyle: "italic",
                marginTop: 8,
              }}
            >
              points
            </div>

            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                gap: 48,
              }}
            >
              <div>
                <div
                  style={{
                    color: TEAL,
                    fontSize: 44,
                    fontWeight: "bold",
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {correctCount}
                </div>
                <div
                  style={{
                    color: TEXT_MUTED,
                    fontSize: 18,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  correct
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: GOLD,
                    fontSize: 44,
                    fontWeight: "bold",
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {result.bestStreak}
                </div>
                <div
                  style={{
                    color: TEXT_MUTED,
                    fontSize: 18,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  streak
                </div>
              </div>
            </div>
          </div>

          {/* Right: Round-by-round bars */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingTop: 4,
            }}
          >
            {result.results.map((r, i) => {
              const barWidth = (r.confidence / 5) * 100;
              const color = r.correct ? TEAL : AMBER;
              const label =
                CONFIDENCE_TIERS[r.confidence as ConfidenceLevel]?.label ?? "—";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    height: 68,
                  }}
                >
                  {/* Round number */}
                  <div
                    style={{
                      color: TEXT_MUTED,
                      fontSize: 20,
                      width: 28,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {i + 1}
                  </div>
                  {/* Bar */}
                  <div
                    style={{
                      flex: 1,
                      height: 52,
                      background: "rgba(0,0,0,0.04)",
                      borderRadius: 8,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        background: r.correct
                          ? `linear-gradient(90deg, ${TEAL}, #0a6345)`
                          : `linear-gradient(90deg, ${AMBER}, #8a5200)`,
                        borderRadius: 8,
                        opacity: 0.85,
                      }}
                    />
                    {/* Label inside bar — use top/bottom+flex instead of transform (html2canvas compat) */}
                    <div
                      style={{
                        position: "absolute",
                        left: 16,
                        top: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontSize: 20,
                          fontWeight: "bold",
                          letterSpacing: "0.04em",
                          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                  {/* Result icon */}
                  <div
                    style={{
                      color,
                      fontSize: 28,
                      fontWeight: "bold",
                      width: 32,
                      textAlign: "center",
                    }}
                  >
                    {r.correct ? "✓" : "✗"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 64,
            right: 64,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            paddingTop: 20,
          }}
        >
          <div
            style={{
              color: TEXT_SECONDARY,
              fontSize: 22,
              fontStyle: "italic",
              fontFamily: "'Georgia', serif",
            }}
          >
            I spotted the fake headlines. Can you?
          </div>
          <div
            style={{
              color: TEXT_MUTED,
              fontSize: 22,
              fontFamily: "'Georgia', serif",
            }}
          >
            playbullshit.com
          </div>
        </div>
      </div>
    );
  },
);
