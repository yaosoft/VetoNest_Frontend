// src/components/VetEarnings.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, Statistic, Table, Spin, Empty, Tag, message, Select, Button, Tooltip } from "antd";
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, InfoCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import ConsultationLayout from "../ConsultationLayout";

const { Option } = Select;

const VetEarnings = () => {
  const { profileId } = useContext(AuthContext);
  const {
    getAContent,
    apiCall,
    siteLocale,
  } = useContext(SiteContext);

  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [timeRange, setTimeRange] = useState('year');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalCaptured, setTotalCaptured] = useState(0);
  const [totalAuthorized, setTotalAuthorized] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0); // ← ADD THIS LINE

  // Helper for translations
  const t = (key, fallback = '') => {
    const val = getAContent(key);
    return (val && val !== '***' && val !== '...') ? val : fallback;
  };

  // ── Fetch earnings data ──────────────────────────────────────────────────────
  const fetchEarnings = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const response = await apiCall(
        `/consultation/vet/earnings?profileVetoId=${profileId}&period=${period}&range=${timeRange}`,
        {
          method: 'GET',
        }
      );

      if (response?.success) {
        setEarningsData(response.data);
        setBookings(response.bookings || []);
        setTotalEarnings(response.totalEarnings || 0);
        setTotalCaptured(response.totalCaptured || 0);
        setTotalAuthorized(response.totalAuthorized || 0);
        setTotalBookings(response.totalBookings || 0);
        setPendingPayout(response.pendingPayout || 0); // ← ADD THIS LINE
      } else {
        message.error(response?.error || t('cmp_vetonest.com_ErrorLoading_Txt', 'Error loading earnings'));
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      message.error(t('cmp_vetonest.com_ErrorLoading_Txt', 'Error loading earnings'));
    } finally {
      setLoading(false);
    }
  }, [profileId, period, timeRange, apiCall]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // ── Format date ─────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(siteLocale || 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = [
    {
      title: t('cmp_vetonest.com_Date_Label', 'Date'),
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => formatDate(date?.date || date),
      sorter: (a, b) => new Date(a.createdAt?.date || a.createdAt) - new Date(b.createdAt?.date || b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: t('cmp_vetonest.com_Pet_Label', 'Pet'),
      dataIndex: 'carnetAnimal',
      key: 'pet',
      render: (pet) => pet?.nom || '—',
    },
    {
      title: t('cmp_vetonest.com_Type_Label', 'Type'),
      dataIndex: 'consultationType',
      key: 'type',
      render: (type) => {
        if (!type) return '—';
        const typeName = type.tagRef ? t(type.tagRef, type.nom) : type.nom;
        return typeName || '—';
      },
    },
    {
      title: t('cmp_vetonest.com_Amount_Label', 'Amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount ? `${amount.toFixed(2)} €` : '—',
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: t('cmp_vetonest.com_Status_Label', 'Status'),
      dataIndex: 'payment',
      key: 'status',
      render: (payment) => {
        if (!payment) return <Tag>—</Tag>;
        const status = payment.paymentStatus;
        if (status === 'captured') {
          return <Tag color="success" icon={<CheckCircleOutlined />}>
            {t('cmp_vetonest.com_PaymentCaptured_Label', 'Captured')}
          </Tag>;
        } else if (status === 'authorized') {
          return <Tag color="warning" icon={<CheckCircleOutlined />}>
            {t('cmp_vetonest.com_PaymentAuthorized_Label', 'Authorized')}
          </Tag>;
        } else if (status === 'pending') {
          return <Tag color="processing">
            {t('cmp_vetonest.com_PaymentPending_Label', 'Pending')}
          </Tag>;
        } else if (status === 'failed') {
          return <Tag color="error">
            {t('cmp_vetonest.com_PaymentFailed_Label', 'Failed')}
          </Tag>;
        }
        return <Tag>{status || '—'}</Tag>;
      },
    },
    {
      title: t('cmp_vetonest.com_PayoutStatus_Label', 'Payout Status'),
      dataIndex: 'payout',
      key: 'payoutStatus',
      render: (payout) => {
        if (!payout) return <Tag>—</Tag>;
        const status = payout.payoutStatus;
        if (status === 'paid') {
          return <Tag color="success" icon={<CheckCircleOutlined />}>
            {t('cmp_vetonest.com_PayoutPaid_Label', 'Paid')}
          </Tag>;
        } else if (status === 'in_transit') {
          return <Tag color="processing">
            {t('cmp_vetonest.com_PayoutInTransit_Label', 'In Transit')}
          </Tag>;
        } else if (status === 'pending') {
          return <Tag color="warning">
            {t('cmp_vetonest.com_PayoutPending_Label', 'Pending')}
          </Tag>;
        } else if (status === 'failed') {
          return <Tag color="error">
            {t('cmp_vetonest.com_PayoutFailed_Label', 'Failed')}
          </Tag>;
        }
        return <Tag>{status || '—'}</Tag>;
      },
    }
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ConsultationLayout title={t('cmp_vetonest.com_MyEarnings_Label', 'My Earnings')}>
      <div className="vet-earnings">
        {/* ─── Filters ────────────────────────────────────────────────────── */}
        <div className="filter-bar">
          <Select
            value={period}
            onChange={setPeriod}
            className="filter-select"
            style={{ minWidth: 150 }}
            placeholder={t('cmp_vetonest.com_Period_Label', 'Period')}
          >
            <Option value="daily">{t('cmp_vetonest.com_Daily_Label', 'Daily')}</Option>
            <Option value="weekly">{t('cmp_vetonest.com_Weekly_Label', 'Weekly')}</Option>
            <Option value="monthly">{t('cmp_vetonest.com_Monthly_Label', 'Monthly')}</Option>
            <Option value="yearly">{t('cmp_vetonest.com_Yearly_Label', 'Yearly')}</Option>
          </Select>

          <Select
            value={timeRange}
            onChange={setTimeRange}
            className="filter-select"
            style={{ minWidth: 150 }}
            placeholder={t('cmp_vetonest.com_TimeRange_Label', 'Time Range')}
          >
            <Option value="month">{t('cmp_vetonest.com_Last30Days_Label', 'Last 30 days')}</Option>
            <Option value="quarter">{t('cmp_vetonest.com_Last3Months_Label', 'Last 3 months')}</Option>
            <Option value="year">{t('cmp_vetonest.com_Last12Months_Label', 'Last 12 months')}</Option>
            <Option value="all">{t('cmp_vetonest.com_AllTime_Label', 'All time')}</Option>
          </Select>

          <Tooltip title={t('cmp_vetonest.com_Refresh_Tooltip', 'Refresh')}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchEarnings} 
              loading={loading}
              className="filter-refresh-btn"
            />
          </Tooltip>
        </div>

        {/* ─── Stats Cards ────────────────────────────────────────────────── */}
        {!loading && earningsData && (
          <div className="earnings-stats">
            <Card>
              <Statistic
                title={
                  <span>
                    {t('cmp_vetonest.com_TotalEarnings_Label', 'Total Earnings')}
                    <Tooltip 
                      title={
                        <div>
                          <p style={{ margin: 0 }}>
                            {t('cmp_vetonest.com_EarningsNote_Tooltip', 'Total Earnings reflect your consultation price after platform fees have been deducted. Platform fee: 15% + 2€')}
                          </p>
                        </div>
                      }
                      placement="top"
                    >
                      <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6, color: '#3f8600', cursor: 'pointer' }} />
                    </Tooltip>
                  </span>
                }
                value={totalEarnings}
                precision={2}
                prefix="€"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
            <Card>
              <Statistic
                title={t('cmp_vetonest.com_CapturedAmount_Label', 'Captured')}
                value={totalCaptured}
                precision={2}
                prefix="€"
                valueStyle={{ color: '#52c41a' }}
                suffix={<CheckCircleOutlined style={{ fontSize: 14, color: '#52c41a' }} />}
              />
            </Card>
            <Card>
              <Statistic
                title={
                  <span>
                    {t('cmp_vetonest.com_AuthorizedAmount_Label', 'Authorized (Pending)')}
                    <Tooltip 
                      title={
                        <div>
                          <p style={{ margin: 0 }}>
                            {t('cmp_vetonest.com_PayoutSchedule_Tooltip', 'Payments are processed weekly on Tuesdays.')}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', opacity: 0.8 }}>
                            {t('cmp_vetonest.com_PayoutSchedule_Detail', 'Funds will move to "Captured" once the consultation is accepted and completed.')}
                          </p>
                        </div>
                      }
                      placement="top"
                    >
                      <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6, color: '#faad14', cursor: 'pointer' }} />
                    </Tooltip>
                  </span>
                }
                value={totalAuthorized}
                precision={2}
                prefix="€"
                valueStyle={{ color: '#faad14' }}
                suffix={<ClockCircleOutlined style={{ fontSize: 14, color: '#faad14' }} />}
              />
            </Card>
            <Card>
              <Statistic
                title={
                  <span>
                    {t('cmp_vetonest.com_PendingPayout_Label', 'Pending Payout')}
                    <Tooltip 
                      title={t('cmp_vetonest.com_PendingPayout_Tooltip', 'Amount being processed for payout this week')}
                      placement="top"
                    >
                      <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6, color: '#1890ff', cursor: 'pointer' }} />
                    </Tooltip>
                  </span>
                }
                value={pendingPayout}
                precision={2}
                prefix="€"
                valueStyle={{ color: '#1890ff' }}
                suffix={<ClockCircleOutlined style={{ fontSize: 14, color: '#1890ff' }} />}
              />
            </Card>
            <Card>
              <Statistic
                title={t('cmp_vetonest.com_TotalBookings_Label', 'Total Bookings')}
                value={totalBookings}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </div>
        )}

        {/* ─── Payout Schedule Information ──────────────────────────────── */}
        {!loading && earningsData && (
          <div className="payout-info" style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: '8px', 
            padding: '12px 16px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <CalendarOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
            <span style={{ fontSize: '14px', color: '#333' }}>
              <strong>{t('cmp_vetonest.com_PayoutSchedule_Title', 'Payout Schedule:')}</strong>{' '}
              {t('cmp_vetonest.com_PayoutSchedule_WeeklyTuesday', 'Every Tuesday (weekly)')}
            </span>
            <span style={{ fontSize: '13px', color: '#666', marginLeft: 'auto' }}>
              <Tooltip 
                title={t('cmp_vetonest.com_PayoutSchedule_LearnMore', 'Learn more about how payouts work')}
                placement="bottom"
              >
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  style={{ color: '#1890ff', textDecoration: 'underline' }}
                >
                  {t('cmp_vetonest.com_LearnMore_Label', 'Learn more')} →
                </a>
              </Tooltip>
            </span>
          </div>
        )}

        {/* ─── Bookings Table ────────────────────────────────────────────── */}
        <Card title={t('cmp_vetonest.com_BookingHistory_Label', 'Booking History')}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : bookings.length === 0 ? (
            <Empty 
              description={t('cmp_vetonest.com_NoEarningsFound_Txt', 'No earnings found for this period')}
              style={{ padding: '40px 0' }}
            />
          ) : (
            <Table
              dataSource={bookings}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `${total} ${t('cmp_vetonest.com_Items_Label', 'items')}`,
              }}
              locale={{
                emptyText: t('cmp_vetonest.com_NoData_Label', 'No data'),
              }}
            />
          )}
        </Card>

        {/* ─── Summary by Period ──────────────────────────────────────────── */}
        {!loading && earningsData?.summary && earningsData.summary.length > 0 && (
          <Card 
            title={t('cmp_vetonest.com_SummaryByPeriod_Label', 'Summary by Period')}
            style={{ marginTop: '20px' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>
                      {t('cmp_vetonest.com_Period_Label', 'Period')}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>
                      {t('cmp_vetonest.com_TotalEarnings_Label', 'Total')}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>
                      {t('cmp_vetonest.com_Captured_Label', 'Captured')}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>
                      {t('cmp_vetonest.com_Authorized_Label', 'Authorized')}
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>
                      {t('cmp_vetonest.com_Bookings_Label', 'Bookings')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {earningsData.summary.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '10px 12px' }}>
                        {item.period}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 500, color: '#3f8600' }}>
                        €{item.total?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#52c41a' }}>
                        €{item.captured?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#faad14' }}>
                        €{item.authorized?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {item.count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {earningsData.summaryTotals && (
                  <tfoot>
                    <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                      <td style={{ padding: '10px 12px' }}>
                        {t('cmp_vetonest.com_Total_Label', 'Total')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3f8600' }}>
                        €{earningsData.summaryTotals.total?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#52c41a' }}>
                        €{earningsData.summaryTotals.captured?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#faad14' }}>
                        €{earningsData.summaryTotals.authorized?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {earningsData.summaryTotals.count || 0}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        )}
      </div>

      <style jsx>{`
        .vet-earnings {
          width: 100%;
          padding: 0 4px;
        }
        
        /* ─── Same filter bar styling as ConsultationListVet ─────────────── */
        .filter-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          align-items: center;
        }
        
        .filter-select {
          min-width: 150px;
        }
        
        .filter-refresh-btn {
          background: #ffffff !important;
          border-color: #d9d9d9 !important;
          border-radius: 6px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .filter-refresh-btn:hover {
          border-color: #40a9ff !important;
          color: #40a9ff !important;
        }

        .earnings-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        @media (max-width: 768px) {
          .earnings-stats {
            grid-template-columns: 1fr 1fr;
          }
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-select {
            width: 100% !important;
            min-width: unset !important;
          }
          .filter-refresh-btn {
            width: 100%;
          }
          .payout-info {
            flex-direction: column;
            text-align: center;
          }
          .payout-info span:last-child {
            margin-left: 0 !important;
          }
        }
        @media (max-width: 480px) {
          .earnings-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ConsultationLayout>
  );
};

export default VetEarnings;