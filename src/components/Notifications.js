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
		setOpen(false); // 👈 CLOSE DROPDOWN
	  } catch (err) {
		console.error("Notification update error", err);
	  }
	};

  // build notification item
  const buildNotification = (notification) => {
    let notificationText = "";

    if (notification.notificationTypeId === 1) { // You received an invitation to join etablissementName
      notificationText =
        getAContent("cmp_vetonest.com_Yr82Ld55Qx") +
        " " +
        notification.etablissementName;
    }

    if (notification.notificationTypeId === 2) { // The invitation sent to receiverName was accepted.
      notificationText = 
		getAContent( "cmp_vetonest.com_InvSent_Txt" ) + " " + 
		notification.receiverName + " " + 
		getAContent( "cmp_vetonest.com_InvAcc_Txt" ) 
    }

    if (notification.notificationTypeId === 3) { // The invitation sent to receiverName was declined
      notificationText = 
		getAContent( "cmp_vetonest.com_InvSent_Txt" ) + " " + 
		notification.receiverName + " " + 
		getAContent( "cmp_vetonest.com_InvDecl_Txt" ) 
    }

    return {
      id: generateRandomDigits(3),
      text: (
        <Link
          to={{
            pathname: "/etablissement",
            search:
              "?userId=" +
              userId +
              "&etablissementId=" +
              notification.etablissementId,
          }}
          onClick={() => handleNotificationClick(notification.id)}
          style={{
            fontWeight: notification.viewed ? "normal" : "bold",
          }}
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


	useEffect(() => {
	  const loadUnreadCount = async () => {
		const userNotifications = await getUserNotifications(userId);
		if (!userNotifications) return;
		const unreadNotifications = userNotifications.filter(
		  (n) => !n.viewed
		);

		setUnread(unreadNotifications.length);
	  };

	  loadUnreadCount();
	}, [unread]);


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