DELIMITER $$
    create procedure p_CreateNotificationModification(
        IN p_id VARCHAR(36),
        IN p_title VARCHAR(500),
        IN p_line1 VARCHAR(500),
        IN p_line2 VARCHAR(500),
        IN p_line3 VARCHAR(500),
        IN p_line4 VARCHAR(500),
        IN p_line5 VARCHAR(500),
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
            or char_length(p_line5) < 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Character length of title and lines must be greater than 0';
        END IF;

        START TRANSACTION;

            update notification_modifications set
                active = false,
                buzz_once = false -- just in case
                where active = true;

            insert into notification_modifications (id, title, line1,
                    line2, line3, line4, line5, buzz_once, active)
                values (p_id, p_title, p_line1,
                    p_line2, p_line3, p_line4, p_line5, p_buzz_once, true);

        COMMIT;

    END $$
DELIMITER ;