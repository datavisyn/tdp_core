import * as React from 'react';
import { Scatterplot } from './PlotlyScatterplot';
export class CustomVis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            xVals: props.xVals,
            yVals: props.yVals,
            type: props.type
        };
    }
    render() {
        let currentVisComponent = null;
        switch (this.state.type) {
            case "Chooser": {
                let currentVisComponent = React.createElement(Scatterplot, { xVals: this.props.xVals, yVals: this.props.yVals });
                break;
            }
            case "Scatterplot": {
                let currentVisComponent = React.createElement(Scatterplot, { xVals: this.props.xVals, yVals: this.props.yVals });
                break;
            }
            case "Bar Chart": {
                let currentVisComponent = React.createElement(Scatterplot, { xVals: this.props.xVals, yVals: this.props.yVals });
                break;
            }
        }
        return currentVisComponent;
    }
}
//# sourceMappingURL=demo.js.map