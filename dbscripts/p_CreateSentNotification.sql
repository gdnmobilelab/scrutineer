DELIMITER $$
    create procedure p_CreateSentNotification(
        IN p_id VARCHAR(36),
        IN p_clinton_electoral_vote BIGINT,
        IN p_trump_electoral_vote BIGINT,
        IN p_clinton_popular_vote_percentage DECIMAL(5, 2),
        IN p_trump_popular_vote_percentage DECIMAL(5, 2),
        IN p_percent_precincts_reporting_percentage DECIMAL(5, 2),
        IN p_num_states_called BIGINT,
        IN p_sent_notification_json JSON,
        IN p_notification_modifications_id VARCHAR(36)
    )

    BEGIN
        declare should_buzz BOOLEAN;

        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
              ROLLBACK;
              RESIGNAL;
        END;

        START TRANSACTION;

            update sent_notifications set
                active = false
                where active = true;

            insert into sent_notifications (id, clinton_electoral_vote, trump_electoral_vote,
                    clinton_popular_vote_percentage, trump_popular_vote_percentage, percent_precincts_reporting_percentage,
                    num_states_called, sent_notification_json, notification_modifications_id, active)
                values (p_id, p_clinton_electoral_vote, p_trump_electoral_vote,
                    p_clinton_popular_vote_percentage, p_trump_popular_vote_percentage, p_percent_precincts_reporting_percentage,
                    p_num_states_called, P_sent_notification_json, p_notification_modifications_id, true);

            select buzz_once from notification_modifications nm where nm.active = true into should_buzz;

            update notification_modifications
                set buzz_once = false
                where active = true;

            select should_buzz;

        COMMIT;

    END $$
DELIMITER ;