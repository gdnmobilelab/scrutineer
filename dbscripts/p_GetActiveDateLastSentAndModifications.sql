DELIMITER $$
    create procedure p_GetActiveDateLastSentAndModifications()

    BEGIN

        call p_GetActiveDate();
        call p_GetLastSentNotification();
        call p_GetNotificationModification();

    END $$
DELIMITER ;