import React, { useState, useContext, useEffect } from "react";
import { Badge, Dropdown, List, Button, Typography } from "antd";
import { BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";
import { Link } from "react-router-dom";

const { Text } = Typography;

const Notifications = () => {
  // contexts
  const { userId, profileId, profileTypeId } = useContext(AuthContext);

  const {
    getUserNotifications,
    generateRandomDigits,
    notificationViewed,
    getAContent,
    base_url
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
      // Update local state to mark as read
      setNotifications(prevNotifications => 
        prevNotifications.map(item => {
          if (item.id === notificationId) {
            return { ...item, viewed: true };
          }
          return item;
        })
      );
      setUnread((prev) => Math.max(prev - 1, 0));
      setOpen(false);
    } catch (err) {
      console.error("Notification update error", err);
    }
  };

  // mark all as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.id !== 'unread-title' && n.id !== 'read-title' && !n.viewed);
    for (const notification of unreadNotifications) {
      if (notification.originalId) {
        await notificationViewed({ notificationId: notification.originalId });
      }
    }
    setUnread(0);
    // Refresh notifications
    await loadNotifications();
  };

  // format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // build notification item
	const buildNotification = (notification) => {
	  let notificationText = "";
	  let linkTo = "/";
	  let icon = "🔔";
	  let timeAgo = formatDate(notification.creation);

	  // Type 1: Invitation to clinic
	  if (notification.notificationTypeId === 1) {
		const text1 = getAContent("cmp_vetonest.com_Yr82Ld55Qx") || "You received an invitation to join";
		notificationText = `${text1} ${notification.etablissementName || ''}`;
		linkTo = `/etablissement?userId=${userId}&etablissementId=${notification.etablissementId}`;
		icon = "🏥";
	  }

	  // Type 2: Invitation accepted
	  else if (notification.notificationTypeId === 2) {
		const text1 = getAContent("cmp_vetonest.com_InvSent_Txt") || "Invitation sent to";
		const text2 = getAContent("cmp_vetonest.com_InvAcc_Txt") || "accepted your invitation";
		notificationText = `${text1} ${notification.receiverName || ''} ${text2}`;
		linkTo = `/etablissement?userId=${userId}&etablissementId=${notification.etablissementId}`;
		icon = "✅";
	  }

	  // Type 3: Invitation declined
	  else if (notification.notificationTypeId === 3) {
		const text1 = getAContent("cmp_vetonest.com_InvSent_Txt") || "Invitation sent to";
		const text2 = getAContent("cmp_vetonest.com_InvDecl_Txt") || "declined your invitation";
		notificationText = `${text1} ${notification.receiverName || ''} ${text2}`;
		linkTo = `/etablissement?userId=${userId}&etablissementId=${notification.etablissementId}`;
		icon = "❌";
	  }

	  // Type 4: Appointment request received
	  else if (notification.notificationTypeId === 4) {
		notificationText = getAContent("cmp_vetonest.com_Notif_AppointReceived_Txt") || "📅 You received an appointment request";
		linkTo = "/consultation/list";
		icon = "📅";
	  }

	  // Type 5: Appointment declined
	  else if (notification.notificationTypeId === 5) {
		notificationText = getAContent("cmp_vetonest.com_Notif_AppointDeclined_Txt") || "❌ Your appointment request was declined";
		linkTo = "/consultation/list";
		icon = "❌";
	  }

	  // Type 6: Appointment accepted
	  else if (notification.notificationTypeId === 6) {
		notificationText = getAContent("cmp_vetonest.com_Notif_AppointAccepted_Txt") || "✅ Your appointment request was accepted";
		linkTo = "/consultation/list";
		icon = "✅";
	  }

	  // Type 7: New rating received (vet receives this)
	  else if (notification.notificationTypeId === 7) {
		const petName = notification.petName || '';
		const rating = notification.rating || '';
		const stars = '⭐'.repeat(Math.min(5, Math.floor(rating)));
		const baseText = getAContent("cmp_vetonest.com_Notif_NewRating_Txt") || "New rating received";
		notificationText = baseText;
		if (petName) notificationText += ` for ${petName}`;
		if (stars) notificationText += ` (${stars})`;
		linkTo = `/vet-profile?vetId=${notification.vetId || profileId}#client-reviews`;
		icon = "⭐";
	  }

	  // Type 8: New comment received (vet receives this)
	  else if (notification.notificationTypeId === 8) {
		const petName = notification.petName || '';
		const baseText = getAContent("cmp_vetonest.com_Notif_NewComment_Txt") || "New comment received";
		notificationText = baseText;
		if (petName) notificationText += ` for ${petName}`;
		linkTo = `/vet-profile?vetId=${notification.vetId || profileId}#client-reviews`;
		icon = "💬";
	  }

	  // Type 9: New reply to comment (comment owner receives this)
	  else if (notification.notificationTypeId === 9) {
		notificationText = getAContent("cmp_vetonest.com_Notif_NewReply_Txt") || "Someone replied to your comment";
		linkTo = `/vet-profile?vetId=${notification.vetId || profileId}#client-reviews`;
		icon = "↩️";
	  }

	  // Type 10: Comment updated (vet receives this)
	  else if (notification.notificationTypeId === 10) {
		const petName = notification.petName || '';
		const baseText = getAContent("cmp_vetonest.com_Notif_CommentUpdated_Txt") || "A comment has been updated";
		notificationText = baseText;
		if (petName) notificationText += ` for ${petName}`;
		linkTo = `/vet-profile?vetId=${notification.vetId || profileId}#client-reviews`;
		icon = "✏️";
	  }

	  // Fallback for unknown notification types
	  else {
		notificationText = notification.typeName || "New notification";
		linkTo = "/";
		icon = "🔔";
	  }

	  return {
		id: notification.id || generateRandomDigits(3),
		originalId: notification.id,
		text: notificationText,
		linkTo: linkTo,
		icon: icon,
		viewed: notification.viewed,
		timeAgo: timeAgo
	  };
	};

  // load notifications when dropdown opens
	const loadNotifications = async () => {
	  const title = await getAContent("cmp_vetonest.com_Tp92Ka61Wm");
	  setNotificationTitle(title && title !== '***' ? title : "Notifications");

	  const userNotifications = await getUserNotifications(userId);
	  console.log("userNotifications:", userNotifications);

	  if (!userNotifications || userNotifications.length === 0) {
		setNotifications([]);
		setUnread(0);
		return;
	  }

	  const unreadNotifications = userNotifications.filter((n) => !n.viewed);
	  const readNotifications = userNotifications.filter((n) => n.viewed);

	  setUnread(unreadNotifications.length);

	  const finalNotifications = [];

	  if (unreadNotifications.length > 0) {
		const unreadTitle = await getAContent('cmp_vetonest.com_Un84Ks39Wp');
		finalNotifications.push({
		  id: "unread-title",
		  text: null,
		  isTitle: true,
		  title: unreadTitle && unreadTitle !== '***' ? unreadTitle : "Unread"
		});

		unreadNotifications.forEach((n) => {
		  finalNotifications.push(buildNotification(n));
		});
	  }

	  if (readNotifications.length > 0) {
		const readTitle = await getAContent('cmp_vetonest.com_Ea19Qw72Lp');
		finalNotifications.push({
		  id: "read-title",
		  text: null,
		  isTitle: true,
		  title: readTitle && readTitle !== '***' ? readTitle : "Read"
		});

		readNotifications.forEach((n) => {
		  finalNotifications.push(buildNotification(n));
		});
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
    <div className="notifications-popup" style={{ width: 350 }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <b>{notificationTitle}</b>
        {unread > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead} style={{ padding: 0 }}>
            <CheckCircleOutlined /> {getAContent("cmp_vetonest.com_Ma63Ps40Rw") || "Mark all as read"}
          </Button>
        )}
      </div>

      <List
        dataSource={notifications}
        locale={{
          emptyText: getAContent("cmp_vetonest.com_Nt71Qm82La") || "No notifications",
        }}
        renderItem={(item) => {
          if (item.isTitle) {
            return (
              <List.Item style={{ padding: "8px 12px", backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                <strong>{item.title}</strong>
              </List.Item>
            );
          }
          return (
            <List.Item style={{ padding: 0 }}>
              <Link
                to={item.linkTo}
                onClick={() => handleNotificationClick(item.originalId)}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  width: "100%",
                  fontWeight: item.viewed ? "normal" : "bold",
                  backgroundColor: item.viewed ? "transparent" : "#f0f7ff",
                  textDecoration: "none",
                  color: "#333"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div>{item.text}</div>
                    <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>{item.timeAgo}</div>
                  </div>
                </div>
              </Link>
            </List.Item>
          );
        }}
        style={{ maxHeight: 400, overflowY: "auto" }}
      />
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
        <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
      </Badge>
    </Dropdown>
  );
};

export default Notifications;