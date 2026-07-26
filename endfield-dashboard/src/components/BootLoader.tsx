import type React from "react";
import { EndfieldLogoSvg } from "./icons/icons";

interface Props {
  loading: boolean;
}

export const BootLoader: React.FC<Props> = ({ loading }) => {
  return (
    <div
      id="ef-loader"
      className={`ef-loader-overlay ${!loading ? "fade-out" : ""}`}
    >
      <div className="loader-content">
        <div
          className="loader-logo"
          style={{ border: "none", background: "transparent" }}
        >
          <EndfieldLogoSvg width="60" height="30" />
        </div>
        <div className="loader-text">
          INITIALIZING PROTOCOL AUTOMATION-CORE...
        </div>
        <div className="loader-sub">OVER THE FRONTIER, INTO THE FRONT</div>
        <div className="loader-progress">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
};
