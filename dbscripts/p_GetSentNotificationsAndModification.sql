DELIMITER $$
    create procedure p_GetSentNotificationsAndModification()

    BEGIN

        call p_GetSentNotifications();
        call p_GetNotificationModification();

    END $$
DELIMITER ;