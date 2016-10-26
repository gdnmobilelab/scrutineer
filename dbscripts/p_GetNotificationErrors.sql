DELIMITER $$
    create procedure p_GetNotificationErrors(
        IN p_since TIMESTAMP
    )

    BEGIN

        select id, message, stack, created_on
            from notification_error_log
            where created_on >= p_since order by created_on DESC;

    END $$
DELIMITER ;