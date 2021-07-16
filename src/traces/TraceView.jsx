import React, { Component } from 'react';

export default class TraceView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      allAnnotations: [],
      filteredAnnotations: []
    }
  }

  setAnnotationState(annotations, filter) {
    const filtered = filter ? 
      annotations.filter(filter) : annotations;

    this.setState({
      allAnnotations: annotations,
      filteredAnnotations: filtered
    }, () => {
      this.props.onAnnotationsChanged(filtered);
    });
  } 
  
  componentWillReceiveProps(next) {
    if (this.props.filter !== next.filter)
      this.setAnnotationState(this.state.allAnnotations, next.filter);
  }

  onAnnotationsChanged = ({ enteredView, leftView }) => {
    const updatedAnnotations = [ 
      ...this.state.allAnnotations.filter(a => !leftView.includes(a)),
      ...enteredView
    ];

    this.setAnnotationState(updatedAnnotations, this.props.filter);
  }

  render() {
    return React.Children.map(this.props.children, child =>
      React.cloneElement(child, { 
        onAnnotationsChanged: this.onAnnotationsChanged 
      }));
  }

}