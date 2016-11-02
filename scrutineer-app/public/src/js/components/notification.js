import React from 'react';
const moment = require('moment');
import * as d3 from 'd3';

const classnames = require('classnames');
const CONSTANTS = require('../constants');
const CLINTON_DEFAULT_AVATAR = CONSTANTS.CLINTON_DEFAULT_IMAGE.image;
const TRUMP_DEFAULT_AVATAR = CONSTANTS.TRUMP_DEFAULT_IMAGE.image;
const DEFAULT_AVATAR = 'http://avatar-url';
const ELECTORAL_VOTES = 538;

class Notification extends React.Component {
    modifyChart(clintonElectoralVotes, trumpElectoralVotes) {
        this.d3SVG.selectAll('*').remove();

        var bar = d3.scaleLinear()
            .rangeRound([0, this.svg.clientWidth]) //Range is the width of our notification box
            .domain([0, ELECTORAL_VOTES]); //A total of 270 electoral votes

        var container = this.d3SVG.append("g");

        container.append("rect")
            .attr("height", 10)
            .attr("x", 0)
            .attr("y", 3)
            .attr("width", bar(ELECTORAL_VOTES))
            .style("fill", "#ccc");

        container.append("rect")
            .attr("height", 10)
            .attr("x", 0)
            .attr("y", 3)
            .attr("width", bar(clintonElectoralVotes))
            .style("fill", "#005689");

        container.append("rect")
            .attr("height", 10)
            .attr("x", bar(ELECTORAL_VOTES - trumpElectoralVotes))
            .attr("y", 3)
            .attr("width", bar(ELECTORAL_VOTES))
            .style("fill", "#d61d00");

        container.append("rect")
            .attr("height", 16)
            .attr("x", bar(270))
            .attr("width", 2)
            .style("fill", "#000")
    }

    componentWillReceiveProps(props) {
        this.modifyChart(props.notification.results.candidates[0].electoralVotes, props.notification.results.candidates[1].electoralVotes)
    }

    componentDidMount() {
       this.modifyChart(this.props.notification.results.candidates[0].electoralVotes, this.props.notification.results.candidates[1].electoralVotes)
    }

    render() {
        var classes = classnames(this.props.className, 'card');

        let clinton = this.props.notification.results.candidates[0],
            trump = this.props.notification.results.candidates[1],
            clintonAvatar = clinton.avatar === DEFAULT_AVATAR ? CLINTON_DEFAULT_AVATAR : clinton.avatar,
            trumpAvatar = trump.avatar === DEFAULT_AVATAR ? TRUMP_DEFAULT_AVATAR : trump.avatar;

        return (
            <div className={classes}>
                <strong>{this.props.notification.title}</strong>
                <div className="balance-of-power">
                    <div className="avatars">
                        <div className="clinton-avatar avatar">
                            <img src={clintonAvatar} />
                        </div>
                        <div className="trump-avatar avatar">
                            <img src={trumpAvatar} />
                        </div>
                    </div>
                    <div className="chart">
                        <svg height="16" width="100%" ref={(svg) =>  {
                            this.svg = svg;
                            this.d3SVG = d3.select(this.svg);
                        }} />
                    </div>
                </div>
                <p>{this.props.notification.expandedMessage.split("\n").map((line, index) => {
                    return (
                        <span key={`${this.props.notification.id}-${index}`}>{line}<br /></span>
                    )
                })}</p>
                <p className="notification-sent-at">{moment.utc(this.props.notification.sentAt).utcOffset(-4).format("dddd, h:mm:ss a")}</p>
            </div>
        )
    }
}

class AndroidCollapsedNotification extends React.Component {
    render() {
        var classes = classnames(this.props.className, 'card');

        return (
            <div className={classes}>
                <strong>{this.props.notification.title}</strong>
                <p>{this.props.notification.shortMessage}</p>
                <p className="notification-sent-at">{moment.utc(this.props.notification.sentAt).utcOffset(-4).format("dddd, h:mm:ss a")}</p>
            </div>
        )
    }
}

class IOSCollapsedNotification extends React.Component {
    render() {
        var classes = classnames(this.props.className, 'card');

        return (
            <div className={classes}>
                <strong>{this.props.notification.title}</strong>
                <p>{this.props.notification.message.split("\n").map((line, index) => {
                    return (
                        <span key={`${this.props.notification.id}-${index}`}>{line}<br /></span>
                    )
                })}</p>
                <p className="notification-sent-at">{moment.utc(this.props.notification.sentAt).utcOffset(-4).format("dddd, h:mm:ss a")}</p>
            </div>
        )
    }
}

export { Notification, AndroidCollapsedNotification, IOSCollapsedNotification }