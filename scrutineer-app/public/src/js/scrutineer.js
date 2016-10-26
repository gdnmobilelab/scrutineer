import React from 'react';
import ReactDOM from 'react-dom';
import update from 'immutability-helper';

const jsonFetch = require('../../../shared-utils/json-request');
const createNotification = require('../../../shared-utils/create-notification');
const classnames = require('classnames');
const deepcopy = require("deepcopy");
const Cookies = require('cookies-js');
const moment = require('moment-timezone');

const exampleNotificationData = {
    id: "6b632ded-c29e-4c3a-bd3d-1b8902ce3732",
    sentAt: "2016-10-21T18:37:15.000Z",
    CLINTON: {
        electoralVotes: 246,
        popularVotePercentage: 40.56
    },
    TRUMP: {
        electoralVotes: 292,
        popularVotePercentage: 40.82
    },
    percentageOfPrecinctsReporting: 99,
    statesCalled: ['08'],
    swingStatesCalled: ['OH', 'FL', 'CO']
};
const SUBMISSION_MESSAGES = {
    'success': 'Successfully submitted modification',
    'error': 'There was an error submitting the modification'
};
const REFRESH_TIMEOUT = 1000 * 10; //Minute refresh rate on new notifications

function createExampleNotificationWithModifications(modifications) {
    var exampleNotification = Object.assign({}, createNotification(exampleNotificationData.id, exampleNotificationData, modifications), {sentAt: '2016-10-24T14:35:22.000Z'});
    exampleNotification.message = '• 270 electoral votes to win\n' + exampleNotification.message;

    return exampleNotification;
}

class Scrutineer extends React.Component {
    constructor() {
        super();

        this.state = {
            notifications: [],
            notificationsLimit: 4,
            notificationForm: {
                title: null,
                line1: null,
                line2: null,
                line3: null,
                line4: null,
                line5: null,
                buzzOnce: false,
            },
            exampleNotification: {
                notification: createExampleNotificationWithModifications({}) //sentAt will be used later on
            },
            submitting: false,
            submitted: false,
            submittedSuccess: true,
            timeoutId: null
        }
    }

    refreshResultsOnInterval() {
        var timeoutId = setTimeout(() => {
            jsonFetch(`${CONFIG.API_URL}/api/notifications`)
                .then((resp) => {
                    this.setState({
                        notifications: resp.notifications
                    })
                });
            this.refreshResultsOnInterval();
        }, REFRESH_TIMEOUT);

        this.setState({
            timeoutId: timeoutId
        });
    }

    componentDidMount() {
        var submitted = Cookies.get('submitted');
        if (submitted) {
            Cookies.expire('submitted');
            this.setState({
                submitted: true,
                submittedSuccess: submitted === 'success'
            })
        }

        jsonFetch(`${CONFIG.API_URL}/api/notifications`)
            .then((resp) => {
                let notificationForm = Object.assign({}, this.state.notificationForm, resp.modifications);

                this.setState({
                    notifications: resp.notifications,
                    exampleNotification: {
                        notification: createExampleNotificationWithModifications(notificationForm)
                    },
                    notificationForm: Object.assign({}, notificationForm, { buzzOnce: false }) //buzOnce should always be false no matter what
                })
            });

        this.refreshResultsOnInterval();
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({
            submitting: true
        });

        var toSubmit = Object.assign({}, this.state.notificationForm);

        Object.keys(toSubmit).forEach((key) => {
            //Don't submit empty strings! It's invalid!
            if (typeof toSubmit[key] === 'string' && toSubmit[key].length < 1) {
                toSubmit[key] = null;
            }
        });

        let cookieOpts = { expires: 10 };
        jsonFetch(`${CONFIG.API_URL}/api/notifications/modifications`, {
            method: 'POST',
            body: JSON.stringify(toSubmit),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            console.log(res);
            Cookies.set('submitted', 'success', cookieOpts);
            location.reload();
        }).catch((err) => {
            console.log(err);
            Cookies.set('submitted', 'error', cookieOpts);
            location.reload();
        })
    }

    onFormChange(attr, value) {
        let notificationForm = Object.assign({}, this.state.notificationForm, {[attr]: value});

        this.setState({
            notificationForm: notificationForm,
            exampleNotification: {
                notification: createExampleNotificationWithModifications(notificationForm),
            }
        })
    }

    removeAdminNotifier() {
        this.setState({
            submitted: false,
            submittedSuccess: false
        })
    }

    render() {
        var notification = '';
        if (this.state.submitted) {
            notification = <AdminNotifier 
                                success={this.state.submittedSuccess} 
                                message={this.state.submittedSuccess ? SUBMISSION_MESSAGES['success'] : SUBMISSION_MESSAGES['error']} 
                                onNotifierEnd={this.removeAdminNotifier.bind(this)} 
                            />
        }

        return (
            <div id="scrutineer">
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12">
                            <h1>Scrutineer Notification Admin</h1>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <NotificationForm submitting={this.state.submitting}
                                          exampleNotification={this.state.exampleNotification.notification}
                                          form={this.state.notificationForm}
                                          onSubmit={this.onSubmit.bind(this)}
                                          onChange={this.onFormChange.bind(this)}
                                          className="col-xs-6" />
                        <NotificationsSent
                            notifications={this.state.notifications}
                            limit={this.state.notificationsLimit}
                            className="col-xs-6" />
                    </div>
                </div>
                {notification}
            </div>
        )
    }
}

class NotificationsSent extends React.Component {
    render() {
        var sentNotifications = this.props.notifications.slice(0, this.props.limit).map((notification) => {
            return (<Notification key={notification.id} notification={notification} />)
        });

        return (
            <div className={this.props.className}>
                <div className="well bs-component notifications-sent">
                    <h3>Sent Notifications</h3>
                    <div className="notifications-list">
                        {sentNotifications}
                    </div>
                </div>
            </div>
        )
    }
}

class Notification extends React.Component {
    render() {
        var classes = classnames(this.props.className, 'card');

        return (
            <div className={classes}>
                <strong>{this.props.notification.title}</strong>
                <p>{this.props.notification.message.split("\n").map((notification, index) => {
                    return (
                        <span key={`${this.props.notification.id}-${index}`}>{notification}<br /></span>
                    )
                })}</p>
                <p className="notification-sent-at">{moment.utc(this.props.notification.sentAt).format("dddd, h:mm:ss a")}</p>
            </div>
        )
    }
}

class NotificationForm extends React.Component {

    render() {
        var loading = this.props.submitting ? <i className="fa fa-spinner fa-spin submitting-spinner"></i> : '';
        var isDisabled = this.props.disabled || this.props.submitting;

        return (
            <div className={this.props.className}>
                <form onSubmit={this.props.onSubmit} className="clearfix">
                    <Input onChange={this.props.onChange} attr="title" label="Title" value={this.props.form['title']} />
                    <Input onChange={this.props.onChange} attr="line2" label="Line #2" value={this.props.form['line2']} />
                    <Input onChange={this.props.onChange} attr="line3" label="Line #3" value={this.props.form['line3']} />
                    <Input onChange={this.props.onChange} attr="line4" label="Line #4" value={this.props.form['line4']} />
                    <Input onChange={this.props.onChange} attr="line5" label="Line #5" value={this.props.form['line5']} />
                    <Checkbox onChange={this.props.onChange} className="buzz-checkbox" label="Buzz on the next notification" value={this.props.form['buzzOnce']} attr="buzzOnce" />
                    <button disabled={isDisabled} type="submit" className="btn btn-primary notification-form-submit">{loading}Save</button>
                </form>
                <div className="well bs-component example-notification">
                    <h3>Example</h3>
                    <div className="notifications-list">
                        <Notification notification={this.props.exampleNotification} />
                    </div>
                </div>
            </div>
        )
    }
}

class Input extends React.Component {
    onChange(e) {
        this.props.onChange(this.props.attr, e.target.value);
    }

    render() {
        return (
            <div className="form-group">
                <label>{this.props.label}</label>
                <input type="text" onChange={this.onChange.bind(this)} className="form-control" value={this.props.value || ''} />
            </div>
        )
    }
}

class Checkbox extends React.Component {
    onChange(e) {
        this.props.onChange(this.props.attr, e.target.checked);
    }

    render() {
        var checkboxClass = classnames('checkbox', 'buzz-checkbox');

        return (
            <div className={checkboxClass}>
                <label>
                    <input type="checkbox" onClick={this.onChange.bind(this)} /> {this.props.label}
                </label>
            </div>
        )
    }
}

class AdminNotifier extends React.Component {
    constructor() {
        super();

        this.timeout = null;
    }

    componentDidMount() {
        if (this.timeout ) {
            clearTimeout(this.timeout);
        }

        setTimeout(this.props.onNotifierEnd, 2000);
    }

    render() {
        var notificationColor = classnames('alert', {'alert-success': this.props.success}, {'alert-danger': !this.props.success});

        return (
            <div className={notificationColor} role="alert">{this.props.message}</div>
        )
    }
}

ReactDOM.render(<Scrutineer/>, document.getElementById('scrutineer-anchor'));