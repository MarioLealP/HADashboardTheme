import type React from "react";
import { useRef, useState } from "react";
import { ENTITY } from "../../constants";
import type { HAStatesMap, WeatherForecastItem } from "../../models/ha";
import { IconCalendar } from "../icons/icons";

interface Props {
  states: HAStatesMap;
}

export const WeatherSection: React.FC<Props> = ({ states }) => {
  const hourlyScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingHourly, setIsDraggingHourly] = useState(false);
  const [hourlyStartX, setHourlyStartX] = useState(0);
  const [hourlyScrollLeft, setHourlyScrollLeft] = useState(0);

  const handleHourlyMouseDown = (e: React.MouseEvent) => {
    setIsDraggingHourly(true);
    if (!hourlyScrollRef.current) return;
    setHourlyStartX(e.pageX - hourlyScrollRef.current.offsetLeft);
    setHourlyScrollLeft(hourlyScrollRef.current.scrollLeft);
  };

  const handleHourlyMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingHourly || !hourlyScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - hourlyScrollRef.current.offsetLeft;
    const walk = (x - hourlyStartX) * 1.5;
    hourlyScrollRef.current.scrollLeft = hourlyScrollLeft - walk;
  };

  return (
    <section
      className="dashboard-section"
      id="sec-weather"
      style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <div className="section-header bg-hazard-stripes">
        <div className="section-title-wrap">
          <span className="sec-index">
            <IconCalendar />
          </span>
          <h2 className="sec-title">ATMOSPHERIC METRICS & FORECAST</h2>
        </div>
        <div className="sec-tag">TIANSHI_OBSERVATORY</div>
      </div>

      <div
        className="cards-grid weather-grid-layout"
        style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
      >
        <article
          className="ef-card weather-main-card bg-dot-matrix"
          style={{ width: "100%", height: "100%", display: "flex" }}
        >
          <div
            className="card-inner"
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* TOP ROW: Current Weather + Daily Forecast */}
            <div
              className="weather-top-row"
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "stretch",
                flexShrink: 0,
              }}
            >
              {/* Current Weather */}
              <div
                className="weather-current-block"
                style={{
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div className="weather-icon-large">
                  <svg
                    viewBox="0 0 24 24"
                    width="56"
                    height="56"
                    fill="#FFFA01"
                  >
                    <title>Weather</title>
                    <path d="M12,6.5A5.5,5.5 0 0,1 17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12A5.5,5.5 0 0,1 12,6.5M12,2A1,1 0 0,1 13,3V4A1,1 0 0,1 12,5A1,1 0 0,1 11,4V3A1,1 0 0,1 12,2M12,19A1,1 0 0,1 13,20V21A1,1 0 0,1 12,22A1,1 0 0,1 11,21V20A1,1 0 0,1 12,19M4,11H3A1,1 0 0,1 2,12A1,1 0 0,1 3,13H4A1,1 0 0,1 5,12A1,1 0 0,1 4,11M21,11H20A1,1 0 0,1 19,12A1,1 0 0,1 20,13H21A1,1 0 0,1 22,12A1,1 0 0,1 21,11Z" />
                  </svg>
                </div>
                <div className="weather-temp-wrap">
                  <span
                    className="weather-temp"
                    style={{ fontSize: "32px", lineHeight: "1" }}
                  >
                    {states[ENTITY.WEATHER]?.attributes?.temperature || "--"}°C
                  </span>
                  <span
                    className="weather-state"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    {states[ENTITY.WEATHER]?.state || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Forecast Grid (Right side) */}
              <div
                className="weather-forecast-grid"
                style={{ flex: 1, margin: 0, gap: "8px" }}
              >
                {(() => {
                  const mockForecast = [
                    {
                      datetime: new Date(
                        Date.now() + 86400000 * 1,
                      ).toISOString(),
                      condition: "sunny",
                      temperature: 28,
                      templow: 18,
                    },
                    {
                      datetime: new Date(
                        Date.now() + 86400000 * 2,
                      ).toISOString(),
                      condition: "partlycloudy",
                      temperature: 26,
                      templow: 17,
                    },
                    {
                      datetime: new Date(
                        Date.now() + 86400000 * 3,
                      ).toISOString(),
                      condition: "cloudy",
                      temperature: 24,
                      templow: 16,
                    },
                  ];
                  const forecasts =
                    states[ENTITY.WEATHER]?.attributes?.forecast ||
                    mockForecast;
                  return forecasts
                    .slice(0, 3)
                    .map((day: WeatherForecastItem, i: number) => {
                      const date = new Date(day.datetime);
                      const dayName = date
                        .toLocaleDateString("en-US", { weekday: "short" })
                        .toUpperCase();
                      return (
                        <div
                          key={i}
                          className="forecast-day"
                          style={{
                            padding: "6px",
                            gap: "4px",
                            pointerEvents: "none",
                          }}
                        >
                          <div className="f-date" style={{ fontSize: "10px" }}>
                            {dayName}
                          </div>
                          <svg
                            className="f-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: "20px", height: "20px" }}
                          >
                            <title>Forecast</title>
                            {day.condition.includes("rain") ? (
                              <>
                                <path d="M7 16a4 4 0 0 1-.88-7.9 6 6 0 0 1 11.76 0A4 4 0 0 1 17 16H7z" />
                                <path d="M8 19v2m4-2v2m4-2v2" />
                              </>
                            ) : day.condition.includes("cloud") ? (
                              <path d="M7 16a4 4 0 0 1-.88-7.9 6 6 0 0 1 11.76 0A4 4 0 0 1 17 16H7z" />
                            ) : (
                              <>
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
                              </>
                            )}
                          </svg>
                          <div
                            className="f-temp-wrap"
                            style={{ fontSize: "11px" }}
                          >
                            <span className="f-temp-high">
                              {day.temperature}°
                            </span>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>

            {/* BOTTOM ROW: Hourly Projection */}
            <div
              className="weather-bottom-row"
              style={{
                display: "flex",
                flex: 1,
                minHeight: 0,
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <section
                className="hourly-forecast-scroll"
                aria-label="Hourly forecast"
                ref={hourlyScrollRef}
                onMouseDown={handleHourlyMouseDown}
                onMouseLeave={() => setIsDraggingHourly(false)}
                onMouseUp={() => setIsDraggingHourly(false)}
                onMouseMove={handleHourlyMouseMove}
                style={{
                  cursor: isDraggingHourly ? "grabbing" : "grab",
                  gap: "8px",
                  display: "flex",
                  overflowX: "auto",
                }}
              >
                {(() => {
                  const mockHourly = Array.from({ length: 24 }).map((_, i) => {
                    const d = new Date(Date.now() + 3600000 * (i + 1));
                    return {
                      datetime: d.toISOString(),
                      temperature: Math.round(20 + Math.sin(i / 4) * 8),
                      condition:
                        i % 5 === 0
                          ? "cloudy"
                          : i % 8 === 0
                            ? "rainy"
                            : "sunny",
                    };
                  });
                  const hourlyForecasts =
                    states[ENTITY.WEATHER]?.attributes?.forecast ||
                    states[ENTITY.WEATHER]?.attributes?.hourly_forecast ||
                    mockHourly;

                  return hourlyForecasts
                    .slice(0, 24)
                    .map((hour: WeatherForecastItem, i: number) => {
                      const date = new Date(hour.datetime);
                      const timeStr = date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        hour12: true,
                      });
                      return (
                        <div
                          key={i}
                          className="hourly-item"
                          style={{
                            padding: "8px 4px",
                            flex: "0 0 60px",
                            pointerEvents: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <div className="h-time" style={{ fontSize: "10px" }}>
                            {timeStr}
                          </div>
                          <svg
                            className="f-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              width: "20px",
                              height: "20px",
                              margin: "2px 0",
                            }}
                          >
                            <title>Hourly</title>
                            {hour.condition.includes("rain") ? (
                              <>
                                <path d="M7 16a4 4 0 0 1-.88-7.9 6 6 0 0 1 11.76 0A4 4 0 0 1 17 16H7z" />
                                <path d="M8 19v2m4-2v2m4-2v2" />
                              </>
                            ) : hour.condition.includes("cloud") ? (
                              <path d="M7 16a4 4 0 0 1-.88-7.9 6 6 0 0 1 11.76 0A4 4 0 0 1 17 16H7z" />
                            ) : (
                              <>
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
                              </>
                            )}
                          </svg>
                          <div className="h-temp" style={{ fontSize: "13px" }}>
                            {hour.temperature}°
                          </div>
                        </div>
                      );
                    });
                })()}
              </section>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
