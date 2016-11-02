import React from 'react';
import ReactDOM from 'react-dom';
import { Notification, AndroidCollapsedNotification, IOSCollapsedNotification } from './components/notification';
import ScrutineerService from './services/scrutineer-service';

const jsonFetch = require('../../../shared-utils/json-request');
const createNotification = require('../../../shared-utils/create-notification');
const classnames = require('classnames');
const deepcopy = require("deepcopy");
const Cookies = require('cookies-js');
const moment = require('moment-timezone');
const CONSTANTS = require('./constants');

const CLINTON_DEFAULT_IMAGE = CONSTANTS.CLINTON_DEFAULT_IMAGE;
const TRUMP_DEFAULT_IMAGE = CONSTANTS.TRUMP_DEFAULT_IMAGE;
const CANDIDATE_IMAGES = {
    CLINTON: [
        CLINTON_DEFAULT_IMAGE,
        {
            key: 'Clinton Cheer',
            image: 'https://www.gdnmobilelab.com/candidates/clinton-cheer-resized-1.png'
        }
    ],
    TRUMP: [
        TRUMP_DEFAULT_IMAGE,
        {
            key: 'Trump Cheer',
            image: 'https://www.gdnmobilelab.com/candidates/trump-cheer-resized-1.png'
        }
    ]
};

const exampleNotificationData = {
    id: "6b632ded-c29e-4c3a-bd3d-1b8902ce3732",
    sentAt: "2016-10-21T18:37:15.000Z",
    CLINTON: {
        electoralVotes: 80,
        popularVotePercentage: 40.56
    },
    TRUMP: {
        electoralVotes: 64,
        popularVotePercentage: 40.82
    },
    percentageOfPrecinctsReporting: 30,
    statesCalled: ['08'],
    swingStatesCalled: ['OH', 'FL', 'CO']
};
const SUBMISSION_MESSAGES = {
    'success': 'Successfully submitted modification',
    'error': 'There was an error submitting the modification'
};
const REFRESH_TIMEOUT = 1000 * 10; //Minute refresh rate on new notifications

var createExampleNotificationWithModifications = function (modifications) {
    return Object.assign({}, createNotification(exampleNotificationData.id, exampleNotificationData, modifications || {}), {sentAt: '2016-10-24T14:35:22.000Z'});
};

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
                iOSCollapsed1: null,
                iOSCollapsed2: null,
                androidCollapsed: null,
                clintonAvatar: null,
                trumpAvatar: null,
                buzzOnce: false,
            },
            exampleNotification: createExampleNotificationWithModifications(),
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

                // Switch up the example modification creator with real notifcation if it exists
                if (resp.notification) {
                    createExampleNotificationWithModifications = function (modifications) {
                        return Object.assign({}, createNotification(resp.notification.id, JSON.parse(resp.notification.notificationDataJson), modifications || {}), {sentAt: resp.notification.sentAt});
                    };
                }

                this.setState({
                    exampleNotification: createExampleNotificationWithModifications(resp.modifications),
                    notifications: resp.notifications,
                    notificationForm: Object.assign({}, notificationForm, { buzzOnce: false }) //buzOnce should always be false no matter what
                })
            });

        this.refreshResultsOnInterval();
    }

    onSubmit(e, sendNotification) {
        e.preventDefault();

        this.setState({
            submitting: true
        });

        var toSubmit = Object.assign({}, this.state.notificationForm);

        let cookieOpts = { expires: 10 };
        ScrutineerService.createModification(toSubmit, sendNotification)
            .then((res) => {
                console.log(res);
                Cookies.set('submitted', 'success', cookieOpts);
                location.reload();
            }).catch((err) => {
                console.log(err);
                this.setState({
                    submitted: true,
                    submitting: false,
                    submittedSuccess: false
                });
                // Cookies.set('submitted', 'error', cookieOpts);
                // location.reload();
            })
    }

    onFormChange(attr, value) {
        let notificationForm = Object.assign({}, this.state.notificationForm, {[attr]: value});

        this.setState({
            notificationForm: notificationForm,
            exampleNotification: createExampleNotificationWithModifications(notificationForm),
        })
    }

    onCandidateImageChange(attr, candidateImage) {
        if (candidateImage.image === CLINTON_DEFAULT_IMAGE.image
            || candidateImage.image === TRUMP_DEFAULT_IMAGE.image) {
            this.onFormChange(attr, null);
        } else {
            this.onFormChange(attr, candidateImage.image);
        }
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
                                          exampleNotification={this.state.exampleNotification}
                                          form={this.state.notificationForm}
                                          onSubmit={this.onSubmit.bind(this)}
                                          onChange={this.onFormChange.bind(this)}
                                          onCandidateImageChange={this.onCandidateImageChange.bind(this)}
                                          className="col-xs-12" />
                    </div>
                </div>
                {notification}
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
                <div className="col-xs-6">
                    <form className="clearfix">
                        <legend>General</legend>
                        <Input onChange={this.props.onChange} attr="title" label="Title" value={this.props.form['title']} />
                        <Input onChange={this.props.onChange} attr="line1" label="Line #1" value={this.props.form['line1']} />
                        <Input onChange={this.props.onChange} attr="line2" label="Line #2" value={this.props.form['line2']} />
                        <Input onChange={this.props.onChange} attr="line3" label="Line #3" value={this.props.form['line3']} />
                        <Input onChange={this.props.onChange} attr="line4" label="Line #4" value={this.props.form['line4']} />
                        <Checkbox onChange={this.props.onChange} className="buzz-checkbox" label="Buzz on the next notification" value={this.props.form['buzzOnce']} attr="buzzOnce" />

                        <legend>Android</legend>
                        <Input onChange={this.props.onChange} attr="androidCollapsed1" label="Collapsed text" value={this.props.form['androidCollapsed1']} />
                        <CandidateImageSelector
                            attr="clintonAvatar"
                            onChange={this.props.onCandidateImageChange}
                            label="Clinton Icon"
                            selected={this.props.form['clintonAvatar'] || CLINTON_DEFAULT_IMAGE.image}
                            images={CANDIDATE_IMAGES.CLINTON}
                        />
                        <CandidateImageSelector
                            attr="trumpAvatar"
                            onChange={this.props.onCandidateImageChange}
                            label="Trump Icon"
                            images={CANDIDATE_IMAGES.TRUMP}
                            selected={this.props.form['trumpAvatar'] || TRUMP_DEFAULT_IMAGE.image}
                        />

                        <legend>iOS</legend>
                        <Input onChange={this.props.onChange} attr="iOSCollapsed1" label="Collapsed text - Line #1" value={this.props.form['iOSCollapsed1']} />
                        <Input onChange={this.props.onChange} attr="iOSCollapsed2" label="Collapsed text - Line #2" value={this.props.form['iOSCollapsed2']} />

                        <button onClick={(e) => this.props.onSubmit.call(this, e, false)} disabled={isDisabled} type="button" className="btn btn-primary notification-form-submit">{loading}Save Modification</button>
                        <button onClick={(e) => this.props.onSubmit.call(this, e, true)} style={{'marginLeft': '5px'}} disabled={isDisabled} type="button" className="btn btn-danger notification-form-submit">{loading}Save Modification & Resend</button>
                    </form>
                </div>
                <div className="col-xs-6">
                    <div className="well bs-component example-notification">
                        <div className="notifications-list">
                            <h3>Android</h3>
                                <AndroidCollapsedNotification notification={this.props.exampleNotification} />
                                <Notification notification={this.props.exampleNotification} />
                            <h3>iOS</h3>
                            <IOSCollapsedNotification notification={this.props.exampleNotification} />
                            <Notification notification={this.props.exampleNotification} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class CandidateImageSelector extends React.Component {
    render() {
        var candidateImages = this.props.images.map((candidateImage) => {
            var candidateImageClass = classnames('candidate-image', {'selected': candidateImage.image === this.props.selected});

            return (
                <div key={candidateImage.key} className={candidateImageClass} onClick={this.props.onChange.bind(this, this.props.attr, candidateImage)}>
                    <img src={candidateImage.image} />
                    <div className="image-desc">{candidateImage.key}</div>
                </div>
            )
        });

        return (
            <div className="form-group">
                <label>{this.props.label}</label>
                <div>
                    {candidateImages}
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