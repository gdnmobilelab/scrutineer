DELIMITER $$
    create procedure p_CreateDate(
        IN p_date VARCHAR(250)
    )

    BEGIN

        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
              ROLLBACK;
              RESIGNAL;
        END;

        START TRANSACTION;

        -- Mark the last date manifest as no longer active
        update dates set
            active = false
            where active = true;

        insert into dates (`date`, active)
            values (p_date, true);

        COMMIT;

    END $$
DELIMITER ;