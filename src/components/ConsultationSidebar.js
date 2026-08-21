// src/components/ConsultationSidebar.js

import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";
import {
  CalendarOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  InfoCircleOutlined, // ← Add this
} from "@ant-design/icons";
import { Tooltip } from "antd";

const PROFILE_TYPE_VET = 2;
const PROFILE_TYPE_PET_OWNER = 1;

const ConsultationSidebar = () => {
  const { profileTypeId } = useContext(AuthContext);
  const { getAContent } = useContext(SiteContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const petOwnerItems = [
    {
      key: "/consultation/creation",
      icon: <PlusCircleOutlined />,
      label: getAContent("cmp_vetonest.com_BookConsultation_Btn"),
    },
    {
      key: "/consultation/list",
      icon: <UnorderedListOutlined />,
      label: getAContent("cmp_vetonest.com_MyConsultations_Txt"),
    },
    {
      key: "/consultation/rules", // ← New rules page for pet owners
      icon: <InfoCircleOutlined />,
      label: getAContent("cmp_vetonest.com_ConsultationRules_Label") || "Consultation Rules",
    },
    {
      key: "/my-pets",
      icon: <PlusCircleOutlined />,
      label: getAContent("cmp_vetonest.com_AddPet_Btn") || "+ Add a pet",
    },
  ];

  const vetItems = [
    {
      key: "/consultation/vet/list",
      icon: <CalendarOutlined />,
      label: getAContent("cmp_vetonest.com_FLBx5ixGp5"),
    },
    {
      key: "/consultation/vet/earnings",
      icon: <DollarOutlined />,
      label: getAContent("cmp_vetonest.com_MyEarnings_Label") || "My Earnings",
    },
    {
      key: "/consultation/rules", // ← New rules page for vets
      icon: <InfoCircleOutlined />,
      label: getAContent("cmp_vetonest.com_ConsultationRules_Label") || "Consultation Rules",
    },
  ];

  const items = Number(profileTypeId) === PROFILE_TYPE_VET ? vetItems : petOwnerItems;

  return (
    <>
      <aside
        className="consultation-sidebar"
        style={{
          width: "220px",
          minHeight: "100vh",
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          position: "sticky",
          top: "var(--sticky-offset, 230px)",
          flexShrink: 0,
          transition: "width 0.2s ease",
        }}
      >
        <div
          style={{
            padding: "0 20px 20px",
            borderBottom: "1px solid #f5f5f5",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MedicineBoxOutlined
              style={{ fontSize: "20px", color: "#52c41a" }}
            />
            <span
              className="sidebar-header-text"
              style={{ fontWeight: 700, fontSize: "15px", color: "#222" }}
            >
              {getAContent("cmp_vetonest.com_Consultations_Plural_Txt")}
            </span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {items.map((item) => {
            const active = isActive(item.key);
            return (
              <Tooltip
                key={item.key}
                title={window.innerWidth < 768 ? item.label : ""}
                placement="right"
              >
                <div
                  onClick={() => navigate(item.key)}
                  className="sidebar-nav-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "11px 20px",
                    margin: "2px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: active ? "#f6ffed" : "transparent",
                    color: active ? "#52c41a" : "#555",
                    fontWeight: active ? 600 : 400,
                    fontSize: "14px",
                    borderLeft: active
                      ? "3px solid #52c41a"
                      : "3px solid transparent",
                    transition: "all 0.15s ease",
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
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </div>
              </Tooltip>
            );
          })}
        </nav>
      </aside>

      <style jsx>{`
        @media (max-width: 768px) {
          .consultation-sidebar {
            width: 70px !important;
            padding: 16px 0 !important;
          }
          .consultation-sidebar .sidebar-header-text {
            display: none;
          }
          .consultation-sidebar .sidebar-nav-item {
            justify-content: center !important;
            padding: 12px 0 !important;
            margin: 2px 8px !important;
            gap: 0 !important;
          }
          .consultation-sidebar .sidebar-nav-label {
            display: none;
          }
          .consultation-sidebar .sidebar-nav-item span:first-child {
            font-size: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .consultation-sidebar {
            width: 60px !important;
          }
        }
      `}</style>
    </>
  );
};

export default ConsultationSidebar;