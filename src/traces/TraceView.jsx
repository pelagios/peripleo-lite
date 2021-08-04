import React, { Component } from 'react';

export default class TraceView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      allAnnotations: [],
      filteredAnnotations: [],
      showAll: false
    }
  }

  setAnnotationState(annotations, filter) {
    const filtered = filter ? 
      annotations.filter(filter) : annotations;

    this.setState({
      allAnnotations: annotations,
      filteredAnnotations: filtered
    }, () => {
      // Suspend updates while we're in showAll mode
      if (!this.state.showAll)
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

  /** 
   * Temporarily show all annotations, suspending change events, 
   * but keeping filters.
   */
  onShowAll = annotations => {  
    if (annotations) {
      this.setState({ showAll: true }, () =>
        this.props.onAnnotationsChanged(annotations));
    } else {
      this.setState({ showAll: false }, () => 
        this.props.onAnnotationsChanged(this.state.filteredAnnotations));
    }
  }

  render() {
    return React.Children.map(this.props.children, child =>
      React.cloneElement(child, { 
        onAnnotationsChanged: this.onAnnotationsChanged,
        onShowAll: this.onShowAll
      }));
  }

}