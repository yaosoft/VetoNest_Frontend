import React, { useState, useContext, useEffect } from "react";
import { Badge, Dropdown, List, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";
import { Link } from "react-router-dom";

const Notifications = () => {
  // contexts
  const { userId } = useContext(AuthContext);

  const {
    getUserNotifications,
    generateRandomDigits,
    notificationViewed,
    getAContent,
  } = useContext(SiteContext);

  // state
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [open, setOpen] = useState(false);
  
  // mark notification as viewed
  const handleNotificationClick = async (notificationId) => {
    try {
      await notificationViewed({ notificationId });
      setUnread((prev) => Math.max(prev - 1, 0));
      setOpen(false);
      // Refresh the list so the bold styling updates immediately
      await loadNotifications();
    } catch (err) {
      console.error("Notification update error", err);
    }
  };

  // build notification item
  const buildNotification = (notification) => {
    let notificationText = "";
    let linkTo = "/";

    if (notification.notificationTypeId === 1) {
      notificationText =
        getAContent("cmp_vetonest.com_Yr82Ld55Qx") +
        " " +
        notification.etablissementName;
      linkTo = `/etablissement?userId=${userId}&etablissementId=${notification.etablissementId}`;
    }

    if (notification.notificationTypeId === 2) {
      notificationText =
        getAContent("cmp_vetonest.com_InvSent_Txt") + " " +
        notification.receiverName + " " +
        getAContent("cmp_vetonest.com_InvAcc_Txt");
      linkTo = `/etablissement?userId=${userId}&etablissementId=${notification.etablissementId}`;
    }

    if (notification.notificationTypeId === 3) {
      notificationText =
        getAContent("cmp_vetonest.com_InvSent_Txt") + " " +
        notification.receiverName + " " +
        getAContent("cmp_vetonest.com_InvDecl_Txt");
      linkTo = `/etablissement?userId=${userId}&etablissementId=${notification.etablissementId}`;
    }

    // ── Appointment notifications ──────────────────────────────────────────
    if (notification.notificationTypeId === 4) {
      notificationText = getAContent("cmp_vetonest.com_Notif_AppointReceived_Txt") || "You received an appointment request";
      linkTo = "/consultation/list";
    }

    if (notification.notificationTypeId === 5) {
      notificationText = getAContent("cmp_vetonest.com_Notif_AppointDeclined_Txt") || "Your appointment request was declined";
      linkTo = "/consultation/list";
    }

    if (notification.notificationTypeId === 6) {
      notificationText = getAContent("cmp_vetonest.com_Notif_AppointAccepted_Txt") || "Your appointment request was accepted";
      linkTo = "/consultation/list";
    }

    return {
      id: generateRandomDigits(3),
      text: (
        <Link
          to={linkTo}
          onClick={() => handleNotificationClick(notification.id)}
          style={{ fontWeight: notification.viewed ? "normal" : "bold" }}
        >
          {notificationText}
        </Link>
      ),
    };
  };

  // load notifications when dropdown opens
  const loadNotifications = async () => {
    setNotificationTitle(
      await getAContent("cmp_vetonest.com_Tp92Ka61Wm")
    );

    const userNotifications = await getUserNotifications(userId);
    if (!userNotifications) return;

    const unreadNotifications = userNotifications.filter(
      (n) => !n.viewed
    );
    const readNotifications = userNotifications.filter(
      (n) => n.viewed
    );

    setUnread(unreadNotifications.length);

    const finalNotifications = [];

    if (unreadNotifications.length > 0) {
      finalNotifications.push({
        id: "unread-title",
        text: (
          <strong className="notification-section">
            { getAContent( 'cmp_vetonest.com_Un84Ks39Wp' ) };
          </strong>
        ),
      });

      unreadNotifications.forEach((n) =>
        finalNotifications.push(buildNotification(n))
      );
    }

    if (readNotifications.length > 0) {
      finalNotifications.push({
        id: "read-title",
        text: (
          <strong className="notification-section">
		  { getAContent( 'cmp_vetonest.com_Ea19Qw72Lp' ) };
          </strong>
        ),
      });

      readNotifications.forEach((n) =>
        finalNotifications.push(buildNotification(n))
      );
    }

    setNotifications(finalNotifications);
  };


  // Load unread count on mount only
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!userId) return;
      const userNotifications = await getUserNotifications(userId);
      if (!userNotifications) return;
      setUnread(userNotifications.filter((n) => !n.viewed).length);
    };
    loadUnreadCount();
  }, [userId]);


  // dropdown content
  const dropdownContent = (
    <div className="notifications-popup">
      <div style={{ padding: 2, fontSize: 12 }}>
        <b>{notificationTitle}</b>
      </div>

      <List
        dataSource={notifications}
        locale={{
          emptyText: getAContent(
            "cmp_vetonest.com_Nt71Qm82La"
          ),
        }}
        renderItem={(item) => (
          <List.Item>{item.text}</List.Item>
        )}
        style={{ maxHeight: 240, overflowY: "auto" }}
      />

      <div style={{ padding: 8, textAlign: "center" }}>
        <Button type="link" size="small" onClick={() => setUnread(0)}>
          {getAContent("cmp_vetonest.com_Ma63Ps40Rw")}
        </Button>
      </div>
    </div>
  );

  return (
	<Dropdown
	  trigger={["click"]}
	  placement="bottomRight"
	  arrow
	  popupRender={() => dropdownContent}
	  open={open}
	  onOpenChange={(nextOpen) => {
		setOpen(nextOpen);
		if (nextOpen) loadNotifications();
	  }}
	  overlayClassName="notifications-dropdown"
	  autoAdjustOverflow
	>

      <Badge count={unread} size="small" showZero={false}>
        <BellOutlined
          style={{ fontSize: 20, cursor: "pointer" }}
        />
      </Badge>
    </Dropdown>
	
  );
};

export default Notifications;