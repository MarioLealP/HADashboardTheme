import type React from "react";
import { ENTITY } from "../../constants";
import type { HAServiceData, HAStatesMap } from "../../models/ha";
import { IconGameplay } from "../icons/icons";

interface Props {
  states: HAStatesMap;
  callHAService: (
    domain: string,
    service: string,
    serviceData: HAServiceData,
  ) => void;
}

export const LightingSection: React.FC<Props> = ({ states, callHAService }) => {
  return (
    <section className="dashboard-section" id="sec-lighting">
      <div className="section-header bg-hazard-stripes">
        <div className="section-title-wrap">
          <span className="sec-index">
            <IconGameplay />
          </span>
          <h2 className="sec-title">LIGHTING & POWER CONTROL</h2>
        </div>
        <div className="sec-tag">WULING_AIC_HUB</div>
      </div>

      <div className="cards-grid">
        <article className="ef-card light-control-card bg-dot-matrix">
          <div
            className={`ef-accent-bar ${states[ENTITY.MAIN_LIGHT]?.state === "on" ? "active" : ""}`}
          >
            <div className="bar-pink"></div>
            <div className="bar-green"></div>
            <div className="bar-yellow"></div>
          </div>
          <div className="card-inner">
            <div className="card-top">
              <div className="icon-box">
                <svg className="entity-icon" viewBox="0 0 24 24">
                  <title>Light</title>
                  <path
                    fill="currentColor"
                    d="M12 2A7 7 0 0 0 5 9C5 11.38 6.19 13.47 8 14.74V17A1 1 0 0 0 9 18H15A1 1 0 0 0 16 17V14.74C17.81 13.47 19 11.38 19 9A7 7 0 0 0 12 2M9 21A1 1 0 0 0 10 22H14A1 1 0 0 0 15 21V20H9V21Z"
                  />
                </svg>
              </div>
              <div className="entity-info">
                <div className="entity-name">Main Light</div>
                <div className="entity-id">{ENTITY.MAIN_LIGHT}</div>
              </div>
              <label className="ef-switch">
                <input
                  type="checkbox"
                  checked={states[ENTITY.MAIN_LIGHT]?.state === "on"}
                  onChange={(e) =>
                    callHAService(
                      "light",
                      e.target.checked ? "turn_on" : "turn_off",
                      { entity_id: ENTITY.MAIN_LIGHT },
                    )
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="card-controls">
              <div className="slider-group">
                <div className="slider-header">
                  <span>BRIGHTNESS</span>
                  <span className="slider-val">
                    {Math.round(
                      ((states[ENTITY.MAIN_LIGHT]?.attributes?.brightness ||
                        0) /
                        255) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <input
                  type="range"
                  className="ef-range"
                  min="0"
                  max="100"
                  value={Math.round(
                    ((states[ENTITY.MAIN_LIGHT]?.attributes?.brightness || 0) /
                      255) *
                      100,
                  )}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const bright255 = Math.round((val / 100) * 255);
                    callHAService("light", "turn_on", {
                      entity_id: ENTITY.MAIN_LIGHT,
                      brightness: bright255,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </article>

        <article className="ef-card switch-card bg-dot-matrix">
          <div
            className={`ef-accent-bar ${states[ENTITY.SHELF_SWITCH]?.state === "on" ? "active" : ""}`}
          >
            <div className="bar-pink"></div>
            <div className="bar-green"></div>
            <div className="bar-yellow"></div>
          </div>
          <div className="card-inner">
            <div className="card-top">
              <div className="icon-box">
                <svg className="entity-icon" viewBox="0 0 24 24">
                  <title>Light</title>
                  <path
                    fill="currentColor"
                    d="M17 7H7A5 5 0 0 0 2 12A5 5 0 0 0 7 17H17A5 5 0 0 0 22 12A5 5 0 0 0 17 7M7 15A3 3 0 0 1 4 12A3 3 0 0 1 7 9A3 3 0 0 1 10 12A3 3 0 0 1 7 15Z"
                  />
                </svg>
              </div>
              <div className="entity-info">
                <div className="entity-name">Shelf Power Switch</div>
                <div className="entity-id">{ENTITY.SHELF_SWITCH}</div>
              </div>
              <label className="ef-switch">
                <input
                  type="checkbox"
                  checked={states[ENTITY.SHELF_SWITCH]?.state === "on"}
                  onChange={(e) =>
                    callHAService(
                      "switch",
                      e.target.checked ? "turn_on" : "turn_off",
                      { entity_id: ENTITY.SHELF_SWITCH },
                    )
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="card-sensor-row">
              <span className="sensor-label">LIVE CONSUMPTION:</span>
              <span className="sensor-value">
                {states[ENTITY.SHELF_POWER]?.state || "0.0"} W
              </span>
            </div>
          </div>
        </article>

        <article className="ef-card switch-card bg-dot-matrix">
          <div
            className={`ef-accent-bar ${states[ENTITY.PLUG_SWITCH]?.state === "on" ? "active" : ""}`}
          >
            <div className="bar-pink"></div>
            <div className="bar-green"></div>
            <div className="bar-yellow"></div>
          </div>
          <div className="card-inner">
            <div className="card-top">
              <div className="icon-box">
                <svg className="entity-icon" viewBox="0 0 24 24">
                  <title>Light</title>
                  <path
                    fill="currentColor"
                    d="M16 7V3H14V7H10V3H8V7H7A2 2 0 0 0 5 9V14.5L8.5 18V21H15.5V18L19 14.5V9A2 2 0 0 0 17 7H16Z"
                  />
                </svg>
              </div>
              <div className="entity-info">
                <div className="entity-name">Auxiliary Plug</div>
                <div className="entity-id">{ENTITY.PLUG_SWITCH}</div>
              </div>
              <label className="ef-switch">
                <input
                  type="checkbox"
                  checked={states[ENTITY.PLUG_SWITCH]?.state === "on"}
                  onChange={(e) =>
                    callHAService(
                      "switch",
                      e.target.checked ? "turn_on" : "turn_off",
                      { entity_id: ENTITY.PLUG_SWITCH },
                    )
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="card-sensor-row">
              <span className="sensor-label">LIVE CONSUMPTION:</span>
              <span className="sensor-value">
                {states[ENTITY.PLUG_POWER]?.state || "0.0"} W
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
