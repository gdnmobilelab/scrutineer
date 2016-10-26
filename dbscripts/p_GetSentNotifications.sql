DELIMITER $$
    create procedure p_GetSentNotifications()

    BEGIN

        select id, clinton_electoral_vote, trump_electoral_vote,
                clinton_popular_vote_percentage, trump_popular_vote_percentage, percent_precincts_reporting_percentage,
                num_states_called, sent_notification_json, notification_modifications_id, active, created_on
            from sent_notifications order by created_on DESC;

    END $$
DELIMITER ;