DELIMITER $$
    create procedure p_GetNotificationModification()

    BEGIN

        select id, title,
                line1, line2, line3, line4,
                iOSCollapsed1, iOSCollapsed2,
                androidCollapsed1,
                clinton_avatar, trump_avatar,
                buzz_once,
                created_on
            from notification_modifications
            where active = true;

    END $$
DELIMITER ;