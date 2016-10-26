DELIMITER $$
    create procedure p_CreateNotificationError(
        IN p_message VARCHAR(1000),
        IN p_stack VARCHAR(5000)
    )

    BEGIN

        insert into notification_error_log(message, stack)
            values (p_message, p_stack);

    END $$
DELIMITER ;