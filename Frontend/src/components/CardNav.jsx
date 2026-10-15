// src/components/CardNav.jsx
import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";
import "../styles/CardNav.css";

const CardNav = ({
  logo,
  logoAlt = "Logo",
  items = [],
  className = "",
  ease = "power3.out",
  baseColor = "rgba(255,255,255,0.12)",
  menuColor = "#fff",
  buttonBgColor = "rgba(255,255,255,0.18)",
  buttonTextColor = "#fff",
  onLoginClick = () => {},
  onAdminClick = () => {},
  onBookingClick = () => {},
  onDashboardClick = () => {},
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  // calculate expanded height (mobile friendly)
  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content");
      if (contentEl) {
        const prev = {
          visibility: contentEl.style.visibility,
          pointerEvents: contentEl.style.pointerEvents,
          position: contentEl.style.position,
          height: contentEl.style.height,
        };

        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        // restore previous
        Object.assign(contentEl.style, prev);

        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  // create GSAP timeline to animate height + cards
  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
      "-=0.1"
    );
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      if (tlRef.current) tlRef.current.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      const newTl = createTimeline();
      if (newTl) {
        if (isExpanded) {
          gsap.set(navRef.current, { height: calculateHeight() });
          newTl.progress(1);
        }
        tlRef.current.kill();
        tlRef.current = newTl;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i) => (el) => {
    if (el) cardsRef.current[i] = el;
  };

  // maps label text to navigation handlers (fallback to href if needed)
  const handleMenuClick = (label, href) => {
    if (!label) {
      if (href) window.location.href = href;
      return;
    }
    const l = label.toLowerCase();
    if (l.includes("admin")) return onAdminClick();
    if (l.includes("book")) return onBookingClick();
    if (l.includes("dash")) return onDashboardClick();
    // fallback: if href provided, navigate
    if (href) window.location.href = href;
  };

  return (
    <div className={`card-nav-container ${className}`} style={{ pointerEvents: "auto" }}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""}`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            tabIndex={0}
            style={{ color: menuColor }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container" style={{ pointerEvents: "auto" }}>
            {logo ? <img src={logo} alt={logoAlt} className="logo" /> : <div>{logoAlt}</div>}
          </div>

          <button
            type="button"
            className="card-nav-cta-button"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            onClick={onLoginClick}
          >
            Login / Signup
          </button>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor || "rgba(0,0,0,0.2)", color: item.textColor || "#fff" }}
            >
              <div className="nav-card-label">{item.label}</div>

              <div className="nav-card-links">
                {(item.links || []).map((lnk, i) => (
                  <a
                    key={`${lnk.label}-${i}`}
                    className="nav-card-link"
                    href={lnk.href || "#"}
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick(lnk.label || item.label, lnk.href);
                    }}
                  >
                    <GoArrowUpRight className="nav-card-link-icon" />
                    {lnk.label}
                  </a>
                ))}

                {/* small fallback button to open the section */}
                <div style={{ marginTop: 8 }}>
                  <button
                    className="nav-card-open-btn"
                    onClick={() => handleMenuClick(item.label, item.href)}
                  >
                    Open {item.label}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
