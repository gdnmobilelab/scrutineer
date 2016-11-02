DELIMITER $$
    create procedure p_CreateNotificationModification(
        IN p_id VARCHAR(36),
        IN p_title VARCHAR(500),
        IN p_line1 VARCHAR(500),
        IN p_line2 VARCHAR(500),
        IN p_line3 VARCHAR(500),
        IN p_line4 VARCHAR(500),
        IN p_iOSCollapsed1 VARCHAR(500),
        IN p_iOSCollapsed2 VARCHAR(500),
        IN p_androidCollapsed1 VARCHAR(500),
        IN p_clinton_avatar VARCHAR(2500),
        IN p_trump_avatar VARCHAR(2500),
        IN p_buzz_once BOOLEAN
    )

    BEGIN

        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
              ROLLBACK;
              RESIGNAL;
        END;

        IF char_length(p_title) < 1
            or char_length(p_line1) < 1
            or char_length(p_line2) < 1
            or char_length(p_line3) < 1
            or char_length(p_line4) < 1
            or char_length(p_iOSCollapsed1) < 1
            or char_length(p_iOSCollapsed2) < 1
            or char_length(p_androidCollapsed1) < 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Character length of title and lines must be greater than 0';
        END IF;

        START TRANSACTION;

            update notification_modifications set
                active = false,
                buzz_once = false -- just in case
                where active = true;

            insert into notification_modifications (
                            id, title,
                            line1, line2, line3, line4,
                            iOSCollapsed1, iOSCollapsed2,
                            androidCollapsed1,
                            clinton_avatar, trump_avatar,
                            buzz_once, active)
                values (p_id, p_title,
                        p_line1, p_line2, p_line3, p_line4,
                        p_iOSCollapsed1, p_iOSCollapsed2,
                        p_androidCollapsed1,
                        p_clinton_avatar, p_trump_avatar,
                        p_buzz_once, true);

        COMMIT;

    END $$
DELIMITER ;