import React, { Component } from 'react';

export default class TraceView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      annotations: [],
      places: []
    }
  }

  onAnnotationsChanged = ({ intoView, outOfView }) => {
    const updatedAnnotations = [ 
      ...this.state.annotations.filter(a => !outOfView.includes(a)),
      ...intoView
    ];

    // Apply filter, if any
    const filtered = this.props.filter ? 
      updatedAnnotations.filter(this.props.filter) : updatedAnnotations;

    this.setState({ annotations: filtered }, () => {
      this.props.onAnnotationsChanged(filtered);
    });
  }

  render() {
    return React.Children.map(this.props.children, child =>
      React.cloneElement(child, { 
        onAnnotationsChanged: this.onAnnotationsChanged 
      }));
  }

}