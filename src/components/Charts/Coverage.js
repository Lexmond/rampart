    /*
 * Copyright (c) 2019 ARTIC Network http://artic.network
 * https://github.com/artic-network/rampart
 *
 * This file is part of RAMPART. RAMPART is free software: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version. RAMPART is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * See the GNU General Public License for more details. You should have received a copy of the GNU General Public License
 * along with RAMPART. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React from 'react';
import { select } from "d3-selection";
import {calcXScale, calcYScale, drawAxes} from "../../utils/commonFunctions";
import { max } from "d3-array";
import { drawSteps } from "../../d3/drawSteps";
import { drawGenomeAnnotation } from "../../d3/genomeAnnotation";
import { drawStream } from "../../d3/stream";
import Toggle from "../reusable/toggle";
import { getLogYAxis } from "../../utils/config";
import Container, {Title, HoverInfoBox} from "./styles";
import CenterHorizontally from "../reusable/CenterHorizontally";

/* given the DOM dimensions of the chart container, calculate the chart geometry (used by the SVG & D3) */
const calcChartGeom = (DOMRect) => ({
    width: DOMRect.width,
    height: DOMRect.height - 20, // title line
    spaceLeft: 60,
    spaceRight: 0,
    spaceBottom: 70,
    spaceTop: 10
});

const getMaxCoverage = (data) => {
    const trueMax = max(Object.keys(data).map((name) => data[name].maxCoverage));
    return (parseInt(trueMax / 50, 10) + 1) * 50;
};

class CoveragePlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {chartGeom: {}, showReferenceMatches: false, logScale: false};
        this.toggleReadDepthVsReferenceMatches = () => {
            this.setState({showReferenceMatches: !this.state.showReferenceMatches})
        }
    }
    redraw () {
        this.state.svg.selectAll("*").remove();
        const xScale = calcXScale(this.state.chartGeom, this.props.config.genome.length);
        const yScale = this.state.showReferenceMatches ?
            calcYScale(this.state.chartGeom, 100) :
            calcYScale(this.state.chartGeom, getMaxCoverage(this.props.coverage), {log: getLogYAxis(this.props.config)});
        const scales = {x: xScale, y: yScale};
        /* draw the axes & genome annotation*/
        const ySuffix = this.state.showReferenceMatches ? "%" : "x";
        drawAxes(this.state.svg, this.state.chartGeom, scales, {xSuffix: "bp", ySuffix});
        drawGenomeAnnotation(this.state.svg, this.state.chartGeom, scales, this.props.config.genome.genes, this.props.config.primers.amplicons, this.state.hoverSelection);
        const basesPerBin = this.props.config.genome.length / this.props.config.display.numCoverageBins;
        if (this.state.showReferenceMatches) {
          drawStream({
            svg: this.state.svg,
            scales,  
            stream: this.props.referenceStream,
            referencePanel: this.props.config.genome.referencePanel,
            hoverSelection: this.state.hoverSelection,
            basesPerBin
          }); 
        } else {
            const data = Object.keys(this.props.coverage)
                .filter((name) => name!=="all")
                .map((name) => ({
                    name,
                    xyValues: this.props.coverage[name].coverage.map((cov, idx) => [parseInt(idx*basesPerBin, 10), cov]),
                    colour: this.props.sampleColours[name] || "#FFFFFF"
                }));
            const hoverDisplayFunc = ({name, xValue, yValue}) => (`Sample: ${name}<br/>Pos: ${xValue}<br/>Depth: ${Math.round(yValue)}x`);
            drawSteps({
                svg: this.state.svg,
                chartGeom: this.state.chartGeom,
                scales,
                data,
                fillBelowLine: !!this.props.fillIn,
                hoverSelection: this.state.hoverSelection,
                hoverDisplayFunc
            });
        }
    }
    componentDidMount() {
        const svg = select(this.DOMref);
        const chartGeom = calcChartGeom(this.boundingDOMref.getBoundingClientRect());
        const hoverWidth = parseInt(chartGeom.width * 3/4, 10);
        const hoverSelection = select(this.infoRef);
        this.setState({svg, chartGeom, hoverWidth, hoverSelection});
    }
    componentDidUpdate() {
      this.redraw();
    }
    render() {
        return (
            <Container width={this.props.width} ref={(r) => {this.boundingDOMref = r}}>
                { !this.props.canShowReferenceMatches ? (
                    <Title>Read Depth</Title>
                ) : (
                    <CenterHorizontally>
                        <Toggle
                            labelLeft="depth"
                            labelRight="references"
                            handleToggle={this.toggleReadDepthVsReferenceMatches}
                            toggleOn={false}
                        />
                    </CenterHorizontally>
                )}
                <HoverInfoBox width={this.state.hoverWidth || 0} ref={(r) => {this.infoRef = r}}/>
                <svg
                    ref={(r) => {this.DOMref = r}}
                    height={this.state.chartGeom.height || 0}
                    width={this.state.chartGeom.width || 0}
                />
                {this.props.renderProp ? this.props.renderProp : null}
            </Container>
        )
    }
}

export default CoveragePlot;
