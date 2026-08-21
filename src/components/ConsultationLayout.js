import React, { useContext, useRef, useState, useLayoutEffect } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../context/site";
import Header from "./Header";
import Footer from "./Footer";
import Title from "./Title";
import ConsultationSidebar from "./ConsultationSidebar";

/**
 * ConsultationLayout
 * Wraps any consultation page with:
 *   - sticky Header
 *   - optional Title bar
 *   - fixed left sidebar
 *   - scrollable main content area
 *   - Footer
 *   - optional book button
 *
 * Usage:
 *   <ConsultationLayout title="My consultations" hideBookButton={true}>
 *     <YourPageContent />
 *   </ConsultationLayout>
 */
const ConsultationLayout = ({ title, children, hideBookButton = false }) => {
  const navigate = useNavigate();
  const { getAContent } = useContext(SiteContext);

  // Measure the real height of the sticky Header+Title stack instead of
  // hardcoding "230px" in every child that needs to stick below it.
  // This stays correct even when the title wraps to two lines in a
  // longer-translation locale, or the header's own height changes.
  const stickyStackRef = useRef(null);
  const [stickyOffset, setStickyOffset] = useState(230);

  useLayoutEffect(() => {
    const el = stickyStackRef.current;
    if (!el) return;

    const measure = () => setStickyOffset(el.getBoundingClientRect().height);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ "--sticky-offset": `${stickyOffset}px` }}>
      {/* ── Sticky top stack ── */}
      <div className="sticky-stack" ref={stickyStackRef}>
        <Header />
        {title && <Title title={title} />}
      </div>

      {/* ── Body: sidebar + content ── */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        minHeight: "calc(100vh - 120px)", // account for header height
      }}>

        {/* Left sidebar */}
        <ConsultationSidebar />

        {/* Main content */}
        <main style={{
          flex: 1,
          padding: "24px 32px",
          minWidth: 0, // prevent flex overflow
          boxSizing: "border-box",
        }}>          
          {children}
        </main>

      </div>

      <Footer />
    </div>
  );
};

export default ConsultationLayout;