import type React from "react";
import { ENTITY } from "../../constants";
import type { HAServiceData, HAStatesMap } from "../../models/ha";
import { IconHome } from "../icons/icons";

interface Props {
  states: HAStatesMap;
  callHAService: (
    domain: string,
    service: string,
    serviceData: HAServiceData,
  ) => void;
}

export const AirQualitySection: React.FC<Props> = ({
  states,
  callHAService,
}) => {
  return (
    <section className="dashboard-section" id="sec-air">
      <div className="section-header bg-hazard-stripes">
        <div className="section-title-wrap">
          <span className="sec-index">
            <IconHome />
          </span>
          <h2 className="sec-title">AIR QUALITY & ATMOSPHERE</h2>
        </div>
        <div className="sec-tag">PROTOCOL_CORE</div>
      </div>

      <div className="cards-grid">
        <article className="ef-card air-quality-card bg-dot-matrix">
          <div
            className={`ef-accent-bar ${states[ENTITY.PURIFIER]?.state === "on" ? "active" : ""}`}
          >
            <div className="bar-pink"></div>
            <div className="bar-green"></div>
            <div className="bar-yellow"></div>
          </div>
          <div className="card-inner air-quality-inner">
            {/* LEFT COLUMN: Purifier */}
            <div className="air-col-left">
              <div className="card-top">
                <div
                  className="icon-box fan-icon-anim"
                  style={{
                    animation:
                      states[ENTITY.PURIFIER]?.state === "on"
                        ? "spin 3s linear infinite"
                        : "none",
                  }}
                >
                  <svg className="entity-icon" viewBox="0 0 24 24">
                    <title>Purifier</title>
                    <path
                      fill="currentColor"
                      d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"
                    />
                  </svg>
                </div>
                <div className="entity-info">
                  <div className="entity-name">Core 300S Air Purifier</div>
                  <div className="entity-id">{ENTITY.PURIFIER}</div>
                </div>
                <label className="ef-switch">
                  <input
                    type="checkbox"
                    checked={states[ENTITY.PURIFIER]?.state === "on"}
                    onChange={(e) =>
                      callHAService(
                        "fan",
                        e.target.checked ? "turn_on" : "turn_off",
                        { entity_id: ENTITY.PURIFIER },
                      )
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preset-modes">
                <span className="preset-label">PRESET MODE:</span>
                <div className="mode-buttons">
                  {["auto", "sleep", "favorite"].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      className={`mode-btn ${states[ENTITY.PURIFIER]?.attributes?.preset_mode === mode ? "active" : ""}`}
                      onClick={() =>
                        callHAService("fan", "set_preset_mode", {
                          entity_id: ENTITY.PURIFIER,
                          preset_mode: mode,
                        })
                      }
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="progress-bar-container"
                style={{
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px dashed #333",
                }}
              >
                <div className="progress-info">
                  <span>FILTER HEALTH</span>
                  <span className="progress-pct">
                    {states[ENTITY.FILTER]?.state || "0"}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${states[ENTITY.FILTER]?.state || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="air-divider"></div>

            {/* RIGHT COLUMN: PM 2.5 Graph */}
            <div className="air-col-right">
              <div className="card-top">
                <div className="icon-box text-green">
                  <svg
                    className="entity-icon"
                    viewBox="0 0 24 24"
                    style={{ color: "#00FF9A" }}
                  >
                    <title>PM 2.5</title>
                    <path
                      fill="currentColor"
                      d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
                    />
                  </svg>
                </div>
                <div className="entity-info">
                  <div className="entity-name">PM 2.5 Index</div>
                  <div className="entity-id">{ENTITY.PM25}</div>
                </div>
                <div className="tech-badge badge-good">OPTIMAL</div>
              </div>

              <div className="metric-display">
                <span className="metric-big">
                  {states[ENTITY.PM25]?.state || "--"}
                </span>
                <span className="metric-unit">µg/m³</span>
              </div>

              <div className="sparkline-wrap">
                <svg className="sparkline-chart" viewBox="0 0 200 40">
                  <title>Sparkline</title>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FF9A" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00FF9A" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,35 Q30,25 60,30 T120,15 T180,22 L200,10 L200,40 L0,40 Z"
                    fill="url(#chartGrad)"
                  />
                  <path
                    d="M0,35 Q30,25 60,30 T120,15 T180,22 L200,10"
                    fill="none"
                    stroke="#00FF9A"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
