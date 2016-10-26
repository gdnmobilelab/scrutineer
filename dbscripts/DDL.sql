create database if not exists scrutineer;

use scrutineer;

create table dates (
    `date` VARCHAR(250) PRIMARY KEY,
    active BOOLEAN,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

create table notification_modifications (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500),
    line1 VARCHAR(500),
    line2 VARCHAR(500),
    line3 VARCHAR(500),
    line4 VARCHAR(500),
    line5 VARCHAR(500),
    buzz_once BOOLEAN DEFAULT false,
    active BOOLEAN NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


create table sent_notifications (
    id VARCHAR(36) PRIMARY KEY,
    clinton_electoral_vote BIGINT NOT NULL,
    trump_electoral_vote BIGINT NOT NULL,
    clinton_popular_vote_percentage DECIMAL(5, 2) NOT NULL,
    trump_popular_vote_percentage DECIMAL(5, 2) NOT NULL,
    percent_precincts_reporting_percentage DECIMAL(5, 2) NOT NULL,
    num_states_called BIGINT NOT NULL,
    sent_notification_json JSON NOT NULL,
    notification_modifications_id VARCHAR(36),
    active BOOLEAN NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY FK_notification_modifications_id (notification_modifications_id) REFERENCES notification_modifications(id)
);

create table notification_error_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message VARCHAR(1000),
    stack VARCHAR(5000),
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX date_manifest_is_active ON dates (active);
CREATE INDEX sent_notifications_is_active ON sent_notifications (active);
CREATE INDEX notification_modifications_is_active ON notification_modifications (active);
CREATE INDEX notification_modifications_buzz_once ON notification_modifications (buzz_once);
CREATE INDEX notification_error_log_by_date ON notification_error_log (created_on);