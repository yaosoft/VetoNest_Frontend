import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";
import {
  CalendarOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

const PROFILE_TYPE_VET       = 2; // adjust to match your profileTypeId values
const PROFILE_TYPE_PET_OWNER = 1;

const ConsultationSidebar = () => {
  const { profileTypeId } = useContext(AuthContext);
  const { getAContent }   = useContext(SiteContext);
  const navigate          = useNavigate();
  const location          = useLocation();

  const isActive = (path) => location.pathname === path;

  // ── Menu definitions per profile type ────────────────────────────────────
  const petOwnerItems = [
    {
      key:   "/consultation/creation",
      icon:  <PlusCircleOutlined />,
      label: getAContent( 'cmp_vetonest.com_BookConsultation_Btn' ),
    },
    {
      key:   "/consultation/list",
      icon:  <UnorderedListOutlined />,
      label: getAContent( 'cmp_vetonest.com_MyConsultations_Txt' ),
    },
    {
      key:   "/profile",
      icon:  <PlusCircleOutlined />,
      label: getAContent( 'cmp_vetonest.com_AddPet_Btn' ) || '+ Add a pet',
    },
  ];

  const vetItems = [
    {
      key:   "/consultation/vet/list",
      icon:  <CalendarOutlined />,
      label: getAContent( 'cmp_vetonest.com_FLBx5ixGp5' ), // My appointments
    },
  ];

  const items = Number(profileTypeId) === PROFILE_TYPE_VET ? vetItems : petOwnerItems;

  return (
    <aside style={{
      width:           "220px",
      minHeight:       "100vh",
      background:      "#fff",
      borderRight:     "1px solid #f0f0f0",
      display:         "flex",
      flexDirection:   "column",
      padding:         "24px 0",
      position:        "sticky",
      top:             0,
      flexShrink:      0,
    }}>

      {/* ── Header ── */}
      <div style={{
        padding:      "0 20px 20px",
        borderBottom: "1px solid #f5f5f5",
        marginBottom: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MedicineBoxOutlined style={{ fontSize: "20px", color: "#52c41a" }} />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#222" }}>
			  { getAContent( 'cmp_vetonest.com_Consultations_Plural_Txt') }
          </span>
        </div>
      </div>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1 }}>
        {items.map((item) => {
          const active = isActive(item.key);
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.key)}
              style={{
                display:        "flex",
                alignItems:     "center",
                gap:            "12px",
                padding:        "11px 20px",
                margin:         "2px 10px",
                borderRadius:   "8px",
                cursor:         "pointer",
                background:     active ? "#f6ffed" : "transparent",
                color:          active ? "#52c41a" : "#555",
                fontWeight:     active ? 600 : 400,
                fontSize:       "14px",
                borderLeft:     active ? "3px solid #52c41a" : "3px solid transparent",
                transition:     "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#fafafa";
                  e.currentTarget.style.color = "#222";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#555";
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

    </aside>
  );
};

export default ConsultationSidebar;