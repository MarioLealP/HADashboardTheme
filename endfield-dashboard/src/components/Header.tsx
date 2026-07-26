import type React from "react";
import { ENTITY } from "../constants";
import type { HAServiceData, SpotifyState } from "../models/ha";
import { EndfieldLogoSvg } from "./icons/icons";

interface Props {
  connected: boolean;
  statusMsg: string;
  time: string;
  date: string;
  spotifyState?: SpotifyState;
  callHAService?: (
    domain: string,
    service: string,
    data: HAServiceData,
  ) => void;
}

const PrevIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <title>Previous</title>
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <title>Play</title>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <title>Pause</title>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <title>Next</title>
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

export const Header: React.FC<Props> = ({
  connected,
  statusMsg,
  time,
  date,
  spotifyState,
  callHAService,
}) => {
  const trackName = spotifyState?.attributes?.media_title || "No Media Playing";
  const duration = spotifyState?.attributes?.media_duration || 0;
  const position = spotifyState?.attributes?.media_position || 0;
  const isPlaying = spotifyState?.state === "playing";

  const formatTime = (secs: number) => {
    if (!secs || Number.isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <header className="endfield-header">
      <div className="accent-stripe">
        <div className="stripe-pink"></div>
        <div className="stripe-green"></div>
        <div className="stripe-yellow"></div>
      </div>

      <div className="header-content">
        <div className="brand-group">
          <div
            className="logo-box"
            style={{
              background: "transparent",
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <EndfieldLogoSvg width="40" height="20" />
          </div>
          <div className="brand-titles">
            <img
              src="/title.svg"
              alt="Endfield Title"
              style={{
                height: "14px",
                marginBottom: "4px",
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
            />
            <div className="brand-spec">
              ENDMINISTRATOR COMMAND DASHBOARD {/* OS.v3.8 */}
            </div>
          </div>
        </div>

        <div className="header-center-info">
          <div className="sys-status-pill">
            <span
              className="status-dot pulsing"
              style={{
                background: connected ? "#00FF9A" : "#FFFA01",
                boxShadow: connected ? "0 0 8px #00FF9A" : "0 0 8px #FFFA01",
              }}
            ></span>
            <span className="status-text">{statusMsg}</span>
          </div>
        </div>

        <div
          className="spotify-header-position"
          style={{
            position: "absolute",
            left: "74%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
          }}
        >
          <div
            className="spotify-widget"
            style={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              border: "none",
            }}
          >
            <div
              className="sp-info"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                justifyContent: "center",
              }}
            >
              <div
                className="sp-title"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "var(--clr-text-white)",
                  maxWidth: "240px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}
              >
                {trackName}
              </div>
              <div
                className="sp-controls"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--clr-text-muted)",
                  lineHeight: 1,
                }}
              >
                <span>
                  {formatTime(position)} / {formatTime(duration)} -
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--clr-primary)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      callHAService?.("media_player", "media_previous_track", {
                        entity_id: ENTITY.SPOTIFY,
                      })
                    }
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "none",
                      border: "none",
                      color: "inherit",
                    }}
                  >
                    <PrevIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      callHAService?.("media_player", "media_play_pause", {
                        entity_id: ENTITY.SPOTIFY,
                      })
                    }
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "none",
                      border: "none",
                      color: "inherit",
                    }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      callHAService?.("media_player", "media_next_track", {
                        entity_id: ENTITY.SPOTIFY,
                      })
                    }
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "none",
                      border: "none",
                      color: "inherit",
                    }}
                  >
                    <NextIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="clock-display">
            <span className="time-main">{time}</span>
            <span className="date-sub">{date}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
