// src/pages/Consultation/ConsultationRules.jsx

import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import {
  Select,
  Input,
  Button,
  Tag,
  Spin,
  Empty,
  Badge,
  Modal,
  message,
  Tooltip,
  ConfigProvider,
  Card,
  Tabs,
  Table,
  Typography,
  Space,
  Alert,
  Row,
  Col,
  Statistic,
  Divider,
  Descriptions,
  Collapse,
  Progress,
  List,
  Avatar,
  Segmented,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  HomeOutlined,
  ShopOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
  FileTextOutlined,
  TeamOutlined,
  GlobalOutlined,
  CheckOutlined,
  CloseOutlined,
  AlertOutlined,
  CalendarOutlined as CalendarIcon,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { useConsultationRules } from "../../context/ConsultationRulesContext";
import ConsultationLayout from "../../components/ConsultationLayout";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// ─── Helper: Format lead time ─────────────────────────────────────────────
const formatLeadTimeDisplay = (hours) => {
  if (!hours) return "N/A";
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours > 1 ? "s" : ""}`;
};

const ConsultationRules = () => {
  const navigate = useNavigate();
  const { profileId, user } = useContext(AuthContext);
  const {
    getAContent,
    siteLocale,
  } = useContext(SiteContext);

  const {
    allTypes,
    rules,
    loading: rulesLoading,
    fetchAllTypes,
    fetchRulesForType,
    selectedType,
    setSelectedType,
    getCurrentRules,
    getTypeDisplayInfo,
    getPricingInfo,
    formatLeadTime,
    canBookAtTime,
    getEarliestBookingTime,
    getAcceptanceDeadline,
  } = useConsultationRules();

  const [vetId, setVetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testDateTime, setTestDateTime] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [expandedPanels, setExpandedPanels] = useState([]);

  // ─── Get vet ID based on user type ──────────────────────────────────────
  useEffect(() => {
    setVetId(null);
    setLoading(false);
  }, []);

  // ─── Load consultation types ────────────────────────────────────────────
  useEffect(() => {
    const loadTypes = async () => {
      await fetchAllTypes(vetId);
    };
    loadTypes();
  }, [fetchAllTypes, vetId]);

  // ─── Load rules for selected type ───────────────────────────────────────
  useEffect(() => {
    if (selectedType) {
      fetchRulesForType(selectedType, vetId);
    }
  }, [selectedType, fetchRulesForType, vetId]);

  // ─── Handle tab change ──────────────────────────────────────────────────
  const handleTabChange = (key) => {
    setSelectedType(key);
    setValidationResult(null);
    setTestDateTime(null);
  };

  // ─── Handle test booking ────────────────────────────────────────────────
  const handleTestBooking = () => {
    const now = new Date();
    const testDate = new Date(now);
    testDate.setHours(testDate.getHours() + 24);

    const result = canBookAtTime(testDate, selectedType);
    setValidationResult(result);
    setTestDateTime(testDate);
  };

  // ─── Get current rules ──────────────────────────────────────────────────
  const currentRules = getCurrentRules();
  const currentDisplayInfo = getTypeDisplayInfo();
  const pricingInfo = getPricingInfo();
  const earliestTime = getEarliestBookingTime();
  const acceptanceDeadline = getAcceptanceDeadline(new Date());

  // ─── Build rule data for table ──────────────────────────────────────────
  const ruleData = useMemo(() => {
	  if (!currentRules) return [];

	  const rulesList = [
		{
		  key: "1",
		  rule: getAContent("cmp_vetonest.com_Rule_VetAcceptanceBuffer_Label") || "Vet Acceptance Buffer",
		  value: `${currentRules.acceptance_buffer_hours} ${getAContent("cmp_vetonest.com_Hours_Label") || "hour"}${currentRules.acceptance_buffer_hours > 1 ? "s" : ""}`,
		  description: getAContent("cmp_vetonest.com_Rule_VetAcceptanceBuffer_Desc") || "Time for vet to receive notification and accept booking",
		  icon: "📬",
		},
		{
		  key: "2",
		  rule: getAContent("cmp_vetonest.com_Rule_VetAcceptanceLeadTime_Label") || "Vet Acceptance Lead Time",
		  value: formatLeadTimeDisplay(currentRules.acceptance_lead_time_hours),
		  description: getAContent("cmp_vetonest.com_Rule_VetAcceptanceLeadTime_Desc") || "Time for vet to prepare after accepting",
		  icon: "📋",
		},
		{
		  key: "3",
		  rule: getAContent("cmp_vetonest.com_Rule_MinBookingLeadTime_Label") || "Min Booking Lead Time",
		  value: formatLeadTimeDisplay(
			currentRules.min_booking_lead_time_hours ||
			  currentRules.effective_min_booking_lead_time
		  ),
		  description: getAContent("cmp_vetonest.com_Rule_MinBookingLeadTime_Desc") || "Total time you must book in advance",
		  icon: "⏰",
		},
		{
		  key: "4",
		  rule: getAContent("cmp_vetonest.com_Rule_MaxBookingLeadTime_Label") || "Max Booking Lead Time",
		  value: `${currentRules.max_booking_lead_time_days} ${getAContent("cmp_vetonest.com_Days_Label") || "days"}`,
		  description: getAContent("cmp_vetonest.com_Rule_MaxBookingLeadTime_Desc") || "Maximum days in advance you can book",
		  icon: "📅",
		},
		{
		  key: "5",
		  rule: getAContent("cmp_vetonest.com_Rule_VetAcceptanceDeadline_Label") || "Vet Acceptance Deadline",
		  value: `${currentRules.acceptance_deadline_days} ${getAContent("cmp_vetonest.com_Days_Label") || "days"}`,
		  description: getAContent("cmp_vetonest.com_Rule_VetAcceptanceDeadline_Desc") || "Vet must respond within this time after booking",
		  icon: "⏳",
		},
		{
		  key: "6",
		  rule: getAContent("cmp_vetonest.com_Rule_MinDuration_Label") || "Min Duration",
		  value: `${currentRules.min_duration_minutes} ${getAContent("cmp_vetonest.com_Minutes_Label") || "minutes"}`,
		  description: getAContent("cmp_vetonest.com_Rule_MinDuration_Desc") || "Minimum consultation duration",
		  icon: "⏱️",
		},
		// ─── NEW: Max Duration ──────────────────────────────────────────
		{
		  key: "7",
		  rule: getAContent("cmp_vetonest.com_Rule_MaxDuration_Label") || "Max Duration",
		  value: `${currentRules.max_duration_hours} ${getAContent("cmp_vetonest.com_Hours_Label") || "hours"}`,
		  description: getAContent("cmp_vetonest.com_Rule_MaxDuration_Desc") || "Maximum consultation duration",
		  icon: "⏱️",
		},
	  ];

	  // Add Requires Travel only if it's true
	  if (currentRules.requires_travel) {
		rulesList.push({
		  key: "8",
		  rule: getAContent("cmp_vetonest.com_Rule_RequiresTravel_Label") || "Requires Travel",
		  value: `✅ ${getAContent("cmp_vetonest.com_Yes_Label") || "Yes"}`,
		  description: getAContent("cmp_vetonest.com_Rule_RequiresTravel_Desc") || "Vet travels to your location",
		  icon: "🚗",
		});
	  }

	  return rulesList;
	}, [currentRules, getAContent]);

  // ─── Tab items with localized names ─────────────────────────────────────
  const tabItems = useMemo(() => {
    return allTypes.map((type) => {
      let displayName = type.display_name;
      
      if (type.type === 'home') {
        displayName = getAContent("cmp_vetonest.com_HomeConsultation_Label") || type.display_name || "Home Consultation";
      } else if (type.type === 'clinic') {
        displayName = getAContent("cmp_vetonest.com_ClinicConsultation_Label") || type.display_name || "Clinic Consultation";
      } else if (type.type === 'video') {
        displayName = getAContent("cmp_vetonest.com_VideoConsultation_Label") || type.display_name || "Video Consultation";
      }

      let description = type.description;
      if (type.type === 'home') {
        description = getAContent("cmp_vetonest.com_HomeConsultation_Description") || type.description || "Vet travels to pet owner's home.";
      } else if (type.type === 'clinic') {
        description = getAContent("cmp_vetonest.com_ClinicConsultation_Description") || type.description || "Pet owner visits the vet's clinic.";
      } else if (type.type === 'video') {
        description = getAContent("cmp_vetonest.com_VideoConsultation_Description") || type.description || "Remote consultation via video call.";
      }

      return {
        key: type.type,
        label: (
          <Space>
            <span style={{ fontSize: "16px" }}>{type.display_icon || "📋"}</span>
            <span>{displayName}</span>
            {type.is_active === false && (
              <Tag color="red">
                {getAContent("cmp_vetonest.com_Inactive_Label") || "Inactive"}
              </Tag>
            )}
          </Space>
        ),
        children: null,
        _localized: {
          displayName,
          description,
          icon: type.display_icon || "📋",
          color: type.color_hex || "#1890ff",
        },
      };
    });
  }, [allTypes, getAContent]);

  // ─── Render rules content for selected type ─────────────────────────────
  const renderRulesContent = () => {
    if (!currentRules || !allTypes.length) {
      return (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: "#888" }}>
            {getAContent("cmp_vetonest.com_LoadingRules_Txt") || "Loading rules..."}
          </p>
        </div>
      );
    }

    let displayName = currentRules.display_name || selectedType;
    let description = currentRules.description || "";
    let icon = currentRules.display_icon || "📋";
    let color = currentRules.color_hex || "#1890ff";

    if (selectedType === 'home') {
      displayName = getAContent("cmp_vetonest.com_HomeConsultation_Label") || displayName;
      description = getAContent("cmp_vetonest.com_HomeConsultation_Description") || description;
    } else if (selectedType === 'clinic') {
      displayName = getAContent("cmp_vetonest.com_ClinicConsultation_Label") || displayName;
      description = getAContent("cmp_vetonest.com_ClinicConsultation_Description") || description;
    } else if (selectedType === 'video') {
      displayName = getAContent("cmp_vetonest.com_VideoConsultation_Label") || displayName;
      description = getAContent("cmp_vetonest.com_VideoConsultation_Description") || description;
    }

    const displayInfo = {
      icon: icon,
      name: displayName,
      description: description,
      color: color,
    };

    return (
      <div className="rules-content">
        {/* ─── Type Description ────────────────────────────────────────────── */}
        <Alert
          message={
            <Space>
              <span style={{ fontSize: "24px" }}>{displayInfo.icon}</span>
              <Text strong style={{ fontSize: "16px" }}>
                {displayInfo.name}
              </Text>
              <Tag color={displayInfo.color}>
                {selectedType === 'home' 
                  ? getAContent("cmp_vetonest.com_Home_Label") || "Home"
                  : selectedType === 'clinic'
                    ? getAContent("cmp_vetonest.com_Clinic_Label") || "Clinic"
                    : getAContent("cmp_vetonest.com_Video_Label") || "Video"}
              </Tag>
            </Space>
          }
          description={displayInfo.description}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: "16px" }}
        />

        {/* ─── Quick Stats Cards ──────────────────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={12} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title={getAContent("cmp_vetonest.com_BookInAdvance_Label") || "Book in Advance"}
                value={formatLeadTimeDisplay(
                  currentRules.min_booking_lead_time_hours ||
                    currentRules.effective_min_booking_lead_time
                )}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ fontSize: "16px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title={getAContent("cmp_vetonest.com_MinBookingLeadTime_Label") || "Min Booking Lead Time"}
                value={formatLeadTimeDisplay(
                  currentRules.min_booking_lead_time_hours ||
                    currentRules.effective_min_booking_lead_time
                )}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ fontSize: "16px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title={getAContent("cmp_vetonest.com_MinDuration_Label") || "Min Duration"}
                value={`${currentRules.min_duration_minutes} ${getAContent("cmp_vetonest.com_Minutes_Label") || "min"}`}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ fontSize: "16px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title={getAContent("cmp_vetonest.com_Price_Label") || "Price"}
                value={getAContent("cmp_vetonest.com_DefinedByVet_Label") || "Defined by vet"}
                prefix={<DollarOutlined />}
                valueStyle={{ fontSize: "14px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* ─── Detailed Rules Table ───────────────────────────────────────── */}
        <Divider orientation="left">
          <Text strong>
            {getAContent("cmp_vetonest.com_DetailedRules_Label") || "Detailed Rules"}
          </Text>
        </Divider>

        <Card size="small" style={{ marginBottom: "16px" }}>
          <Table
            dataSource={ruleData}
            columns={[
              {
                title: getAContent("cmp_vetonest.com_Rule_Column") || "Rule",
                dataIndex: "rule",
                key: "rule",
                width: "30%",
                render: (text, record) => (
                  <Space>
                    <span>{record.icon}</span>
                    <Text strong>{text}</Text>
                  </Space>
                ),
              },
              {
                title: getAContent("cmp_vetonest.com_Value_Column") || "Value",
                dataIndex: "value",
                key: "value",
                width: "25%",
                render: (text) => <Tag color="blue">{text}</Tag>,
              },
              {
                title: getAContent("cmp_vetonest.com_Description_Column") || "Description",
                dataIndex: "description",
                key: "description",
                width: "45%",
                render: (text) => <Text type="secondary">{text}</Text>,
              },
            ]}
            pagination={false}
            size="small"
            bordered
          />
        </Card>

        {/* ─── Info Sections Side by Side ─────────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          {/* ─── Vet Calendar Section ──────────────────────────────────────── */}
          <Col xs={24} md={12}>
            <Alert
              message={
                <Space>
                  <CalendarIcon style={{ fontSize: "18px" }} />
                  <Text strong>
                    {getAContent("cmp_vetonest.com_VetCalendar_Note_Title") || "Vet's Calendar"}
                  </Text>
                </Space>
              }
              description={
                <div>
                  <p style={{ marginBottom: 4 }}>
                    {getAContent("cmp_vetonest.com_VetCalendar_Note_Desc") || 
                      "Business hours and available days are defined by each veterinarian's individual calendar."}
                  </p>
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>
                      {getAContent("cmp_vetonest.com_VetCalendar_Note_Item1") || 
                        "Each vet sets their own working hours and days"}
                    </li>
                    <li>
                      {getAContent("cmp_vetonest.com_VetCalendar_Note_Item2") || 
                        "Availability is shown when you select a date and time"}
                    </li>
                    <li>
                      {getAContent("cmp_vetonest.com_VetCalendar_Note_Item3") || 
                        "Vets can update their schedule at any time"}
                    </li>
                  </ul>
                </div>
              }
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ height: "100%" }}
            />
          </Col>

          {/* ─── Special Notes Section ─────────────────────────────────────── */}
          <Col xs={24} md={12}>
            {selectedType === "home" && (
              <Alert
                message={getAContent("cmp_vetonest.com_HomeConsultation_Notes_Title") || "🏠 Home Consultation Notes"}
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>{getAContent("cmp_vetonest.com_HomeConsultation_Notes_Item1") || "Vet will travel to your location"}</li>
                    <li>{getAContent("cmp_vetonest.com_HomeConsultation_Notes_Item2") || "Please ensure parking is available"}</li>
                    <li>{getAContent("cmp_vetonest.com_HomeConsultation_Notes_Item3") || "Someone must be home during the appointment"}</li>
                    <li>{getAContent("cmp_vetonest.com_HomeConsultation_Notes_Item4") || "Allow extra time for travel delays"}</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ height: "100%" }}
              />
            )}

            {selectedType === "video" && (
              <Alert
                message={getAContent("cmp_vetonest.com_VideoConsultation_Tips_Title") || "💻 Video Consultation Tips"}
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>{getAContent("cmp_vetonest.com_VideoConsultation_Tips_Item1") || "Ensure stable internet connection"}</li>
                    <li>{getAContent("cmp_vetonest.com_VideoConsultation_Tips_Item2") || "Have your pet nearby"}</li>
                    <li>{getAContent("cmp_vetonest.com_VideoConsultation_Tips_Item3") || "Prepare any medical records"}</li>
                    <li>{getAContent("cmp_vetonest.com_VideoConsultation_Tips_Item4") || "Find a quiet space for the call"}</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ height: "100%" }}
              />
            )}

            {selectedType === "clinic" && (
              <Alert
                message={getAContent("cmp_vetonest.com_ClinicConsultation_Notes_Title") || "🏥 Clinic Consultation Notes"}
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>{getAContent("cmp_vetonest.com_ClinicConsultation_Notes_Item1") || "Visit the vet's clinic at the scheduled time"}</li>
                    <li>{getAContent("cmp_vetonest.com_ClinicConsultation_Notes_Item2") || "Bring your pet's medical records if available"}</li>
                    <li>{getAContent("cmp_vetonest.com_ClinicConsultation_Notes_Item3") || "Arrive 5-10 minutes early for check-in"}</li>
                    <li>{getAContent("cmp_vetonest.com_ClinicConsultation_Notes_Item4") || "Full equipment and staff available on-site"}</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ height: "100%" }}
              />
            )}
          </Col>
        </Row>

        {/* ─── Test Booking Validation ────────────────────────────────────── */}
        <Divider orientation="left">
          <Text strong>
            {getAContent("cmp_vetonest.com_TestBooking_Label") || "Test Booking Validation"}
          </Text>
        </Divider>

        <Card size="small" style={{ marginBottom: "16px" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button onClick={handleTestBooking} size="middle">
              {getAContent("cmp_vetonest.com_TestBooking_Button") || "Test Booking (24 hours from now)"}
            </Button>

            {validationResult ? (
              <Alert
                message={
                  validationResult.allowed
                    ? getAContent("cmp_vetonest.com_TestBooking_Allowed") || "✅ Booking Allowed"
                    : getAContent("cmp_vetonest.com_TestBooking_NotAllowed") || "❌ Booking Not Allowed"
                }
                description={
                  <div>
                    <p>
                      <strong>
                        {getAContent("cmp_vetonest.com_TestBooking_DateTested") || "Date Tested"}:
                      </strong>{" "}
                      {testDateTime?.toLocaleString()}
                    </p>
                    <p>
                      <strong>{getAContent("cmp_vetonest.com_Reason_Label") || "Reason"}:</strong> {validationResult.reason}
                    </p>
                    {validationResult.earliestTime && (
                      <p>
                        <strong>
                          {getAContent("cmp_vetonest.com_TestBooking_EarliestTime") || "Earliest Time"}:
                        </strong>{" "}
                        {validationResult.earliestTime.toLocaleString()}
                      </p>
                    )}
                    {validationResult.openingHour && (
                      <p>
                        <strong>
                          {getAContent("cmp_vetonest.com_TestBooking_BusinessHours") || "Business Hours"}:
                        </strong>{" "}
                        {validationResult.openingHour}:00 -{" "}
                        {validationResult.closingHour}:00
                      </p>
                    )}
                  </div>
                }
                type={validationResult.allowed ? "success" : "warning"}
                showIcon
              />
            ) : (
              <Text type="secondary">
                {getAContent("cmp_vetonest.com_TestBooking_Instruction") ||
                  'Click "Test Booking" to validate if a booking would be allowed for this consultation type. The test will use a time 24 hours from now.'}
              </Text>
            )}
          </Space>
        </Card>
      </div>
    );
  };

  // ─── Render loading state ───────────────────────────────────────────────
  if (loading || rulesLoading) {
    return (
      <ConsultationLayout
        title={getAContent("cmp_vetonest.com_ConsultationRules_Title") || "Consultation Rules"}
        hideBookButton={true}
      >
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: "#888" }}>
            {getAContent("cmp_vetonest.com_LoadingRules_Txt") || "Loading consultation rules..."}
          </p>
        </div>
      </ConsultationLayout>
    );
  }

  // ─── Render no data state ──────────────────────────────────────────────
  if (!allTypes || allTypes.length === 0) {
    return (
      <ConsultationLayout
        title={getAContent("cmp_vetonest.com_ConsultationRules_Title") || "Consultation Rules"}
        hideBookButton={true}
      >
        <Alert
          message={getAContent("cmp_vetonest.com_NoRulesAvailable_Title") || "No Consultation Types Available"}
          description={getAContent("cmp_vetonest.com_NoRulesAvailable_Desc") || "There are no consultation types configured. Please contact the administrator."}
          type="warning"
          showIcon
          style={{ margin: "20px 0" }}
        />
      </ConsultationLayout>
    );
  }

  // ─── Render the page ─────────────────────────────────────────────────────
  return (
    <ConsultationLayout
      title={getAContent("cmp_vetonest.com_ConsultationRules_Title") || "Consultation Rules & Information"}
      hideBookButton={true}
    >
      <div className="consultation-rules-page">
        {/* ─── Page Header ─────────────────────────────────────────────────── */}
        <div className="page-header" style={{ marginBottom: "16px" }}>
          <Paragraph type="secondary" style={{ fontSize: "14px" }}>
            <InfoCircleOutlined />{" "}
            {getAContent("cmp_vetonest.com_ConsultationRules_Subtitle") ||
              "Review the rules and requirements for each consultation type. These rules help ensure quality care and proper preparation."}
          </Paragraph>
        </div>

        {/* ─── Consultation Type Tabs ─────────────────────────────────────── */}
        <Tabs
          activeKey={selectedType}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          size="large"
          style={{ marginBottom: "16px" }}
        />

        {/* ─── Rules Content ───────────────────────────────────────────────── */}
        {renderRulesContent()}

        {/* ─── Footer Note ─────────────────────────────────────────────────── */}
        <div
          className="footer-note"
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#fafafa",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <SafetyOutlined />{" "}
            {getAContent("cmp_vetonest.com_RulesFooter_Text") ||
              "All rules are configured by the platform administrator and apply to all consultations."}
          </Text>
        </div>
      </div>

      <style jsx>{`
        .consultation-rules-page {
          width: 100%;
        }

        .rules-content {
          padding: 4px 0;
        }

        @media (max-width: 768px) {
          .page-header {
            margin-bottom: 12px;
          }
          .page-header p {
            font-size: 13px;
          }
          .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
            padding: 8px 12px;
          }
        }

        @media (max-width: 480px) {
          .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
            padding: 6px 10px;
            font-size: 12px;
          }
          .ant-statistic-title {
            font-size: 11px;
          }
          .ant-statistic-content {
            font-size: 14px !important;
          }
        }
      `}</style>
    </ConsultationLayout>
  );
};

export default ConsultationRules;