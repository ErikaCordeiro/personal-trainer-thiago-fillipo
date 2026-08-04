import React from "react";

export default function LionLogo({ compact = false, hero = false, branding = null, platform = false }) {
  const data = platform
    ? { display_name: "Fitland", login_subtitle: "Performance, gestão e evolução", initials: "FT" }
    : branding;
  const displayName = data?.display_name || "Fitland";
  const logoUrl = data?.logo_url || data?.icon_url;

  return (
    <div className={`lion-logo ${compact ? "compact" : ""} ${hero ? "hero" : ""}`} aria-label={displayName}>
      <div className="lion-mark">
        {logoUrl ? <img src={logoUrl} alt={`Logo ${displayName}`} /> : <span className="fitland-mark">{data?.initials || "FT"}</span>}
      </div>
      {!compact && (
        <div className="brand-lockup">
          <span>{platform || data?.is_fallback ? "Plataforma" : "Personal"}</span>
          <strong>{displayName}</strong>
          <small>{data?.login_subtitle || "Performance • Gestão • Evolução"}</small>
        </div>
      )}
    </div>
  );
}
