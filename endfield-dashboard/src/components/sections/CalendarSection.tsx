import type React from "react";
import { useState } from "react";
import { ENTITY } from "../../constants";
import type { HAStatesMap } from "../../models/ha";
import { IconCalendar } from "../icons/icons";

interface Props {
  states: HAStatesMap;
}

export const CalendarSection: React.FC<Props> = ({ states }) => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Extract the single "next" event from each calendar entity available in states
  const upcomingEvents = ENTITY.CALENDARS.map((calId) => {
    const stateObj = states[calId];
    if (stateObj?.attributes?.message) {
      return {
        id: calId,
        title: stateObj.attributes.message,
        description:
          stateObj.attributes.description || "No description provided.",
        startTime: new Date(stateObj.attributes.start_time),
        endTime: new Date(stateObj.attributes.end_time),
        allDay: stateObj.attributes.all_day || false,
        isActive: stateObj.state === "on",
      };
    }
    return null;
  })
    .filter((e) => e !== null)
    .sort((a, b) => a?.startTime.getTime() - b?.startTime.getTime());

  const finalEvents = upcomingEvents;

  // Generate days for grid view based on today
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();
    const dateNum = d.getDate().toString().padStart(2, "0");
    return { label: `${dayName} ${dateNum}`, dateObj: d };
  });

  return (
    <section className="dashboard-section" id="sec-calendar">
      <div className="section-header bg-hazard-stripes">
        <div className="section-title-wrap">
          <span className="sec-index">
            <IconCalendar />
          </span>
          <h2 className="sec-title">LOGISTICS & SCHEDULE</h2>
        </div>
        <div className="sec-tag">AIC_TIMETABLE</div>
      </div>

      <div className="cards-grid" style={{ height: "100%" }}>
        <article
          className="ef-card schedule-card bg-dot-matrix"
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="ef-accent-bar active">
            <div className="bar-pink"></div>
            <div className="bar-green"></div>
            <div className="bar-yellow"></div>
          </div>
          <div className="card-inner schedule-card-inner">
            <div className="schedule-view-toggle">
              <button
                type="button"
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <span>LIST VIEW</span>
              </button>
              <button
                type="button"
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <span>GRID VIEW</span>
              </button>
            </div>

            <div className="schedule-content">
              {viewMode === "list" ? (
                <div className="schedule-list">
                  {finalEvents.length === 0 ? (
                    <div
                      style={{
                        color: "var(--clr-text-muted)",
                        padding: "20px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      NO UPCOMING LOGISTICS RECORDED.
                    </div>
                  ) : (
                    finalEvents.map((ev, idx) => {
                      const hourStr = ev?.allDay
                        ? "ALL DAY"
                        : ev?.startTime.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                      const dateStr = ev?.startTime
                        .toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                        .toUpperCase();
                      const isToday =
                        ev?.startTime.toDateString() === today.toDateString();

                      return (
                        <div
                          className={`schedule-item ${!ev?.isActive ? (ev?.startTime < today ? "inactive" : "") : ""}`}
                          key={idx}
                        >
                          <div className="schedule-time">
                            <span className="s-hour">{hourStr}</span>
                            <span className="s-date">
                              {isToday ? "TODAY" : dateStr}
                            </span>
                          </div>
                          <div className="schedule-divider"></div>
                          <div className="schedule-details">
                            <div className="s-title">{ev?.title}</div>
                            <div
                              className="s-desc"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {ev?.description}
                            </div>
                            <div className="s-tag-row">
                              {ev?.isActive && (
                                <span
                                  className="s-tag"
                                  style={{
                                    color: "var(--clr-primary)",
                                    borderColor: "var(--clr-primary)",
                                  }}
                                >
                                  IN_PROGRESS
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="schedule-grid-view day-columns-layout">
                  {days.map((d) => {
                    const dayEvents = finalEvents.filter(
                      (e) =>
                        e?.startTime.toDateString() ===
                        d.dateObj.toDateString(),
                    );

                    return (
                      <div className="day-col" key={d.label}>
                        <div className="grid-cell-header">{d.label}</div>
                        <div
                          className="grid-cell day-events-cell"
                          style={{ flex: 1 }}
                        >
                          {dayEvents.map((ev, idx) => (
                            <div
                              className={`grid-event ${ev?.isActive ? "pending" : ""}`}
                              key={idx}
                            >
                              <span className="ev-time">
                                {ev?.allDay
                                  ? "ALL DAY"
                                  : ev?.startTime.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                              </span>
                              <span
                                className="ev-title"
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ev?.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
