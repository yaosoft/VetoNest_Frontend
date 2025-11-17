import React, { useState, useEffect, useContext } from "react";
import { Badge, Dropdown, List, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
const Notifications = ( params ) => {

  	// context
	const { 
		profileId,
		userId
	} = useContext( AuthContext );

	const { 
		getUserNotifications,
		generateRandomDigits,
		notificationViewed,
	} = useContext( SiteContext );

	const [ unread, setUnread ] = useState(0);
	const [ notifications, setNotifications ] = useState([]);
	const [ notificationData, setNotificationData ] = useState([]);

	const dropdownContent = (
		<div style={{ width: 360, backgroundColor: '#c1ff72' }}>
		<div style={{ padding: 2, fontSize: '12px' }}><b>Notification_title</b></div>
		<List
			dataSource={notifications}
			locale={{ emptyText: "No notifications" }}
			renderItem={(item) => <List.Item>&nbsp;{item.text}</List.Item>}
			style={{ maxHeight: 260, overflowY: "auto" }}
		/>
		<div style={{ padding: 8, textAlign: "center" }}>
			<Button type="link" size="small" onClick={() => setUnread(0)}>
				Mark all as read
			</Button>
			</div>
		</div>
	);

	//
	const handleNotificationClick = async(notificationId) => {
		const notificationData = {
			notificationId: notificationId
		}
		const rep = await notificationViewed ( notificationData );
		if( !rep )
			console.log( 'Notification update error' )
	}

	useEffect(() => {
		// get user's notification
		const a = async() => {
			const userNotifications = await getUserNotifications( userId );

			var notificationText 	= '';
			var notificationUrl 	= '';
			var notifications 		= [];
			var countUnread 		= 0;
			for( const notification of userNotifications ){
				// text
				
				if( notification.notificationTypeId == 1 ){	// You received an invitation to join a clinic
					notificationText = 'notificationText_You_received_an_invitation_to_join' + ' ' + notification.etablissementName;
					notificationUrl  = <Link
						to={{
							pathname: '/etablissement',
							search: '?userId=' + userId + '&etablissementId=' + notification.etablissementId,
						}}
						onClick={handleNotificationClick(notification.id)}
						style={{ fontWeight: notification.viewed ? 'normal' : 'bold' }}
					>
						{ notificationText }
					</Link> 
				}
				if( notification.notificationTypeId == 2 ){	// You received an invitation to join a clinic
					notificationText = 'notificationText_Your_invitation_was_accepted' + ' ' + notification.receiverName;
					notificationUrl  = <Link
						to={{
							pathname: '/etablissement',
							search: '?userId=' + userId + '&etablissementId=' + notification.etablissementId,
						}}
						onClick={handleNotificationClick(notification.id)}
						style={{ fontWeight: notification.viewed ? 'normal' : 'bold' }}
					>
						{ notificationText }
					</Link> 
				}
				if( notification.notificationTypeId == 3 ){	// You received an invitation to join a clinic
					notificationText = 'notificationText_Your_invitation_was_declined' + ' ' + notification.receiverName;
					notificationUrl  = <Link
						to={{
							pathname: '/etablissement',
							search: '?userId=' + userId + '&etablissementId=' + notification.etablissementId,
						}}
						onClick={handleNotificationClick(notification.id)}
						style={{ fontWeight: notification.viewed ? 'normal' : 'bold' }}
					>
						{ notificationText }
					</Link> 
				}
				// unread
				if( !notification.viewed )
					countUnread++;
				
				// notification
				const obj = { id: generateRandomDigits(3), text: notificationUrl };
				notifications.push( obj );
			}
console.log( '>>>>>>>>>>>>> notifications', notifications );
			setNotifications( notifications );
			setUnread( countUnread );

	// const notifications = [
		// { id: 1, text: "Welcome to the app!" },
		// { id: 2, text: "Your profile was updated." },
	// ];


		}
		a();

	}, [ userId ]); // Dependency array ensures effect runs when isModalOpen changes

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
      arrow
    >
      <Badge count={unread} size="small">
        <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
      </Badge>
    </Dropdown>
  );
}

export default Notifications;