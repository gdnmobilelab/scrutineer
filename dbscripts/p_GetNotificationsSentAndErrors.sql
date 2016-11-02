DELIMITER $$
    create procedure p_GetNotificationsSentAndErrors(
        IN p_since TIMESTAMP
    )

    BEGIN

        select *
            from sent_notifications where created_on >= p_since order by created_on DESC;

        call p_GetNotificationErrors(p_since);

    END $$
DELIMITER ;