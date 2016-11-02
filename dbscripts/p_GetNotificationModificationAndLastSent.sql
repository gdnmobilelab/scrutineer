DELIMITER $$
    create procedure p_GetNotificationModificationAndLastSent()

    BEGIN

        call p_GetNotificationModification();
        call p_GetLastSentNotification();

    END $$
DELIMITER ;