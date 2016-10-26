import React from 'react';
import ReactDOM from 'react-dom';
import update from 'immutability-helper';
import * as d3 from "d3";

const classnames = require('classnames');
const jsonFetch = require('../../../shared-utils/json-request');
const moment = require('moment');

const DASHBOARD_REFRESH_RATE = 1000 * 10;

class D3LineChart extends React.Component {
    constructor() {
        super();

        this.margin = {top: 20, right: 20, bottom: 30, left: 50}
    }

    updateGraph(lineData) {
        this.d3SVG.selectAll('*').remove();
        this.width = +this.d3SVG.attr("width") - this.margin.left - this.margin.right;
        this.height = +this.d3SVG.attr("height") - this.margin.top - this.margin.bottom;
        console.log(d3.extent(lineData.data, (d) => d.date));
        this.x = d3.scaleTime().rangeRound([0, this.width]).domain(d3.extent(lineData.data, (d) => d.date));
        this.y = d3.scaleLinear().rangeRound([this.height, 0]).domain(this.props.lineData.domainY);
        this.yAxis = d3.axisLeft().scale(this.y).ticks(8);
        this.xAxis = d3.axisBottom().scale(this.x).ticks(5);
        this.line = d3.line().x((d) => this.x(d.date))
            .y((d) => this.y(d.count));
        this.g = this.d3SVG.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);

        this.g.append("g")
            .attr("class", "axis axis--y")
            .call(this.yAxis)
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .style("text-anchor", "end")
            .text(this.props.lineData.yLabel);

        this.g.selectAll(`path.${lineData.color}`).remove();
        this.g.selectAll(`circle.${lineData.color}`).remove();

        this.g.append("path")
            .datum(lineData.data)
            .attr("class", lineData.color)
            .attr("d", this.line)

        this.g.selectAll("circle")
            .data(lineData.data)
            .enter()
            .insert("circle")
            .attr("cx", (d) => this.x(d.date))
            .attr("cy", (d) => this.y(d.count))
            .attr("r", 2)
            .attr("class", lineData.color)
            .style("fill", lineData.color);
    }

    componentWillReceiveProps(props) {
        this.updateGraph(props.lineData);
    }

    componentDidMount() {
        this.updateGraph(this.props.lineData);
    }

    render() {
        return (
            <div className="chart">
                <h4>{this.props.lineData.name}</h4>
                <svg width="490" height="300" ref={(svg) =>  {
                    this.svg = svg
                    this.d3SVG = d3.select(this.svg)
                }}></svg>
            </div>
        )
    }
}

function groupCreatedOn(dataWithCreatedOnAttribute) {
    return dataWithCreatedOnAttribute.reduce((coll, data) => {
        var key = moment(data.createdOn).format('YYYYMMDDHHmm');

        if (key in coll) {
            coll[key] += 1;
        } else {
            coll[key] = 1;
        }

        return coll;
    }, {});
}

class Error extends React.Component {
    render() {
        var classes = classnames(this.props.className, 'card');

        return (
            <div className={classes}>
                <strong>{this.props.error.message}</strong>
                <pre>
                    {this.props.error.stack}
                </pre>
            </div>
        )
    }
}

class Errors extends React.Component {
    render() {
        var errors = this.props.errors.map((error) => {
            return <Error error={error} />
        });

        return (
            <div className="well bs-component">
                <h4>Errors</h4>
                {errors}
            </div>
        )
    }
}

class Dashboard extends React.Component {
    constructor() {
        super();

        this.state = {
            sentChartData: {
                domainY: [0, 8],
                name: "Notifications Sent",
                yLabel: "Sent",
                color: "blue",
                data: []
            },
            errorsChartData: {
                domainY: [0, 20],
                name: "Notification errors",
                yLabel: "Errors",
                color: "red",
                data: []
            },
            errors: []
        }
    }

    render() {
        return (
            <div id="dashboard">
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12">
                            <h1>Scrutineer Notification Dashboard</h1>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <D3LineChart lineData={this.state.sentChartData} />
                    <D3LineChart lineData={this.state.errorsChartData} />
                </div>
                <div className="container">
                    <Errors errors={this.state.errors} />
                </div>
            </div>
        )
    }

    refreshDashboard() {
        jsonFetch(`${CONFIG.API_URL}/api/dashboard?since=${moment().subtract(5, 'minutes').startOf('minute').format()}`)
            .then((resp) => {
                let notificationsByDate = groupCreatedOn(resp.notifications),
                    notificationsChart = Object.keys(notificationsByDate).map((date) => {
                        return {
                            date: moment(date, "YYYYMMDDHHmm").toDate(),
                            count: notificationsByDate[date]
                        }
                    }),
                    errorsByDate = groupCreatedOn(resp.errors),
                    errorsChart = Object.keys(errorsByDate).map((date) => {
                        return {
                            date: moment(date, "YYYYMMDDHHmm").toDate(),
                            count: errorsByDate[date]
                        }
                    });


                this.setState({
                    sentChartData: {
                        domainY: [0, 8],
                        name: "Notifications Sent",
                        yLabel: "Sent",
                        color: "blue",
                        data: notificationsChart
                    },
                    errorsChartData: {
                        domainY: [0, 20],
                        name: "Notification errors",
                        yLabel: "Errors",
                        color: "red",
                        data: errorsChart
                    },
                    errors: resp.errors
                })
            });

        setTimeout(this.refreshDashboard.bind(this), DASHBOARD_REFRESH_RATE);
    }

    componentDidMount() {
        this.refreshDashboard()
    }
}

ReactDOM.render(<Dashboard/>, document.getElementById('dashboard-anchor'));