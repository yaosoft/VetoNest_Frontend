import React, { useMemo, useState, useEffect } from "react";
import { Table, Button, Avatar, Modal, notification, Tag, Spin } from "antd";

// import '../../bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css';
// ---------------------------------------------
// ClinicPage.jsx (mock user role detection)
// ---------------------------------------------
const Clinic = () => {

  // Read only userId from query string
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const userId = params.get("userId") || null;

  // Internal state for role and currentVetId if relevant
  const [role, setRole] = useState(null);
  const [currentVetId, setCurrentVetId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const MOCK_CLINIC = {
    id: "clinic-1",
    title: "Demo pets facility",
    description: "A friendly facility providing vet care across locations.",
    locations: [
      { city: "Douala", address: "12 Rue des Acacias" },
      { city: "Yaoundé", address: "45 Boulevard Central" },
    ],
  };

  const MOCK_VETS = [
    {
      id: "vet-1",
      photo: undefined,
      name: "Dr. Amina Kouyate",
      biography: "10 years experience in small animals. Loves surgery and preventative care.",
      speciality: "Surgery",
      createdAt: "2025-10-01T08:30:00Z",
    },
    {
      id: "vet-2",
      photo: undefined,
      name: "Dr. John Mbappe",
      biography: "Focus on exotic pets and rehabilitation.",
      speciality: "Exotics",
      createdAt: "2025-09-19T11:00:00Z",
    },
  ];

  const MOCK_INVITATIONS = [
    {
      id: "inv-1",
      name: "Dr. Fatou Diop",
      biography: "Interested in community outreach programmes.",
      status: "NOT_VIEWED",
      sentAt: "2025-10-10T09:00:00Z",
    },
    {
      id: "inv-2",
      name: "Dr. Pierre N’Guessan",
      biography: "Large animal specialist.",
      status: "VIEWED",
      sentAt: "2025-09-02T16:00:00Z",
    },
  ];

  const [clinic] = useState(MOCK_CLINIC);
  const [vets, setVets] = useState(MOCK_VETS);
  const [invitations, setInvitations] = useState(MOCK_INVITATIONS);
  const [invitationMessage] = useState(
    "You have been invited to join Demo pets facility as a collaborating veterinarian."
  );

  // Mock API call to detect role
  useEffect(() => {
    setLoading(true);
    // Simulate an async call
    setTimeout(() => {
      if (!userId) {
        setRole("CLIENT");
      } else if (userId === "1") {
        setRole("CREATOR");
      } else if (userId === "2") {
        setRole("INVITED_VET");
      } else if (userId === "3") {
        setRole("VET_MEMBER");
        setCurrentVetId("vet-1");
      } else {
        setRole("CLIENT");
      }
      setLoading(false);
    }, 1000);
  }, [userId]);

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const resendInvitation = (id) => {
    setInvitations((prev) =>
      prev.map((it) => (it.id === id ? { ...it, sentAt: new Date().toISOString(), status: "NOT_VIEWED" } : it))
    );
    notification.success({ message: "Invitation resent" });
  };

  const acceptInvitation = (id) => {
    const inv = invitations.find((i) => i.id === id);
    if (!inv) return;
    const newVet = {
      id: `vet-${Math.random().toString(36).substr(2, 5)}`,
      name: inv.name,
      biography: inv.biography,
      speciality: "General",
      createdAt: new Date().toISOString(),
    };
    setVets((prev) => [newVet, ...prev]);
    setInvitations((prev) => prev.filter((i) => i.id !== id));
    notification.success({ message: `${inv.name} accepted the invitation` });
  };

  const declineInvitation = (id) => {
    const inv = invitations.find((i) => i.id === id);
    if (!inv) return;
    setInvitations((prev) => prev.filter((i) => i.id !== id));
    notification.info({ message: `${inv.name} declined the invitation` });
  };

  const quitClinic = (vetId) => {
    Modal.confirm({
      title: "Quit clinic",
      content: "Are you sure you want to quit this clinic?",
      onOk() {
        setVets((prev) => prev.filter((v) => v.id !== vetId));
        notification.success({ message: "You have left the clinic" });
      },
    });
  };

  const vetColumns = [
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (_, record) => (
        <Avatar src={record.photo} style={{ backgroundColor: "#87d068" }}>
          {record.name.charAt(0)}
        </Avatar>
      ),
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Biography",
      dataIndex: "biography",
      key: "biography",
      render: (t) => <div style={{ maxWidth: 420, whiteSpace: "normal" }}>{t}</div>,
    },
    {
      title: "Speciality",
      dataIndex: "speciality",
      key: "speciality",
      width: 160,
    },
    {
      title: "Date of insertion",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (d) => formatDate(d),
    },
    ...(role === "VET_MEMBER"
      ? [
          {
            title: "Action",
            key: "action",
            width: 120,
            render: (_, record) =>
              record.id === currentVetId ? (
                <Button danger onClick={() => quitClinic(record.id)}>
                  Quit
                </Button>
              ) : null,
          },
        ]
      : []),
  ];

  const invitationColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Biography",
      dataIndex: "biography",
      key: "biography",
      render: (t) => <div style={{ maxWidth: 420 }}>{t}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (s) => (s === "VIEWED" ? <Tag color="blue">Viewed</Tag> : <Tag color="orange">Not viewed</Tag>),
    },
    {
      title: "Date of sending",
      dataIndex: "sentAt",
      key: "sentAt",
      width: 200,
      render: (d) => formatDate(d),
    },
    {
      title: "Resend",
      key: "resend",
      width: 120,
      render: (_, record) => <Button onClick={() => resendInvitation(record.id)}>Resend</Button>,
    },
  ];

  const pendingInvitation = invitations.find((i) => i.status === "NOT_VIEWED") || invitations[0] || null;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spin size="large" />
      </div>
    );
  }

  return (
  <>
  <Header />
    <div className="container py-4">
      <div className="row mb-3">
        <div className="col-12">
          <h1>{clinic.title}</h1>
          <p className="text-muted">{clinic.description}</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <h5>Locations</h5>
          <div className="d-flex gap-3 flex-wrap">
            {clinic.locations.map((loc, idx) => (
              <div key={idx} className="border rounded p-2" style={{ minWidth: 180 }}>
                <strong>{loc.city}</strong>
                <div className="small">{loc.address}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {role === "CREATOR" && (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <h4>Vets</h4>
              <Table rowKey={(r) => r.id} dataSource={vets} columns={vetColumns} pagination={{ pageSize: 5 }} />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <h4>Invitations</h4>
              <Table
                rowKey={(r) => r.id}
                dataSource={invitations}
                columns={invitationColumns}
                pagination={{ pageSize: 5 }}
              />
            </div>
          </div>
        </>
      )}

      {role === "INVITED_VET" && (
        <div className="row">
          <div className="col-12">
            <div className="card p-3 mb-3">
              <h5>Invitation</h5>
              <p>{invitationMessage}</p>
              {pendingInvitation ? (
                <div>
                  <Button type="primary" className="me-2" onClick={() => acceptInvitation(pendingInvitation.id)}>
                    Accept
                  </Button>
                  <Button danger onClick={() => declineInvitation(pendingInvitation.id)}>
                    Decline
                  </Button>
                </div>
              ) : (
                <div className="text-muted">No pending invitation found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {role === "VET_MEMBER" && (
        <div className="row mb-3">
          <div className="col-12">
            <h4>Vets</h4>
            <Table rowKey={(r) => r.id} dataSource={vets} columns={vetColumns} pagination={{ pageSize: 5 }} />
          </div>
        </div>
      )}

      {role === "CLIENT" && (
        <div className="row mb-3">
          <div className="col-12">
            <h4>Vets</h4>
            <Table rowKey={(r) => r.id} dataSource={vets} columns={vetColumns} pagination={{ pageSize: 5 }} />
          </div>
        </div>
      )}
    </div>
	<Footer />
	</>
  );
}

export default Clinic;