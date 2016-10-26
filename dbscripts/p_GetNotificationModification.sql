DELIMITER $$
    create procedure p_GetNotificationModification()

    BEGIN

        select id, title, line1, line2, line3, line4, line5, buzz_once, created_on
            from notification_modifications
            where active = true;

    END $$
DELIMITER ;