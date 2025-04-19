from flask import Blueprint, request, jsonify 
import logging 

notifications = Blueprint("notifications", __name__)
logger = logging.getLogger("NotificationsRouter")

# Read Single Notification
@notifications.route('/notifications/<string:notification_id>', methods=['GET'])
def get_notification(notification_id):
    print(notification_id)
    return

# Update Notification
@notifications.route('/notifications/<string:notification_id>', methods=['PUT'])
def update_notification(notification_id):
    print(notification_id)
    return