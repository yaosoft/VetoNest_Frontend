import React, { useState, useContext } from "react";
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

  // mark notification as viewed
  const handleNotificationClick = async (notificationId) => {
    try {
      await notificationViewed({ notificationId });
    } catch (err) {
      console.error("Notification update error", err);
    }
  };

  // build notification item
  const buildNotification = (notification) => {
    let notificationText = "";

    if (notification.notificationTypeId === 1) {
      notificationText =
        getAContent("cmp_vetonest.com_Yr82Ld55Qx") +
        " " +
        notification.etablissementName;
    }

    if (notification.notificationTypeId === 2) {
      notificationText =
        "notificationText_Your_invitation_was_accepted " +
        notification.receiverName;
    }

    if (notification.notificationTypeId === 3) {
      notificationText =
        getAContent("cmp_vetonest.com_Dc57Zm91Ha") +
        " " +
        notification.receiverName;
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

  // dropdown content
  const dropdownContent = (
    <div
      style={{
        width: 400,
        backgroundColor: "#ffde59",
        padding: 10,
      }}
    >
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
	  onOpenChange={(open) => {
		if (open) loadNotifications();
	  }}
	  overlayClassName="notifications-dropdown"
	>
      <Badge count={unread} size="small">
        <BellOutlined
          style={{ fontSize: 20, cursor: "pointer" }}
        />
      </Badge>
    </Dropdown>
  );
};

export default Notifications;
