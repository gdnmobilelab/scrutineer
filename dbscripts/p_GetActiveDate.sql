DELIMITER $$
    create procedure p_GetActiveDate()

    BEGIN

        select `date`, active, created_on, updated_on
            from dates where active = true;

    END $$
DELIMITER ;