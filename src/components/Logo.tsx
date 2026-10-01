interface LogoProps {
  className?: string;
  /** Use the exact uploaded brand asset instead of the built-in SVG mark. */
  src?: string | null;
  /** Draw the "SBI Medical" wordmark block beside the seal. */
  showWordmark?: boolean;
  tone?: "light" | "dark";
}

/**
 * SBI Medical mark, drawn as vector paths: a navy roundel with a stethoscope
 * whose tubing resolves into an ECG trace, over the wordmark and SINCE 2010 rule.
 */
export function Logo({ className = "", src, showWordmark = true, tone = "dark" }: LogoProps) {
  if (src?.trim()) {
    const imageSrc = /^https?:\/\//i.test(src) || src.startsWith("/") ? src : `/${src}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        className={`object-contain ${className}`}
        alt="SBI Medical Animal Bite Center and Vaccination Clinic, since 2010"
      />
    );
  }

  const navy = tone === "dark" ? "#0A3D7A" : "#FFFFFF";
  const accent = "#E31E24";

  return (
    <svg
      viewBox={showWordmark ? "0 0 340 108" : "0 0 108 108"}
      className={className}
      role="img"
      aria-label="SBI Medical Animal Bite Center and Vaccination Clinic, since 2010"
    >
      <g transform="translate(2 2)">
        <circle cx="52" cy="52" r="49" fill="none" stroke={navy} strokeWidth="4" />
        {/* stethoscope ear pieces + tubing */}
        <path
          d="M30 30 v10 a13 13 0 0 0 26 0 V30"
          fill="none"
          stroke={navy}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M43 53 v10 a17 17 0 0 0 34 0 V56"
          fill="none"
          stroke={navy}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M77 56 v-6"
          fill="none"
          stroke={navy}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="30" cy="26" r="5" fill={accent} />
        <circle cx="56" cy="26" r="5" fill={accent} />
        <circle cx="77" cy="44" r="8" fill="none" stroke={navy} strokeWidth="5" />
        <circle cx="77" cy="44" r="2.5" fill={navy} />
        {/* ECG trace */}
        <path
          d="M86 44 h6 l4 -13 l6 26 l5 -17 l4 8 h7"
          fill="none"
          stroke={accent}
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="118" cy="48" r="3.4" fill={accent} />
        {!showWordmark && (
          <text
            x="52"
            y="88"
            textAnchor="middle"
            fill={navy}
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="17"
            letterSpacing="-0.5"
          >
            SBI
          </text>
        )}
      </g>

      {showWordmark && (
        <g>
          <text
            x="116"
            y="46"
            fill={navy}
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="42"
            letterSpacing="-1.6"
          >
            SBI Medical
          </text>
          <text
            x="117"
            y="72"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="21"
            letterSpacing="-0.4"
          >
            <tspan fill={accent}>—</tspan>
            <tspan fill={accent}>Animal</tspan>
            <tspan fill="#12833F">Bite</tspan>
            <tspan fill={navy}>Center—</tspan>
          </text>
          <text
            x="118"
            y="92"
            fill={navy}
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="700"
            fontSize="16"
            letterSpacing="0.2"
          >
            &amp; Vaccination Clinic
          </text>
          <text
            x="253"
            y="104"
            fill={navy}
            fontFamily="Inter, sans-serif"
            fontWeight="600"
            fontSize="9.5"
            letterSpacing="3.4"
          >
            SINCE 2010
          </text>
        </g>
      )}
    </svg>
  );
}

/** Circular DOH-style certification badge used in the trust strip. */
export function SealBadge({
  label,
  sub,
  color = "#0A3D7A",
  className = "",
}: {
  label: string;
  sub: string;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="none" stroke={color} strokeWidth="2.5" />
        <circle cx="24" cy="24" r="17" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        <path d="M24 12v24M12 24h24" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="leading-tight">
        <span
          className="block text-[13px] font-bold uppercase tracking-[0.1em]"
          style={{ color }}
        >
          {label}
        </span>
        <span className="block text-[12px] text-steel">{sub}</span>
      </span>
    </div>
  );
}
